<#
.SYNOPSIS
    XItools一键部署脚本 (PowerShell版本)
    
.DESCRIPTION
    自动执行完整的部署流程，适用于Windows PowerShell环境
    
.PARAMETER Action
    要执行的操作 (默认: Full)
    - Full: 完整部署（检查、推送、部署）
    - Check: 仅检查环境
    - Deploy: 仅执行部署
    
.PARAMETER ServerHost
    服务器地址 (默认: 8.140.237.185)
    
.PARAMETER ServerUser
    服务器用户 (默认: root)
    
.PARAMETER Domain
    域名 (默认: xitools.furdow.com)
    
.EXAMPLE
    .\one-click-deploy.ps1
    执行完整部署
    
.EXAMPLE
    .\one-click-deploy.ps1 -Action Check
    仅检查环境
#>

param(
    [ValidateSet("Full", "Check", "Deploy")]
    [string]$Action = "Full",
    
    [string]$ServerHost = "8.140.237.185",
    
    [string]$ServerUser = "root",
    
    [string]$Domain = "xitools.furdow.com"
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

# 显示步骤
$script:Step = 1
$script:TotalSteps = 6

function Show-Step {
    param([string]$Description)
    Write-ColorOutput "📍 步骤 $script:Step/$script:TotalSteps: $Description" -Color Cyan
    $script:Step++
}

# 检查命令是否存在
function Test-Command {
    param(
        [string]$Command,
        [string]$Package = ""
    )
    
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        Write-ColorOutput "❌ 未找到命令: $Command" -Color Red
        if ($Package) {
            Write-ColorOutput "💡 请安装: $Package" -Color Yellow
        }
        return $false
    }
}

# 执行命令并捕获输出
function Invoke-CommandWithOutput {
    param(
        [string]$Command,
        [string]$Arguments = "",
        [switch]$NoError
    )
    
    try {
        if ($Arguments) {
            $result = & $Command $Arguments.Split(" ") 2>&1
        } else {
            $result = & $Command 2>&1
        }
        
        if ($LASTEXITCODE -ne 0 -and -not $NoError) {
            throw "命令执行失败: $Command $Arguments"
        }
        
        return $result
    }
    catch {
        if (-not $NoError) {
            Write-ColorOutput "❌ 执行失败: $_" -Color Red
            throw
        }
        return $null
    }
}

