<#
.SYNOPSIS
    Docker环境管理脚本 (PowerShell版本)
    
.DESCRIPTION
    用于启动、停止和管理Docker化的XItools环境
    
.PARAMETER Action
    要执行的操作 (start|stop|restart|status|logs|clean)
    
.PARAMETER Environment
    环境类型 (development|production)
    
.EXAMPLE
    .\docker-env.ps1 start development
    启动开发环境
    
.EXAMPLE
    .\docker-env.ps1 logs production
    查看生产环境日志
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "clean")]
    [string]$Action,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "production")]
    [string]$Environment
)

# 设置编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 配置
$script:ComposeFiles = @{
    development = "docker-compose.dev.yml"
    production = "docker-compose.prod.yml"
}

$script:ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$script:ComposeFile = $script:ComposeFiles[$Environment]

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [ConsoleColor]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 执行Docker Compose命令
function Invoke-DockerCompose {
    param(
        [string]$Arguments,
        [switch]$NoError
    )
    
    $cmd = "docker-compose -f $script:ComposeFile $Arguments"
    Write-ColorOutput "🔧 执行命令: $cmd" -Color Blue
    
    Push-Location $script:ProjectRoot
    try {
        $result = Invoke-Expression $cmd 2>&1
        if ($LASTEXITCODE -ne 0 -and -not $NoError) {
            throw "Docker Compose命令执行失败"
        }
        return $result
    }
    catch {
        if (-not $NoError) {
            Write-ColorOutput "❌ 命令执行失败: $_" -Color Red
            throw
        }
        return $null
    }
    finally {
        Pop-Location
    }
}

# 检查Docker是否可用
function Test-DockerAvailable {
    try {
        $version = docker --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Docker已安装: $version" -Color Green
            return $true
        }
    }
    catch {
        # 忽略错误
    }
    
    Write-ColorOutput "❌ Docker未安装或未运行" -Color Red
    Write-ColorOutput "💡 请安装Docker Desktop: https://www.docker.com/products/docker-desktop" -Color Yellow
    return $false
}

# 检查Docker Compose是否可用
function Test-DockerComposeAvailable {
    try {
        $version = docker-compose --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Docker Compose已安装: $version" -Color Green
            return $true
        }
    }
    catch {
        # 忽略错误
    }
    
    Write-ColorOutput "❌ Docker Compose未安装" -Color Red
    Write-ColorOutput "💡 Docker Desktop通常包含Docker Compose" -Color Yellow
    return $false
}

# 启动环境
function Start-Environment {
    Write-ColorOutput "🚀 启动 $Environment 环境..." -Color Cyan
    
    # 检查配置文件
    $composeFilePath = Join-Path $script:ProjectRoot $script:ComposeFile
    if (-not (Test-Path $composeFilePath)) {
        Write-ColorOutput "❌ 找不到配置文件: $script:ComposeFile" -Color Red
        exit 1
    }
    
    # 创建必要的目录
    $directories = @(
        "backend/logs",
        "frontend/logs",
        "nginx/logs"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $script:ProjectRoot $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-ColorOutput "📁 创建目录: $dir" -Color Blue
        }
    }
    
    # 启动服务
    try {
        if ($Environment -eq "development") {
            Invoke-DockerCompose "up -d --build"
        } else {
            Invoke-DockerCompose "up -d"
        }
        
        Write-ColorOutput "✅ 环境启动成功" -Color Green
        
        # 显示访问地址
        Write-Host ""
        Write-ColorOutput "🌐 访问地址:" -Color Cyan
        if ($Environment -eq "development") {
            Write-Host "  前端应用: http://localhost:5173"
            Write-Host "  后端API: http://localhost:3000"
            Write-Host "  Nginx代理: http://localhost:8080"
            Write-Host "  数据库: localhost:5432"
        } else {
            Write-Host "  应用入口: http://localhost"
            Write-Host "  后端API: http://localhost/api"
        }
    }
    catch {
        Write-ColorOutput "❌ 环境启动失败" -Color Red
        exit 1
    }
}

# 停止环境
function Stop-Environment {
    Write-ColorOutput "🛑 停止 $Environment 环境..." -Color Cyan
    
    try {
        Invoke-DockerCompose "down"
        Write-ColorOutput "✅ 环境已停止" -Color Green
    }
    catch {
        Write-ColorOutput "❌ 停止环境失败" -Color Red
        exit 1
    }
}

# 重启环境
function Restart-Environment {
    Write-ColorOutput "🔄 重启 $Environment 环境..." -Color Cyan
    Stop-Environment
    Start-Sleep -Seconds 2
    Start-Environment
}

# 查看状态
function Show-Status {
    Write-ColorOutput "📊 $Environment 环境状态:" -Color Cyan
    
    try {
        $status = Invoke-DockerCompose "ps"
        Write-Host $status
        
        # 检查健康状态
        Write-Host ""
        Write-ColorOutput "🏥 健康检查:" -Color Cyan
        $health = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "xitools"
        Write-Host $health
    }
    catch {
        Write-ColorOutput "❌ 获取状态失败" -Color Red
    }
}

# 查看日志
function Show-Logs {
    Write-ColorOutput "📋 $Environment 环境日志:" -Color Cyan
    
    $service = Read-Host "请输入要查看的服务名称 (backend/frontend/postgres/nginx，留空查看所有)"
    
    try {
        if ($service) {
            Invoke-DockerCompose "logs --tail=100 -f $service"
        } else {
            Invoke-DockerCompose "logs --tail=50"
        }
    }
    catch {
        Write-ColorOutput "❌ 获取日志失败" -Color Red
    }
}

# 清理环境
function Clean-Environment {
    Write-ColorOutput "🧹 清理 $Environment 环境..." -Color Cyan
    
    $confirm = Read-Host "确定要清理环境吗？这将删除所有容器、镜像和数据卷 (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-ColorOutput "已取消清理" -Color Yellow
        return
    }
    
    try {
        # 停止并删除容器
        Invoke-DockerCompose "down -v"
        
        # 删除镜像
        Write-ColorOutput "🗑️  删除相关镜像..." -Color Blue
        $images = docker images | Select-String "xitools"
        if ($images) {
            $imageIds = $images | ForEach-Object { ($_ -split '\s+')[2] }
            foreach ($id in $imageIds) {
                docker rmi $id -f
            }
        }
        
        # 清理悬空资源
        Write-ColorOutput "🧹 清理悬空资源..." -Color Blue
        docker system prune -f
        
        Write-ColorOutput "✅ 环境清理完成" -Color Green
    }
    catch {
        Write-ColorOutput "❌ 清理失败: $_" -Color Red
    }
}

# 主函数
function Main {
    Write-ColorOutput "🐳 XItools Docker环境管理工具" -Color Green
    Write-ColorOutput "📋 环境: $Environment" -Color Blue
    Write-ColorOutput "📋 操作: $Action" -Color Blue
    Write-Host ""
    
    # 检查Docker
    if (-not (Test-DockerAvailable)) {
        exit 1
    }
    
    if (-not (Test-DockerComposeAvailable)) {
        exit 1
    }
    
    # 执行操作
    switch ($Action) {
        "start" {
            Start-Environment
        }
        "stop" {
            Stop-Environment
        }
        "restart" {
            Restart-Environment
        }
        "status" {
            Show-Status
        }
        "logs" {
            Show-Logs
        }
        "clean" {
            Clean-Environment
        }
    }
}

# 错误处理
trap {
    Write-ColorOutput "❌ 发生错误: $_" -Color Red
    exit 1
}

# 执行主函数
Main