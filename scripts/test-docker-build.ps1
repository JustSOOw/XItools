# XItools Docker构建测试脚本 (PowerShell版本)
# 用于验证CI/CD构建问题修复

param(
    [switch]$Cleanup = $false
)

# 设置错误处理
$ErrorActionPreference = "Stop"

Write-Host "🚀 XItools Docker构建测试" -ForegroundColor Blue
Write-Host "==========================" -ForegroundColor Blue

# 日志函数
function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# 检查Docker是否运行
function Test-Docker {
    Write-Info "检查Docker环境..."
    try {
        docker info | Out-Null
        Write-Success "Docker环境正常"
        return $true
    }
    catch {
        Write-Error "Docker未运行，请启动Docker Desktop"
        return $false
    }
}

# 清理旧镜像
function Remove-TestImages {
    Write-Info "清理旧的测试镜像..."
    try {
        docker rmi xitools-frontend:test 2>$null
        docker rmi xitools-backend:test 2>$null
    }
    catch {
        # 忽略错误，镜像可能不存在
    }
    Write-Success "镜像清理完成"
}

# 测试前端构建
function Test-FrontendBuild {
    Write-Info "测试前端Docker构建（Web版本）..."
    
    Push-Location frontend
    
    try {
        # 检查必要文件
        if (-not (Test-Path "package.docker.json")) {
            Write-Error "缺少 package.docker.json 文件"
            return $false
        }
        
        if (-not (Test-Path "tsconfig.web.json")) {
            Write-Error "缺少 tsconfig.web.json 文件"
            return $false
        }
        
        # 构建镜像
        Write-Info "开始构建前端镜像..."
        docker build -t xitools-frontend:test . --target production
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "前端Docker构建成功"
            
            # 检查镜像大小
            $size = docker images xitools-frontend:test --format "{{.Size}}"
            Write-Info "前端镜像大小: $size"
            
            return $true
        }
        else {
            Write-Error "前端Docker构建失败"
            return $false
        }
    }
    catch {
        Write-Error "前端构建过程中发生错误: $($_.Exception.Message)"
        return $false
    }
    finally {
        Pop-Location
    }
}

# 测试后端构建
function Test-BackendBuild {
    Write-Info "测试后端Docker构建..."
    
    Push-Location backend
    
    try {
        # 构建镜像
        Write-Info "开始构建后端镜像..."
        docker build -t xitools-backend:test . --target production
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "后端Docker构建成功"
            
            # 检查镜像大小
            $size = docker images xitools-backend:test --format "{{.Size}}"
            Write-Info "后端镜像大小: $size"
            
            return $true
        }
        else {
            Write-Error "后端Docker构建失败"
            return $false
        }
    }
    catch {
        Write-Error "后端构建过程中发生错误: $($_.Exception.Message)"
        return $false
    }
    finally {
        Pop-Location
    }
}

# 验证镜像
function Test-Images {
    Write-Info "验证构建的镜像..."
    
    try {
        # 检查前端镜像
        docker run --rm xitools-frontend:test nginx -t
        if ($LASTEXITCODE -eq 0) {
            Write-Success "前端镜像配置验证通过"
        }
        else {
            Write-Warning "前端镜像配置验证失败"
        }
    }
    catch {
        Write-Warning "前端镜像验证过程中发生错误"
    }
    
    # 显示镜像信息
    Write-Host ""
    Write-Info "构建的镜像列表:"
    docker images | Select-String "xitools.*test"
}

# 主函数
function Main {
    Write-Host "开始时间: $(Get-Date)" -ForegroundColor Cyan
    Write-Host ""
    
    # 检查当前目录
    if (-not (Test-Path "package.json") -or -not (Test-Path "frontend") -or -not (Test-Path "backend")) {
        Write-Error "请在XItools项目根目录运行此脚本"
        exit 1
    }
    
    # 检查Docker
    if (-not (Test-Docker)) {
        exit 1
    }
    
    # 清理旧镜像
    if ($Cleanup) {
        Remove-TestImages
    }
    
    # 执行测试
    $frontendSuccess = Test-FrontendBuild
    $backendSuccess = Test-BackendBuild
    
    # 验证镜像
    if ($frontendSuccess -or $backendSuccess) {
        Test-Images
    }
    
    # 总结
    Write-Host ""
    Write-Host "==========================" -ForegroundColor Blue
    Write-Info "构建测试总结:"
    
    if ($frontendSuccess) {
        Write-Success "前端构建: 成功"
    }
    else {
        Write-Error "前端构建: 失败"
    }
    
    if ($backendSuccess) {
        Write-Success "后端构建: 成功"
    }
    else {
        Write-Error "后端构建: 失败"
    }
    
    Write-Host "结束时间: $(Get-Date)" -ForegroundColor Cyan
    
    # 返回结果
    if ($frontendSuccess -and $backendSuccess) {
        Write-Success "所有构建测试通过！CI/CD应该能正常工作"
        exit 0
    }
    else {
        Write-Error "部分构建测试失败，需要进一步修复"
        exit 1
    }
}

# 运行主函数
Main
