#!/bin/bash
# XItools 备份脚本
# 用于创建数据库和应用数据的备份

set -e

# 配置参数
SERVER_HOST="${SERVER_HOST:-8.140.237.185}"
SERVER_USER="${SERVER_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/xitools}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_TYPE="${BACKUP_TYPE:-full}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# 检查SSH连接
check_ssh_connection() {
    log_info "检查SSH连接到 $SERVER_USER@$SERVER_HOST..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" "echo 'SSH连接正常'" >/dev/null 2>&1; then
        log_success "SSH连接正常"
        return 0
    else
        log_error "SSH连接失败！请检查SSH配置"
        return 1
    fi
}

# 创建备份目录
create_backup_directory() {
    local backup_date=$(date +%Y%m%d-%H%M%S)
    local backup_dir="backup-${backup_date}"
    
    log_step "创建备份目录: $backup_dir"
    
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
mkdir -p $DEPLOY_PATH/shared/backups/$backup_dir
echo "$backup_dir"
EOF
}

# 备份数据库
backup_database() {
    local backup_dir="$1"
    
    log_step "备份数据库..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
cd $DEPLOY_PATH

# 检查数据库容器是否运行
if ! docker ps | grep -q postgres; then
    echo "❌ PostgreSQL 容器未运行"
    exit 1
fi

# 获取数据库配置
DB_USER=\$(docker exec xitools-postgres env | grep POSTGRES_USER | cut -d'=' -f2)
DB_NAME=\$(docker exec xitools-postgres env | grep POSTGRES_DB | cut -d'=' -f2)

if [ -z "\$DB_USER" ] || [ -z "\$DB_NAME" ]; then
    echo "❌ 无法获取数据库配置"
    exit 1
fi

echo "📊 备份数据库: \$DB_NAME (用户: \$DB_USER)"

# 创建数据库备份
BACKUP_FILE="shared/backups/$backup_dir/database.sql"
if docker exec xitools-postgres pg_dump -U "\$DB_USER" "\$DB_NAME" > "\$BACKUP_FILE"; then
    echo "✅ 数据库备份完成"
    echo "备份文件: \$BACKUP_FILE"
    echo "文件大小: \$(du -h "\$BACKUP_FILE" | cut -f1)"
else
    echo "❌ 数据库备份失败"
    exit 1
fi

# 创建数据库结构备份（仅结构，无数据）
SCHEMA_FILE="shared/backups/$backup_dir/database-schema.sql"
if docker exec xitools-postgres pg_dump -U "\$DB_USER" -s "\$DB_NAME" > "\$SCHEMA_FILE"; then
    echo "✅ 数据库结构备份完成"
else
    echo "⚠️ 数据库结构备份失败"
fi
EOF
    
    if [ $? -eq 0 ]; then
        log_success "数据库备份完成"
    else
        log_error "数据库备份失败"
        return 1
    fi
}