# 主函数
function Main {
    Write-ColorOutput "🚀 XItools一键部署脚本 (PowerShell版本)" -Color Green
    Write-ColorOutput "📋 目标服务器: $ServerHost" -Color Blue
    Write-ColorOutput "🌐 域名: $Domain" -Color Blue
    Write-Host ""
    
    # 步骤1: 检查系统依赖
    if ($Action -eq "Full" -or $Action -eq "Check") {
        Show-Step "检查系统依赖"
        
        $dependencies = @{
            "ssh" = "OpenSSH (Windows内置或Git Bash)"
            "scp" = "OpenSSH (Windows内置或Git Bash)"
            "git" = "Git for Windows"
            "curl" = "Windows 10 1803+内置或单独安装"
        }
        
        $allDependenciesOk = $true
        foreach ($cmd in $dependencies.Keys) {
            if (-not (Test-Command $cmd $dependencies[$cmd])) {
                $allDependenciesOk = $false
            }
        }
        
        if ($allDependenciesOk) {
            Write-ColorOutput "✅ 系统依赖检查通过" -Color Green
        } else {
            Write-ColorOutput "❌ 系统依赖检查失败" -Color Red
            exit 1
        }
        Write-Host ""
    }
    
    # 步骤2: 检查SSH连接
    if ($Action -eq "Full" -or $Action -eq "Check") {
        Show-Step "检查SSH连接"
        
        try {
            $sshTest = ssh -o ConnectTimeout=10 "$ServerUser@$ServerHost" "echo 'SSH连接正常'" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ SSH连接正常" -Color Green
            } else {
                throw "SSH连接失败"
            }
        }
        catch {
            Write-ColorOutput "❌ SSH连接失败" -Color Red
            Write-ColorOutput "💡 请先配置SSH免密登录:" -Color Yellow
            Write-Host "   1. ssh-keygen -t ed25519 -C 'your-email@example.com'"
            Write-Host "   2. ssh-copy-id $ServerUser@$ServerHost"
            Write-Host "   3. ssh $ServerUser@$ServerHost 'echo SSH测试成功'"
            exit 1
        }
        Write-Host ""
    }
    
    # 步骤3: 检查Git状态
    if ($Action -eq "Full") {
        Show-Step "检查Git状态"
        
        try {
            $gitStatus = git status 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Git仓库正常" -Color Green
                
                # 检查是否有未提交的更改
                $porcelain = git status --porcelain
                if ($porcelain) {
                    Write-ColorOutput "⚠️  检测到未提交的更改" -Color Yellow
                    $confirm = Read-Host "是否提交并继续部署? (y/N)"
                    if ($confirm -eq "y" -or $confirm -eq "Y") {
                        git add .
                        git commit -m "自动提交：准备部署到生产环境"
                        Write-ColorOutput "✅ 更改已提交" -Color Green
                    } else {
                        Write-ColorOutput "❌ 部署已取消" -Color Red
                        exit 1
                    }
                }
                
                # 检查远程仓库
                try {
                    $remoteUrl = git remote get-url origin 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        throw "未配置远程仓库"
                    }
                }
                catch {
                    Write-ColorOutput "⚠️  未配置Git远程仓库" -Color Yellow
                    Write-ColorOutput "💡 请先配置Git远程仓库:" -Color Yellow
                    Write-Host "   git remote add origin https://github.com/your-username/XItools.git"
                    Write-Host "   git push -u origin main"
                    exit 1
                }
                
                # 推送到远程仓库
                Write-ColorOutput "📤 推送代码到远程仓库..." -Color Blue
                $currentBranch = git branch --show-current
                
                # 直接使用原始URL推送（通常是SSH）
                git push origin $currentBranch
                
                Write-ColorOutput "✅ 代码推送完成" -Color Green
            } else {
                throw "不是Git仓库"
            }
        }
        catch {
            Write-ColorOutput "❌ Git操作失败: $_" -Color Red
            exit 1
        }
        Write-Host ""
    }
    
    # 检查操作系统并调整脚本路径
    $isWindows = if ($PSVersionTable.PSVersion.Major -ge 6) { $IsWindows } else { $true }
    $scriptPath = "./scripts/deploy-production.sh"
    
    # 步骤4: 初始化服务器环境
    if ($Action -eq "Full" -or $Action -eq "Deploy") {
        Show-Step "初始化服务器环境"
        Write-ColorOutput "⚙️  正在初始化服务器环境..." -Color Blue
        
        try {
            # 在Windows上使用bash执行shell脚本
            if ($isWindows) {
                $bashPath = (Get-Command bash -ErrorAction SilentlyContinue).Source
                if ($bashPath) {
                    & $bashPath -c "$scriptPath -a setup"
                } else {
                    # 尝试使用Git Bash
                    $gitBashPath = "C:\Program Files\Git\bin\bash.exe"
                    if (Test-Path $gitBashPath) {
                        & $gitBashPath -c "$scriptPath -a setup"
                    } else {
                        throw "找不到bash环境，请安装Git Bash或WSL"
                    }
                }
            } else {
                & $scriptPath -a setup
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ 服务器环境初始化完成" -Color Green
            } else {
                throw "服务器环境初始化失败"
            }
        }
        catch {
            Write-ColorOutput "❌ $_" -Color Red
            exit 1
        }
        Write-Host ""
    }
    
    # 步骤5: 执行完整部署
    if ($Action -eq "Full" -or $Action -eq "Deploy") {
        Show-Step "执行完整部署"
        Write-ColorOutput "🚀 正在执行完整部署..." -Color Blue
        
        try {
            # 在Windows上使用bash执行shell脚本
            if ($isWindows) {
                $bashPath = (Get-Command bash -ErrorAction SilentlyContinue).Source
                if ($bashPath) {
                    & $bashPath -c "$scriptPath -a deploy"
                } else {
                    # 尝试使用Git Bash
                    $gitBashPath = "C:\Program Files\Git\bin\bash.exe"
                    if (Test-Path $gitBashPath) {
                        & $gitBashPath -c "$scriptPath -a deploy"
                    } else {
                        throw "找不到bash环境，请安装Git Bash或WSL"
                    }
                }
            } else {
                & $scriptPath -a deploy
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ 部署完成" -Color Green
            } else {
                throw "部署失败"
            }
        }
        catch {
            Write-ColorOutput "❌ $_" -Color Red
            exit 1
        }
        Write-Host ""
    }
    
    # 步骤6: 验证部署结果
    if ($Action -eq "Full" -or $Action -eq "Deploy") {
        Show-Step "验证部署结果"
        Write-ColorOutput "🔍 正在验证部署结果..." -Color Blue
        
        # 等待服务启动
        Write-ColorOutput "⏳ 等待服务启动..." -Color Yellow
        Start-Sleep -Seconds 30
        
        # 检查服务状态
        Write-ColorOutput "📊 检查服务状态..." -Color Blue
        if ($isWindows) {
            $bashPath = (Get-Command bash -ErrorAction SilentlyContinue).Source
            if ($bashPath) {
                & $bashPath -c "$scriptPath -a status"
            } else {
                $gitBashPath = "C:\Program Files\Git\bin\bash.exe"
                if (Test-Path $gitBashPath) {
                    & $gitBashPath -c "$scriptPath -a status"
                }
            }
        } else {
            & $scriptPath -a status
        }
        
        # 测试HTTPS访问
        Write-ColorOutput "🌐 测试HTTPS访问..." -Color Blue
        try {
            $response = Invoke-WebRequest -Uri "https://$Domain/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-ColorOutput "✅ HTTPS访问正常" -Color Green
            } else {
                Write-ColorOutput "⚠️  HTTPS访问可能有问题，请检查" -Color Yellow
            }
        }
        catch {
            Write-ColorOutput "⚠️  HTTPS访问测试失败: $_" -Color Yellow
        }
        
        # 测试MCP服务
        Write-ColorOutput "🔧 测试MCP服务..." -Color Blue
        try {
            $mcpBody = @{
                jsonrpc = "2.0"
                method = "initialize"
                params = @{
                    protocolVersion = "2024-11-05"
                    capabilities = @{}
                    clientInfo = @{
                        name = "test"
                        version = "1.0.0"
                    }
                }
                id = 1
            } | ConvertTo-Json -Depth 10
            
            $mcpResponse = Invoke-WebRequest -Uri "https://$Domain/mcp" `
                -Method POST `
                -ContentType "application/json" `
                -Body $mcpBody `
                -UseBasicParsing `
                -TimeoutSec 10
                
            if ($mcpResponse.StatusCode -eq 200) {
                Write-ColorOutput "✅ MCP服务响应正常" -Color Green
            } else {
                Write-ColorOutput "⚠️  MCP服务响应码: $($mcpResponse.StatusCode)" -Color Yellow
            }
        }
        catch {
            Write-ColorOutput "⚠️  MCP服务测试失败: $_" -Color Yellow
        }
        
        Write-Host ""
        Write-ColorOutput "🎉 XItools部署完成！" -Color Green
        Write-Host ""
        Write-ColorOutput "🌐 访问地址:" -Color Cyan
        Write-Host "  主应用: https://$Domain"
        Write-Host "  MCP服务: https://$Domain/mcp"
        Write-Host "  健康检查: https://$Domain/health"
        Write-Host ""
        Write-ColorOutput "🔧 常用维护命令:" -Color Cyan
        Write-Host "  查看状态: ./scripts/deploy-production.sh -a status"
        Write-Host "  查看日志: ./scripts/deploy-production.sh -a logs"
        Write-Host "  快速更新: ./scripts/deploy-production.sh -a update -m '更新说明'"
        Write-Host "  重启服务: ./scripts/deploy-production.sh -a restart"
        Write-Host ""
        Write-ColorOutput "✨ 部署成功！您的XItools项目现在已经在生产环境中运行了！" -Color Green
    }
}

# 错误处理
trap {
    Write-ColorOutput "❌ 发生错误: $_" -Color Red
    exit 1
}

# 执行主函数
Main