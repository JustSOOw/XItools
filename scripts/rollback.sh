#!/bin/bash
# XItools 回滚脚本
# 用于快速回滚到上一个稳定版本

set -e

# 配置参数
SERVER_HOST="${SERVER_HOST:-8.140.237.185}"
SERVER_USER="${SERVER_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/xitools}"
BACKUP_COUNT="${BACKUP_COUNT:-5}"

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
        log_error "SSH连接失败！请检查："
        echo "  1. 服务器地址是否正确"
        echo "  2. SSH密钥是否配置正确"
        echo "  3. 服务器是否可达"
        return 1
    fi
}

# 获取可用版本列表
get_available_versions() {
    log_info "获取可用版本列表..."
    
    local versions
    versions=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $DEPLOY_PATH/releases && ls -t" 2>/dev/null || echo "")
    
    if [ -z "$versions" ]; then
        log_error "未找到任何可用版本"
        return 1
    fi
    
    echo "$versions"
}

# 获取当前版本
get_current_version() {
    local current_version
    current_version=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $DEPLOY_PATH && readlink current" 2>/dev/null | sed 's|releases/||' || echo "")
    
    if [ -z "$current_version" ]; then
        log_warning "无法确定当前版本"
        return 1
    fi
    
    echo "$current_version"
}

# 显示版本列表
show_versions() {
    local versions="$1"
    local current_version="$2"
    
    echo ""
    log_info "可用版本列表："
    echo "----------------------------------------"
    
    local index=1
    while IFS= read -r version; do
        if [ "$version" = "$current_version" ]; then
            echo -e "${GREEN}  $index. $version (当前版本)${NC}"
        else
            echo "  $index. $version"
        fi
        ((index++))
    done <<< "$versions"
    
    echo "----------------------------------------"
}

# 选择回滚版本
select_rollback_version() {
    local versions="$1"
    local current_version="$2"
    local target_version=""
    
    if [ "$INTERACTIVE" = "true" ]; then
        echo ""
        read -p "请选择要回滚到的版本 (输入序号或版本名): " selection
        
        if [[ "$selection" =~ ^[0-9]+$ ]]; then
            # 按序号选择
            target_version=$(echo "$versions" | sed -n "${selection}p")
        else
            # 按版本名选择
            if echo "$versions" | grep -q "^$selection$"; then
                target_version="$selection"
            fi
        fi
    else
        # 自动选择上一个版本
        target_version=$(echo "$versions" | sed -n '2p')
    fi
    
    if [ -z "$target_version" ]; then
        log_error "无效的版本选择"
        return 1
    fi
    
    if [ "$target_version" = "$current_version" ]; then
        log_error "不能回滚到当前版本"
        return 1
    fi
    
    echo "$target_version"
}

# 创建数据库备份
create_database_backup() {
    log_step "创建数据库备份..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
cd /opt/xitools
if [ -f current/docker-compose.prod.yml ]; then
    BACKUP_FILE="shared/backups/rollback-backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "创建数据库备份: $BACKUP_FILE"
    
    if docker-compose -f current/docker-compose.prod.yml exec -T postgres pg_dump -U xitools_user xitools > "$BACKUP_FILE"; then
        echo "✅ 数据库备份完成: $BACKUP_FILE"
    else
        echo "❌ 数据库备份失败"
        exit 1
    fi
else
    echo "⚠️ 未找到当前部署，跳过数据库备份"
fi
EOF
    
    if [ $? -eq 0 ]; then
        log_success "数据库备份完成"
    else
        log_error "数据库备份失败"
        return 1
    fi
}

# 执行回滚
perform_rollback() {
    local target_version="$1"
    
    log_step "开始回滚到版本: $target_version"
    
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
cd $DEPLOY_PATH

echo "🔄 开始回滚操作..."

# 检查目标版本是否存在
if [ ! -d "releases/$target_version" ]; then
    echo "❌ 目标版本不存在: $target_version"
    exit 1
fi

# 停止当前服务
if [ -f current/docker-compose.prod.yml ]; then
    echo "⏹️ 停止当前服务..."
    docker-compose -f current/docker-compose.prod.yml down --timeout 30
    
    if [ \$? -ne 0 ]; then
        echo "⚠️ 停止服务时出现警告，继续回滚..."
    fi
else
    echo "⚠️ 未找到当前服务配置"
fi

# 切换到目标版本
echo "🔄 切换到版本: $target_version"
ln -sfn releases/$target_version current

# 启动服务
cd current
echo "🚀 启动服务..."

# 拉取镜像（如果需要）
if [ -f docker-compose.prod.yml ]; then
    docker-compose -f docker-compose.prod.yml pull --quiet
    
    # 启动服务
    docker-compose -f docker-compose.prod.yml up -d
    
    if [ \$? -eq 0 ]; then
        echo "✅ 服务启动成功"
    else
        echo "❌ 服务启动失败"
        exit 1
    fi
else
    echo "❌ 未找到 docker-compose.prod.yml 文件"
    exit 1
fi

echo "✅ 回滚完成"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "回滚操作完成"
    else
        log_error "回滚操作失败"
        return 1
    fi
}