# 备份应用数据
backup_application_data() {
    local backup_dir="$1"
    
    log_step "备份应用数据..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
cd $DEPLOY_PATH

echo "📁 备份应用数据..."

# 备份配置文件
echo "备份配置文件..."
mkdir -p shared/backups/$backup_dir/config
cp -r current/*.yml shared/backups/$backup_dir/config/ 2>/dev/null || true
cp -r current/.env* shared/backups/$backup_dir/config/ 2>/dev/null || true
cp -r nginx/ shared/backups/$backup_dir/config/ 2>/dev/null || true

# 备份应用数据目录
if [ -d "shared/data" ]; then
    echo "备份应用数据目录..."
    cp -r shared/data shared/backups/$backup_dir/
fi

# 备份日志文件（最近7天）
if [ -d "shared/logs" ]; then
    echo "备份日志文件..."
    mkdir -p shared/backups/$backup_dir/logs
    find shared/logs -name "*.log" -mtime -7 -exec cp {} shared/backups/$backup_dir/logs/ \; 2>/dev/null || true
fi

# 备份 Docker Compose 文件
echo "备份 Docker 配置..."
cp current/docker-compose.prod.yml shared/backups/$backup_dir/docker-compose.yml 2>/dev/null || true

# 创建备份信息文件
cat > shared/backups/$backup_dir/backup-info.txt << 'BACKUP_INFO'
备份信息
========
备份时间: $(date)
备份类型: $BACKUP_TYPE
服务器: $(hostname)
当前版本: $(readlink current | sed 's|releases/||')
Docker 镜像:
$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}" | grep xitools)

系统信息:
$(uname -a)
$(df -h)
$(free -h)
BACKUP_INFO

echo "✅ 应用数据备份完成"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "应用数据备份完成"
    else
        log_error "应用数据备份失败"
        return 1
    fi
}

# 压缩备份
compress_backup() {
    local backup_dir="$1"
    
    log_step "压缩备份文件..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
cd $DEPLOY_PATH/shared/backups

echo "🗜️ 压缩备份目录: $backup_dir"

# 创建压缩文件
if tar -czf "${backup_dir}.tar.gz" "$backup_dir"; then
    echo "✅ 备份压缩完成: ${backup_dir}.tar.gz"
    echo "压缩文件大小: \$(du -h "${backup_dir}.tar.gz" | cut -f1)"
    
    # 删除原始目录
    rm -rf "$backup_dir"
    echo "🧹 清理原始备份目录"
else
    echo "❌ 备份压缩失败"
    exit 1
fi
EOF
    
    if [ $? -eq 0 ]; then
        log_success "备份压缩完成"
    else
        log_error "备份压缩失败"
        return 1
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log_step "清理旧备份文件..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
cd $DEPLOY_PATH/shared/backups

echo "🧹 清理 $BACKUP_RETENTION_DAYS 天前的备份文件..."

# 删除旧的备份文件
find . -name "backup-*.tar.gz" -mtime +$BACKUP_RETENTION_DAYS -delete

# 显示剩余备份文件
echo "剩余备份文件:"
ls -lah backup-*.tar.gz 2>/dev/null || echo "无备份文件"

# 显示磁盘使用情况
echo "备份目录磁盘使用:"
du -sh . 2>/dev/null || echo "无法获取磁盘使用信息"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "旧备份清理完成"
    else
        log_warning "旧备份清理失败"
    fi
}

# 验证备份
verify_backup() {
    local backup_file="$1"
    
    log_step "验证备份文件..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
cd $DEPLOY_PATH/shared/backups

echo "🔍 验证备份文件: $backup_file"

# 检查文件是否存在
if [ ! -f "$backup_file" ]; then
    echo "❌ 备份文件不存在"
    exit 1
fi

# 检查文件大小
FILE_SIZE=\$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
if [ "\$FILE_SIZE" -lt 1024 ]; then
    echo "❌ 备份文件过小，可能损坏"
    exit 1
fi

# 测试压缩文件完整性
if tar -tzf "$backup_file" >/dev/null 2>&1; then
    echo "✅ 备份文件完整性验证通过"
else
    echo "❌ 备份文件损坏"
    exit 1
fi

# 显示备份内容
echo "📋 备份文件内容:"
tar -tzf "$backup_file" | head -20
if [ \$(tar -tzf "$backup_file" | wc -l) -gt 20 ]; then
    echo "... 还有更多文件"
fi
EOF
    
    if [ $? -eq 0 ]; then
        log_success "备份验证通过"
    else
        log_error "备份验证失败"
        return 1
    fi
}

# 发送备份通知
send_notification() {
    local backup_file="$1"
    local status="$2"
    
    log_step "发送备份通知..."
    
    if [ "$status" = "success" ]; then
        MESSAGE="✅ XItools 备份成功完成\n备份文件: $backup_file\n备份时间: $(date)\n备份类型: $BACKUP_TYPE"
    else
        MESSAGE="❌ XItools 备份失败\n备份时间: $(date)\n备份类型: $BACKUP_TYPE"
    fi
    
    echo -e "$MESSAGE"
    
    # 如果配置了通知 URL，发送通知
    if [ -n "$NOTIFICATION_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$MESSAGE\"}" \
            "$NOTIFICATION_WEBHOOK" >/dev/null 2>&1 || log_warning "通知发送失败"
    fi
}

# 显示帮助信息
show_help() {
    echo "XItools 备份脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --host HOST         服务器地址 (默认: 8.140.237.185)"
    echo "  -u, --user USER         服务器用户 (默认: root)"
    echo "  -p, --path PATH         部署路径 (默认: /opt/xitools)"
    echo "  -t, --type TYPE         备份类型 (full|database|config, 默认: full)"
    echo "  -r, --retention DAYS    备份保留天数 (默认: 30)"
    echo "  --no-compress           不压缩备份文件"
    echo "  --no-cleanup            不清理旧备份"
    echo "  --help                  显示此帮助信息"
    echo ""
    echo "备份类型说明:"
    echo "  full      - 完整备份（数据库 + 应用数据 + 配置）"
    echo "  database  - 仅备份数据库"
    echo "  config    - 仅备份配置文件"
    echo ""
    echo "示例:"
    echo "  $0                                    # 完整备份"
    echo "  $0 -t database                       # 仅备份数据库"
    echo "  $0 -r 7                              # 保留7天的备份"
    echo "  $0 --no-compress                     # 不压缩备份"
}

# 主函数
main() {
    log_info "XItools 备份工具启动"
    log_info "备份类型: $BACKUP_TYPE"
    log_info "目标服务器: $SERVER_USER@$SERVER_HOST"
    echo ""
    
    # 检查SSH连接
    if ! check_ssh_connection; then
        exit 1
    fi
    
    # 创建备份目录
    local backup_dir
    backup_dir=$(create_backup_directory)
    if [ $? -ne 0 ]; then
        log_error "创建备份目录失败"
        exit 1
    fi
    
    log_info "备份目录: $backup_dir"
    
    # 根据备份类型执行相应操作
    case "$BACKUP_TYPE" in
        "full")
            backup_database "$backup_dir"
            backup_application_data "$backup_dir"
            ;;
        "database")
            backup_database "$backup_dir"
            ;;
        "config")
            backup_application_data "$backup_dir"
            ;;
        *)
            log_error "未知的备份类型: $BACKUP_TYPE"
            exit 1
            ;;
    esac
    
    # 压缩备份
    if [ "$COMPRESS_BACKUP" = "true" ]; then
        compress_backup "$backup_dir"
        backup_file="${backup_dir}.tar.gz"
    else
        backup_file="$backup_dir"
    fi
    
    # 验证备份
    if [ "$COMPRESS_BACKUP" = "true" ]; then
        verify_backup "$backup_file"
    fi
    
    # 清理旧备份
    if [ "$CLEANUP_OLD" = "true" ]; then
        cleanup_old_backups
    fi
    
    # 发送通知
    send_notification "$backup_file" "success"
    
    echo ""
    log_success "🎉 备份操作完成！"
    log_info "备份文件: $backup_file"
    log_info "备份位置: $SERVER_HOST:$DEPLOY_PATH/shared/backups/"
}

# 解析命令行参数
COMPRESS_BACKUP=true
CLEANUP_OLD=true

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            SERVER_HOST="$2"
            shift 2
            ;;
        -u|--user)
            SERVER_USER="$2"
            shift 2
            ;;
        -p|--path)
            DEPLOY_PATH="$2"
            shift 2
            ;;
        -t|--type)
            BACKUP_TYPE="$2"
            shift 2
            ;;
        -r|--retention)
            BACKUP_RETENTION_DAYS="$2"
            shift 2
            ;;
        --no-compress)
            COMPRESS_BACKUP=false
            shift
            ;;
        --no-cleanup)
            CLEANUP_OLD=false
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 验证备份类型
if [[ ! "$BACKUP_TYPE" =~ ^(full|database|config)$ ]]; then
    log_error "无效的备份类型: $BACKUP_TYPE"
    show_help
    exit 1
fi

# 执行主函数
main
