<#
.SYNOPSIS
    XItools生产环境部署脚本 (PowerShell版本)
    
.DESCRIPTION
    使用Docker容器化部署 + 系统Nginx代理
    
.PARAMETER Action
    执行的操作 (setup|deploy|update|restart|status|logs)
    
.PARAMETER Message
    提交信息
    
.PARAMETER ServerHost
    服务器地址 (默认: 8.140.237.185)
    
.PARAMETER ServerUser
    服务器用户 (默认: root)
    
.PARAMETER Force
    强制执行
    
.PARAMETER SkipBuild
    跳过构建
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("setup", "deploy", "update", "restart", "status", "logs")]
    [string]$Action,
    
    [string]$Message = "XItools生产部署",
    
    [string]$ServerHost = "8.140.237.185",
    
    [string]$ServerUser = "root",
    
    [switch]$Force,
    
    [switch]$SkipBuild
)

# 设置编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [ConsoleColor]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# SSH执行远程命令
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [switch]$NoError
    )
    
    $sshCommand = "ssh $ServerUser@$ServerHost `"$Command`""
    Write-ColorOutput "🔧 执行远程命令: $Command" -Color Blue
    
    try {
        $result = Invoke-Expression $sshCommand 2>&1
        if ($LASTEXITCODE -ne 0 -and -not $NoError) {
            throw "SSH命令执行失败"
        }
        return $result
    }
    catch {
        if (-not $NoError) {
            Write-ColorOutput "❌ SSH命令执行失败: $_" -Color Red
            throw
        }
        return $null
    }
}

# SCP复制文件
function Copy-ToServer {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    Write-ColorOutput "📤 复制文件: $LocalPath -> $RemotePath" -Color Blue
    $scpCommand = "scp -r `"$LocalPath`" `"$ServerUser@$ServerHost`:$RemotePath`""
    
    try {
        Invoke-Expression $scpCommand 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "SCP复制失败"
        }
    }
    catch {
        Write-ColorOutput "❌ 文件复制失败: $_" -Color Red
        throw
    }
}

# 设置服务器环境
function Setup-ServerEnvironment {
    Write-ColorOutput "🔧 设置服务器环境..." -Color Cyan
    
    # 检查并安装Docker
    Write-ColorOutput "📦 检查Docker安装..." -Color Blue
    $dockerCheck = Invoke-SSHCommand "docker --version" -NoError
    if (-not $dockerCheck) {
        Write-ColorOutput "📥 安装Docker..." -Color Yellow
        # 使用阿里云镜像安装Docker
        Invoke-SSHCommand "curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun" -NoError
        
        # 如果上面失败，尝试使用DaoCloud镜像
        $dockerVerify = Invoke-SSHCommand "docker --version" -NoError
        if (-not $dockerVerify) {
            Invoke-SSHCommand "curl -sSL https://get.daocloud.io/docker | sh" -NoError
        }
        
        Invoke-SSHCommand "systemctl enable docker"
        Invoke-SSHCommand "systemctl start docker"
        
        # 配置Docker国内镜像源
        Write-ColorOutput "🔧 配置Docker国内镜像源..." -Color Blue
        # 使用单行命令创建配置文件
        $dockerConfigCmd = @"
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me",
    "https://dockerhub.icu",
    "https://docker.chenby.cn",
    "https://docker.awsl9527.cn"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF
"@
        Invoke-SSHCommand "mkdir -p /etc/docker"
        Invoke-SSHCommand $dockerConfigCmd
        Invoke-SSHCommand "systemctl daemon-reload"
        Invoke-SSHCommand "systemctl restart docker"
        
        Write-ColorOutput "✅ Docker已安装并配置国内镜像源" -Color Green
    } else {
        Write-ColorOutput "✅ Docker已安装: $dockerCheck" -Color Green
        
        # 检查是否已配置镜像源
        $mirrorCheck = Invoke-SSHCommand "test -f /etc/docker/daemon.json && grep -q 'registry-mirrors' /etc/docker/daemon.json" -NoError
        if (-not $mirrorCheck) {
            Write-ColorOutput "🔧 为已安装的Docker配置国内镜像源..." -Color Blue
            # 使用单行命令创建配置文件
            $dockerConfigCmd = @"
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me",
    "https://dockerhub.icu",
    "https://docker.chenby.cn",
    "https://docker.awsl9527.cn"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF
"@
            Invoke-SSHCommand "mkdir -p /etc/docker"
            Invoke-SSHCommand $dockerConfigCmd -NoError
            Invoke-SSHCommand "systemctl daemon-reload" -NoError
            Invoke-SSHCommand "systemctl restart docker" -NoError
            
            # 验证Docker是否正常运行
            $dockerStatus = Invoke-SSHCommand "docker ps" -NoError
            if ($dockerStatus) {
                Write-ColorOutput "✅ Docker镜像源配置完成" -Color Green
            } else {
                Write-ColorOutput "⚠️  Docker镜像源配置可能需要手动验证" -Color Yellow
            }
        }
    }
    
    # 检查并安装Docker Compose
    Write-ColorOutput "📦 检查Docker Compose安装..." -Color Blue
    
    # 先检查docker compose (V2)命令
    $composeV2Check = Invoke-SSHCommand "docker compose version" -NoError
    if ($composeV2Check) {
        Write-ColorOutput "✅ Docker Compose V2已安装: $composeV2Check" -Color Green
    } else {
        # 再检查docker-compose (V1)命令
        $composeV1Check = Invoke-SSHCommand "docker-compose --version" -NoError
        if ($composeV1Check) {
            Write-ColorOutput "✅ Docker Compose V1已安装: $composeV1Check" -Color Green
        } else {
            Write-ColorOutput "📥 安装Docker Compose..." -Color Yellow
            
            # 如果您已经通过apt成功安装，直接使用apt
            Write-ColorOutput "使用apt安装Docker Compose..." -Color Blue
            Invoke-SSHCommand "apt-get update" -NoError
            Invoke-SSHCommand "apt-get install -y docker-compose" -NoError
            
            # 验证安装
            $finalCheck = Invoke-SSHCommand "docker-compose --version" -NoError
            if ($finalCheck) {
                Write-ColorOutput "✅ Docker Compose已通过apt安装: $finalCheck" -Color Green
            } else {
                # 如果apt失败，尝试pip安装
                Write-ColorOutput "尝试通过pip安装Docker Compose..." -Color Blue
                Invoke-SSHCommand "apt-get install -y python3-pip" -NoError
                Invoke-SSHCommand "pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple docker-compose" -NoError
                
                # 最终验证
                $pipCheck = Invoke-SSHCommand "docker-compose --version" -NoError
                if ($pipCheck) {
                    Write-ColorOutput "✅ Docker Compose已通过pip安装: $pipCheck" -Color Green
                } else {
                    Write-ColorOutput "⚠️  Docker Compose安装失败，您可能需要手动安装" -Color Yellow
                    Write-ColorOutput "💡 建议手动运行: apt-get install docker-compose" -Color Yellow
                }
            }
        }
    }
    
    # 创建项目目录
    Write-ColorOutput "📁 创建项目目录..." -Color Blue
    Invoke-SSHCommand "mkdir -p /root/xitools"
    Invoke-SSHCommand "mkdir -p /root/xitools/logs"
    
    # 设置防火墙
    Write-ColorOutput "🔥 配置防火墙..." -Color Blue
    Invoke-SSHCommand "ufw allow 22/tcp" -NoError
    Invoke-SSHCommand "ufw allow 80/tcp" -NoError
    Invoke-SSHCommand "ufw allow 443/tcp" -NoError
    Invoke-SSHCommand "ufw allow 3000/tcp" -NoError
    
    Write-ColorOutput "✅ 服务器环境设置完成" -Color Green
}

# 部署应用
function Deploy-Application {
    Write-ColorOutput "🚀 开始部署应用..." -Color Cyan
    
    # 停止现有服务
    Write-ColorOutput "🛑 停止现有服务..." -Color Blue
    Invoke-SSHCommand "cd /root/xitools && docker-compose -f docker-compose.prod.yml down" -NoError
    
    # 清理旧文件
    Write-ColorOutput "🧹 清理旧文件..." -Color Blue
    Invoke-SSHCommand "rm -rf /root/xitools/*" -NoError
    
    # 复制项目文件
    Write-ColorOutput "📤 上传项目文件..." -Color Blue
    $filesToCopy = @(
        "docker-compose.prod.yml",
        ".env.prod",
        "backend",
        "frontend",
        "nginx"
    )
    
    foreach ($file in $filesToCopy) {
        if (Test-Path $file) {
            Copy-ToServer $file "/root/xitools/"
        } else {
            Write-ColorOutput "⚠️  文件不存在: $file" -Color Yellow
        }
    }
    
    # 构建和启动服务
    if (-not $SkipBuild) {
        Write-ColorOutput "🔨 构建Docker镜像..." -Color Blue
        Invoke-SSHCommand "cd /root/xitools && docker-compose -f docker-compose.prod.yml build"
    }
    
    Write-ColorOutput "🚀 启动服务..." -Color Blue
    Invoke-SSHCommand "cd /root/xitools && docker-compose -f docker-compose.prod.yml up -d"
    
    # 等待服务启动
    Write-ColorOutput "⏳ 等待服务启动..." -Color Yellow
    Start-Sleep -Seconds 20
    
    # 检查服务状态
    Write-ColorOutput "📊 检查服务状态..." -Color Blue
    $status = Invoke-SSHCommand "cd /root/xitools && docker-compose -f docker-compose.prod.yml ps"
    Write-Host $status
    
    Write-ColorOutput "✅ 应用部署完成" -Color Green
}

# 更新应用
function Update-Application {
    Write-ColorOutput "🔄 快速更新应用..." -Color Cyan
    
    # Git提交
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitStatus = git status --porcelain
        if ($gitStatus) {
            Write-ColorOutput "📝 提交代码更改..." -Color Blue
            git add .
            git commit -m $Message
            git push
        }
    }
    
    # 部署
    Deploy-Application
}

# 重启服务
function Restart-Services {
    Write-ColorOutput "🔄 重启服务..." -Color Cyan
    Invoke-SSHCommand "cd /root/xitools && docker-compose -f docker-compose.prod.yml restart"
    Write-ColorOutput "✅ 服务重启完成" -Color Green
}

# 查看服务状态
function Show-Status {
    Write-ColorOutput "📊 服务状态:" -Color Cyan
    $status = Invoke-SSHCommand "cd /root/xitools && docker-compose -f docker-compose.prod.yml ps"
    Write-Host $status
    
    Write-Host ""
    Write-ColorOutput "💾 磁盘使用情况:" -Color Cyan
    $disk = Invoke-SSHCommand "df -h | grep -E '^/dev/'"
    Write-Host $disk
    
    Write-Host ""
    Write-ColorOutput "🐳 Docker信息:" -Color Cyan
    $docker = Invoke-SSHCommand "docker system df"
    Write-Host $docker
}

# 查看日志
function Show-Logs {
    Write-ColorOutput "📋 服务日志 (最近100行):" -Color Cyan
    
    $services = @("backend", "frontend", "postgres", "nginx")
    foreach ($service in $services) {
        Write-Host ""
        Write-ColorOutput "--- $service 日志 ---" -Color Yellow
        $logs = Invoke-SSHCommand "cd /root/xitools && docker-compose -f docker-compose.prod.yml logs --tail=25 $service" -NoError
        Write-Host $logs
    }
}

# 主函数
function Main {
    Write-ColorOutput "🚀 XItools生产环境部署工具 (PowerShell版本)" -Color Green
    Write-ColorOutput "📋 执行操作: $Action" -Color Blue
    
    # 检查SSH连接
    Write-ColorOutput "🔍 检查SSH连接..." -Color Blue
    try {
        $sshTest = Invoke-SSHCommand "echo 'SSH连接正常'" -NoError
        if ($sshTest -eq "SSH连接正常") {
            Write-ColorOutput "✅ SSH连接正常" -Color Green
        } else {
            throw "SSH连接测试失败"
        }
    }
    catch {
        Write-ColorOutput "❌ SSH连接失败" -Color Red
        exit 1
    }
    
    # 执行相应操作
    switch ($Action) {
        "setup" {
            Setup-ServerEnvironment
        }
        "deploy" {
            Deploy-Application
        }
        "update" {
            Update-Application
        }
        "restart" {
            Restart-Services
        }
        "status" {
            Show-Status
        }
        "logs" {
            Show-Logs
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