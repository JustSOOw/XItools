#!/bin/bash
# XItools 健康检查脚本
# 用于验证应用服务的健康状态

set -e

# 配置参数
DOMAIN="${DOMAIN:-xitools.furdow.com}"
PROTOCOL="${PROTOCOL:-https}"
TIMEOUT="${TIMEOUT:-30}"
MAX_RETRIES="${MAX_RETRIES:-5}"
RETRY_INTERVAL="${RETRY_INTERVAL:-10}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 检查URL是否可访问
check_url() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    log_info "检查 $description: $url"
    
    for i in $(seq 1 $MAX_RETRIES); do
        if response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null); then
            if [ "$response" = "$expected_status" ]; then
                log_success "$description 检查通过 (HTTP $response)"
                return 0
            else
                log_warning "$description 返回状态码: $response (期望: $expected_status)"
            fi
        else
            log_warning "$description 连接失败 (尝试 $i/$MAX_RETRIES)"
        fi
        
        if [ $i -lt $MAX_RETRIES ]; then
            sleep $RETRY_INTERVAL
        fi
    done
    
    log_error "$description 检查失败"
    return 1
}

# 检查JSON API响应
check_json_api() {
    local url=$1
    local description=$2
    local expected_field=$3
    
    log_info "检查 $description API: $url"
    
    for i in $(seq 1 $MAX_RETRIES); do
        if response=$(curl -s --connect-timeout $TIMEOUT "$url" 2>/dev/null); then
            if echo "$response" | jq -e ".$expected_field" >/dev/null 2>&1; then
                log_success "$description API 检查通过"
                return 0
            else
                log_warning "$description API 响应格式异常: $response"
            fi
        else
            log_warning "$description API 连接失败 (尝试 $i/$MAX_RETRIES)"
        fi
        
        if [ $i -lt $MAX_RETRIES ]; then
            sleep $RETRY_INTERVAL
        fi
    done
    
    log_error "$description API 检查失败"
    return 1
}

# 检查数据库连接
check_database() {
    log_info "检查数据库连接状态"
    
    if check_json_api "${PROTOCOL}://${DOMAIN}/api/health" "数据库连接" "database"; then
        return 0
    else
        return 1
    fi
}

# 检查MCP服务
check_mcp_service() {
    log_info "检查MCP服务状态"
    
    if check_json_api "${PROTOCOL}://${DOMAIN}/api/mcp/health" "MCP服务" "status"; then
        return 0
    else
        log_warning "MCP服务检查失败，但不影响主要功能"
        return 0  # MCP服务失败不应该导致整体健康检查失败
    fi
}

# 检查WebSocket连接
check_websocket() {
    log_info "检查WebSocket连接"
    
    # 使用websocat或其他工具检查WebSocket（如果可用）
    if command -v websocat >/dev/null 2>&1; then
        if timeout 10 websocat -n1 "wss://${DOMAIN}/socket.io/?EIO=4&transport=websocket" >/dev/null 2>&1; then
            log_success "WebSocket 连接检查通过"
            return 0
        else
            log_warning "WebSocket 连接检查失败"
            return 1
        fi
    else
        log_warning "未安装 websocat，跳过 WebSocket 检查"
        return 0
    fi
}

# 检查SSL证书
check_ssl_certificate() {
    if [ "$PROTOCOL" = "https" ]; then
        log_info "检查SSL证书状态"
        
        if cert_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null); then
            expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
            expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$expiry_date" +%s 2>/dev/null)
            current_timestamp=$(date +%s)
            days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ $days_until_expiry -gt 30 ]; then
                log_success "SSL证书有效，还有 $days_until_expiry 天到期"
                return 0
            elif [ $days_until_expiry -gt 0 ]; then
                log_warning "SSL证书即将到期，还有 $days_until_expiry 天"
                return 0
            else
                log_error "SSL证书已过期"
                return 1
            fi
        else
            log_error "无法获取SSL证书信息"
            return 1
        fi
    else
        log_info "跳过SSL证书检查（使用HTTP协议）"
        return 0
    fi
}

# 性能检查
check_performance() {
    log_info "检查应用性能"
    
    local start_time=$(date +%s%N)
    if check_url "${PROTOCOL}://${DOMAIN}/" "首页加载"; then
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 ))  # 转换为毫秒
        
        if [ $duration -lt 3000 ]; then
            log_success "首页响应时间: ${duration}ms (良好)"
        elif [ $duration -lt 5000 ]; then
            log_warning "首页响应时间: ${duration}ms (一般)"
        else
            log_warning "首页响应时间: ${duration}ms (较慢)"
        fi
        return 0
    else
        return 1
    fi
}

# 主健康检查函数
main_health_check() {
    log_info "开始 XItools 健康检查..."
    log_info "目标域名: $DOMAIN"
    log_info "协议: $PROTOCOL"
    echo ""
    
    local failed_checks=0
    local total_checks=0
    
    # 基础连通性检查
    ((total_checks++))
    if ! check_url "${PROTOCOL}://${DOMAIN}/" "前端应用"; then
        ((failed_checks++))
    fi
    
    ((total_checks++))
    if ! check_url "${PROTOCOL}://${DOMAIN}/api/health" "后端API"; then
        ((failed_checks++))
    fi
    
    # 数据库检查
    ((total_checks++))
    if ! check_database; then
        ((failed_checks++))
    fi
    
    # MCP服务检查
    ((total_checks++))
    if ! check_mcp_service; then
        ((failed_checks++))
    fi
    
    # WebSocket检查
    ((total_checks++))
    if ! check_websocket; then
        ((failed_checks++))
    fi
    
    # SSL证书检查
    ((total_checks++))
    if ! check_ssl_certificate; then
        ((failed_checks++))
    fi
    
    # 性能检查
    ((total_checks++))
    if ! check_performance; then
        ((failed_checks++))
    fi
    
    echo ""
    log_info "健康检查完成"
    log_info "总检查项: $total_checks"
    log_info "失败项: $failed_checks"
    
    if [ $failed_checks -eq 0 ]; then
        log_success "🎉 所有健康检查通过！"
        return 0
    elif [ $failed_checks -le 2 ]; then
        log_warning "⚠️  部分检查失败，但应用基本可用"
        return 0
    else
        log_error "❌ 多项检查失败，应用可能存在问题"
        return 1
    fi
}

# 显示帮助信息
show_help() {
    echo "XItools 健康检查脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -d, --domain DOMAIN     目标域名 (默认: xitools.furdow.com)"
    echo "  -p, --protocol PROTOCOL 协议 (http|https, 默认: https)"
    echo "  -t, --timeout TIMEOUT   连接超时时间 (默认: 30秒)"
    echo "  -r, --retries RETRIES   重试次数 (默认: 5)"
    echo "  -i, --interval INTERVAL 重试间隔 (默认: 10秒)"
    echo "  -h, --help              显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                                    # 使用默认配置"
    echo "  $0 -d localhost -p http               # 检查本地HTTP服务"
    echo "  $0 -t 60 -r 3                        # 自定义超时和重试"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -p|--protocol)
            PROTOCOL="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -r|--retries)
            MAX_RETRIES="$2"
            shift 2
            ;;
        -i|--interval)
            RETRY_INTERVAL="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查必需的工具
if ! command -v curl >/dev/null 2>&1; then
    log_error "curl 未安装，请先安装 curl"
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    log_warning "jq 未安装，某些API检查可能不准确"
fi

# 执行主健康检查
main_health_check
