# XItools 简化版 CI/CD 设置指南

本指南将帮助您快速配置 XItools 的简化版 CI/CD 部署环境。

## 前置要求

### 系统要求
- **服务器**: Ubuntu 20.04+ 
- **内存**: 最少 2GB，推荐 4GB+
- **存储**: 最少 20GB，推荐 50GB+
- **网络**: 稳定的互联网连接

### 软件要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+

## GitHub 仓库配置

### 1. 环境设置

在 GitHub 仓库中配置以下环境：

```
Settings → Environments → New environment
```

创建两个环境：
- `production` (生产环境)
- `staging` (预生产环境)

### 2. Secrets 配置

在每个环境中配置以下必要的 Secrets：

#### 服务器连接 (必需)
```bash
SSH_PRIVATE_KEY          # SSH 私钥内容
SERVER_HOST              # 服务器 IP 地址 (如: 8.140.237.185)
SERVER_USER              # SSH 用户名 (通常是 root)
```

#### 数据库配置 (必需)
```bash
DATABASE_URL             # postgresql://user:pass@postgres:5432/dbname
POSTGRES_USER            # PostgreSQL 用户名
POSTGRES_PASSWORD        # PostgreSQL 密码
POSTGRES_DB              # 数据库名称
```

#### 应用配置 (必需)
```bash
JWT_SECRET               # JWT 密钥 (32位随机字符串)
VITE_BACKEND_URL         # 前端访问后端的 URL
```

### 3. 分支保护规则 (可选)

如果需要代码审查，可以设置分支保护：

```
Settings → Branches → Add rule
Branch name pattern: main
☑️ Require a pull request before merging
☑️ Require status checks to pass before merging
```

## 服务器环境配置

### 1. 基础环境安装

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重启以应用用户组更改
sudo reboot
```

### 2. 目录结构创建

```bash
# 创建应用目录
sudo mkdir -p /opt/xitools/{releases,shared}
sudo chown -R $USER:$USER /opt/xitools

# 创建预生产目录
sudo mkdir -p /opt/xitools-staging/{releases,shared}
sudo chown -R $USER:$USER /opt/xitools-staging
```

### 3. SSH 密钥配置

```bash
# 生成 SSH 密钥对 (如果没有)
ssh-keygen -t ed25519 -C "xitools-deploy"

# 将公钥添加到服务器
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# 复制私钥内容到 GitHub Secrets (包含 BEGIN/END 行)
cat ~/.ssh/id_ed25519
```

### 4. 防火墙配置

```bash
# 开放必要端口
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 8081/tcp    # Staging
sudo ufw enable
```

## 首次部署

### 1. 测试 SSH 连接

```bash
# 从本地测试 SSH 连接
ssh -o StrictHostKeyChecking=no user@server "echo 'SSH 连接成功'"
```

### 2. 推送代码触发部署

```bash
# 推送到 develop 分支触发预生产部署
git checkout develop
git push origin develop

# 推送到 main 分支触发生产部署  
git checkout main
git push origin main
```

### 3. 监控部署

在 GitHub Actions 页面监控部署进度：
```
Repository → Actions → 选择对应的工作流
```

### 4. 验证部署

```bash
# 检查服务状态
ssh user@server "docker-compose -f /opt/xitools/current/docker-compose.prod.yml ps"

# 检查应用访问
curl -I http://your-domain.com
```

## 常见问题排除

### 1. SSH 连接失败
- 检查 SSH 私钥格式是否完整
- 确保服务器防火墙允许 SSH 连接
- 验证 SERVER_HOST 和 SERVER_USER 配置

### 2. Docker 构建失败
- 检查服务器 Docker 服务状态
- 确保有足够的磁盘空间
- 检查网络连接是否正常

### 3. 环境变量问题
- 确保所有必需的 Secrets 都已配置
- 检查变量名称是否完全匹配
- 验证数据库连接字符串格式

### 4. 健康检查失败
- 等待更长时间让服务完全启动
- 检查服务器端口是否正确开放
- 查看应用日志排查具体错误

## 维护操作

### 查看日志
```bash
# 查看应用日志
ssh user@server "docker-compose -f /opt/xitools/current/docker-compose.prod.yml logs -f"
```

### 手动回滚
```bash
# 在 GitHub Actions 中手动触发回滚工作流
Repository → Actions → 紧急回滚 → Run workflow
```

### 清理空间
```bash
# 清理未使用的 Docker 镜像
ssh user@server "docker system prune -f"
```

---

*简化版 CI/CD 专注于核心功能，如需更高级特性，请参考完整版企业级方案。*
