#!/bin/bash

# XItools 部署验证脚本
# 用于验证三个环境的部署状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 环境配置
PRODUCTION_URL="https://xitools.furdow.com"
STAGING_URL="http://xitools.furdow.com:8081"

# 服务器配置
SERVER_HOST="8.140.237.185"
SERVER_USER="root"

echo -e "${BLUE}🚀 XItools 双环境部署状态验证${NC}"
echo "=================================="

# 函数：检查URL可访问性
check_url() {
    local url=$1
    local name=$2
    
    echo -n "检查 $name ($url)... "
    
    if curl -f -s --connect-timeout 10 --max-time 30 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        return 1
    fi
}

# 函数：检查API健康状态
check_api_health() {
    local url=$1
    local name=$2
    
    echo -n "检查 $name API 健康状态... "
    
    local health_url="${url}/health"
    if curl -f -s --connect-timeout 10 --max-time 30 "$health_url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 健康${NC}"
        return 0
    else
        echo -e "${RED}❌ 不健康${NC}"
        return 1
    fi
}

# 函数：检查服务器上的Docker服务
check_docker_services() {
    local env_path=$1
    local name=$2
    
    echo -n "检查 $name Docker 服务状态... "
    
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
        "cd $env_path/current && docker-compose -f docker-compose.prod.yml ps --services --filter status=running" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 运行中${NC}"
        return 0
    else
        echo -e "${RED}❌ 异常${NC}"
        return 1
    fi
}

# 主要检查流程
main() {
    local total_checks=0
    local passed_checks=0
    
    echo -e "\n${YELLOW}📊 前端访问检查${NC}"
    echo "------------------------"
    
    # 检查前端访问
    if check_url "$PRODUCTION_URL" "生产环境"; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    if check_url "$STAGING_URL" "预生产环境"; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    echo -e "\n${YELLOW}🏥 API 健康检查${NC}"
    echo "------------------------"
    
    # 检查API健康状态
    if check_api_health "$PRODUCTION_URL" "生产环境"; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    if check_api_health "$STAGING_URL" "预生产环境"; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    echo -e "\n${YELLOW}🐳 Docker 服务检查${NC}"
    echo "------------------------"
    
    # 检查Docker服务状态
    if check_docker_services "/opt/xitools" "生产环境"; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    if check_docker_services "/opt/xitools-staging" "预生产环境"; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    # 显示总结
    echo -e "\n${BLUE}📋 检查总结${NC}"
    echo "=========================="
    echo "总检查项: $total_checks"
    echo "通过检查: $passed_checks"
    echo "失败检查: $((total_checks - passed_checks))"
    
    if [ $passed_checks -eq $total_checks ]; then
        echo -e "\n${GREEN}🎉 所有检查通过！部署状态良好。${NC}"
        exit 0
    else
        echo -e "\n${RED}⚠️  部分检查失败，请检查相关服务。${NC}"
        exit 1
    fi
}

# 显示使用帮助
show_help() {
    echo "XItools 部署验证脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -q, --quick    快速检查（仅检查前端访问）"
    echo ""
    echo "环境地址:"
    echo "  生产环境:     $PRODUCTION_URL"
    echo "  预生产环境:   $STAGING_URL"
}

# 快速检查模式
quick_check() {
    echo -e "${BLUE}🚀 XItools 快速部署检查${NC}"
    echo "=================================="
    
    local passed=0
    local total=2

    if check_url "$PRODUCTION_URL" "生产环境"; then
        ((passed++))
    fi

    if check_url "$STAGING_URL" "预生产环境"; then
        ((passed++))
    fi
    
    echo -e "\n快速检查结果: $passed/$total 通过"
    
    if [ $passed -eq $total ]; then
        echo -e "${GREEN}✅ 所有环境可访问${NC}"
        exit 0
    else
        echo -e "${RED}❌ 部分环境不可访问${NC}"
        exit 1
    fi
}

# 参数处理
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -q|--quick)
        quick_check
        ;;
    "")
        main
        ;;
    *)
        echo "未知选项: $1"
        echo "使用 -h 或 --help 查看帮助"
        exit 1
        ;;
esac
