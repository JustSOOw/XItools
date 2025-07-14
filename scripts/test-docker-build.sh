#!/bin/bash

# XItools Docker构建测试脚本
# 用于验证CI/CD构建问题修复

set -e

echo "🚀 XItools Docker构建测试"
echo "=========================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查Docker是否运行
check_docker() {
    log_info "检查Docker环境..."
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker未运行，请启动Docker Desktop"
        exit 1
    fi
    log_success "Docker环境正常"
}

# 清理旧镜像
cleanup_images() {
    log_info "清理旧的测试镜像..."
    docker rmi xitools-frontend:test 2>/dev/null || true
    docker rmi xitools-backend:test 2>/dev/null || true
    log_success "镜像清理完成"
}

# 测试前端构建
test_frontend_build() {
    log_info "测试前端Docker构建（Web版本）..."
    
    cd frontend
    
    # 检查必要文件
    if [[ ! -f "package.docker.json" ]]; then
        log_error "缺少 package.docker.json 文件"
        return 1
    fi
    
    if [[ ! -f "tsconfig.web.json" ]]; then
        log_error "缺少 tsconfig.web.json 文件"
        return 1
    fi
    
    # 构建镜像
    if docker build -t xitools-frontend:test . --target production; then
        log_success "前端Docker构建成功"
        
        # 检查镜像大小
        SIZE=$(docker images xitools-frontend:test --format "table {{.Size}}" | tail -n 1)
        log_info "前端镜像大小: $SIZE"
        
        return 0
    else
        log_error "前端Docker构建失败"
        return 1
    fi
    
    cd ..
}

# 测试后端构建
test_backend_build() {
    log_info "测试后端Docker构建..."
    
    cd backend
    
    # 构建镜像
    if docker build -t xitools-backend:test . --target production; then
        log_success "后端Docker构建成功"
        
        # 检查镜像大小
        SIZE=$(docker images xitools-backend:test --format "table {{.Size}}" | tail -n 1)
        log_info "后端镜像大小: $SIZE"
        
        return 0
    else
        log_error "后端Docker构建失败"
        return 1
    fi
    
    cd ..
}

# 验证镜像
verify_images() {
    log_info "验证构建的镜像..."
    
    # 检查前端镜像
    if docker run --rm xitools-frontend:test nginx -t; then
        log_success "前端镜像配置验证通过"
    else
        log_warning "前端镜像配置验证失败"
    fi
    
    # 显示镜像信息
    echo ""
    log_info "构建的镜像列表:"
    docker images | grep xitools | grep test
}

# 主函数
main() {
    echo "开始时间: $(date)"
    echo ""
    
    # 检查当前目录
    if [[ ! -f "package.json" ]] || [[ ! -d "frontend" ]] || [[ ! -d "backend" ]]; then
        log_error "请在XItools项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行测试步骤
    check_docker
    cleanup_images
    
    FRONTEND_SUCCESS=0
    BACKEND_SUCCESS=0
    
    # 测试前端构建
    if test_frontend_build; then
        FRONTEND_SUCCESS=1
    fi
    
    # 测试后端构建
    if test_backend_build; then
        BACKEND_SUCCESS=1
    fi
    
    # 验证镜像
    if [[ $FRONTEND_SUCCESS -eq 1 ]] || [[ $BACKEND_SUCCESS -eq 1 ]]; then
        verify_images
    fi
    
    # 总结
    echo ""
    echo "=========================="
    log_info "构建测试总结:"
    
    if [[ $FRONTEND_SUCCESS -eq 1 ]]; then
        log_success "前端构建: 成功"
    else
        log_error "前端构建: 失败"
    fi
    
    if [[ $BACKEND_SUCCESS -eq 1 ]]; then
        log_success "后端构建: 成功"
    else
        log_error "后端构建: 失败"
    fi
    
    echo "结束时间: $(date)"
    
    # 返回结果
    if [[ $FRONTEND_SUCCESS -eq 1 ]] && [[ $BACKEND_SUCCESS -eq 1 ]]; then
        log_success "所有构建测试通过！CI/CD应该能正常工作"
        exit 0
    else
        log_error "部分构建测试失败，需要进一步修复"
        exit 1
    fi
}

# 运行主函数
main "$@"