# 验证回滚结果
verify_rollback() {
    local target_version="$1"
    
    log_step "验证回滚结果..."
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    local service_status
    service_status=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $DEPLOY_PATH/current && docker-compose -f docker-compose.prod.yml ps --services --filter status=running" 2>/dev/null || echo "")
    
    if [ -n "$service_status" ]; then
        log_success "服务运行正常"
    else
        log_warning "服务状态检查异常"
    fi
    
    # 检查当前版本
    local current_version
    current_version=$(get_current_version)
    
    if [ "$current_version" = "$target_version" ]; then
        log_success "版本切换成功: $target_version"
    else
        log_error "版本切换失败，当前版本: $current_version"
        return 1
    fi
    
    # 健康检查
    if [ -f "scripts/health-check.sh" ]; then
        log_info "执行健康检查..."
        if bash scripts/health-check.sh -t 10 -r 3; then
            log_success "健康检查通过"
        else
            log_warning "健康检查失败，但回滚已完成"
        fi
    fi
}

# 清理操作
cleanup() {
    log_step "执行清理操作..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
cd $DEPLOY_PATH

# 清理未使用的Docker镜像
echo "🧹 清理未使用的Docker镜像..."
docker image prune -f >/dev/null 2>&1

# 保留最近的版本
cd releases
echo "🧹 清理旧版本（保留最近 $BACKUP_COUNT 个）..."
ls -t | tail -n +$((BACKUP_COUNT + 1)) | xargs -r rm -rf

echo "✅ 清理完成"
EOF
    
    log_success "清理操作完成"
}

# 显示帮助信息
show_help() {
    echo "XItools 回滚脚本"
    echo ""
    echo "用法: $0 [选项] [版本]"
    echo ""
    echo "选项:"
    echo "  -h, --host HOST         服务器地址 (默认: 8.140.237.185)"
    echo "  -u, --user USER         服务器用户 (默认: root)"
    echo "  -p, --path PATH         部署路径 (默认: /opt/xitools)"
    echo "  -i, --interactive       交互式选择版本"
    echo "  -y, --yes               自动确认所有操作"
    echo "  --no-backup             跳过数据库备份"
    echo "  --no-cleanup            跳过清理操作"
    echo "  --help                  显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                                    # 自动回滚到上一版本"
    echo "  $0 -i                                 # 交互式选择版本"
    echo "  $0 20250110-143022-abc123             # 回滚到指定版本"
    echo "  $0 -h 192.168.1.100 -u deploy        # 指定服务器和用户"
}

# 主函数
main() {
    log_info "XItools 回滚工具启动"
    echo ""
    
    # 检查SSH连接
    if ! check_ssh_connection; then
        exit 1
    fi
    
    # 获取版本信息
    local versions current_version target_version
    
    versions=$(get_available_versions)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    current_version=$(get_current_version)
    if [ $? -ne 0 ]; then
        log_warning "无法确定当前版本，继续执行..."
        current_version="unknown"
    fi
    
    log_info "当前版本: $current_version"
    
    # 显示版本列表
    show_versions "$versions" "$current_version"
    
    # 选择目标版本
    if [ -n "$TARGET_VERSION" ]; then
        # 命令行指定版本
        if echo "$versions" | grep -q "^$TARGET_VERSION$"; then
            target_version="$TARGET_VERSION"
        else
            log_error "指定的版本不存在: $TARGET_VERSION"
            exit 1
        fi
    else
        # 选择版本
        target_version=$(select_rollback_version "$versions" "$current_version")
        if [ $? -ne 0 ]; then
            exit 1
        fi
    fi
    
    log_info "目标版本: $target_version"
    
    # 确认操作
    if [ "$AUTO_CONFIRM" != "true" ]; then
        echo ""
        read -p "确认回滚到版本 $target_version? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            log_info "回滚操作已取消"
            exit 0
        fi
    fi
    
    echo ""
    log_info "开始回滚操作..."
    
    # 创建数据库备份
    if [ "$SKIP_BACKUP" != "true" ]; then
        create_database_backup
    fi
    
    # 执行回滚
    perform_rollback "$target_version"
    
    # 验证回滚结果
    verify_rollback "$target_version"
    
    # 清理操作
    if [ "$SKIP_CLEANUP" != "true" ]; then
        cleanup
    fi
    
    echo ""
    log_success "🎉 回滚操作完成！"
    log_info "当前版本: $target_version"
    log_info "应用地址: https://xitools.furdow.com"
}

# 解析命令行参数
INTERACTIVE=false
AUTO_CONFIRM=false
SKIP_BACKUP=false
SKIP_CLEANUP=false
TARGET_VERSION=""

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
        -i|--interactive)
            INTERACTIVE=true
            shift
            ;;
        -y|--yes)
            AUTO_CONFIRM=true
            shift
            ;;
        --no-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --no-cleanup)
            SKIP_CLEANUP=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        -*)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
        *)
            TARGET_VERSION="$1"
            shift
            ;;
    esac
done

# 执行主函数
main
