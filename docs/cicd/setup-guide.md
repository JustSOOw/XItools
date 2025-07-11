# CI/CD 设置和使用指南

本指南将帮助您完成 XItools 企业级 CI/CD 系统的设置、配置和日常使用。

## 前置条件

### 必需环境
- GitHub 仓库（推荐私有仓库）
- Ubuntu 22.04 服务器
- Docker 和 Docker Compose
- Nginx（已配置 SSL）
- 域名：xitools.furdow.com

### 权限要求
- GitHub 仓库管理员权限
- 服务器 root 或 sudo 权限
- 域名 DNS 管理权限

## 第一步：GitHub 仓库配置

### 1.1 启用 GitHub Actions

1. 进入 GitHub 仓库
2. 点击 **Settings** 标签
3. 在左侧菜单选择 **Actions** > **General**
4. 确保 **Actions permissions** 设置为 "Allow all actions and reusable workflows"

### 1.2 配置 GitHub Secrets

根据不同环境的需求，需要在不同位置配置密钥：

#### 全局密钥（Repository Secrets）
在 **Settings** > **Secrets and variables** > **Actions** 中添加所有环境共用的密钥：

```
# 服务器连接（所有环境共用）
SERVER_HOST=8.140.237.185
SERVER_USER=root
SSH_PRIVATE_KEY=<你的SSH私钥内容>

# 通知配置（可选，所有环境共用）
SLACK_WEBHOOK_URL=<Slack通知URL>
EMAIL_SMTP_HOST=<邮件服务器>
EMAIL_SMTP_USER=<邮件用户名>
EMAIL_SMTP_PASS=<邮件密码>
```

#### 环境特定密钥（Environment Secrets）
在 **Settings** > **Environments** > **[环境名]** > **Environment secrets** 中为每个环境添加特定密钥：

**Production 环境密钥**：
```
DATABASE_URL=postgresql://xitools_user:生产密码@localhost:5432/xitools
POSTGRES_USER=xitools_user
POSTGRES_PASSWORD=<生产环境强密码>
POSTGRES_DB=xitools
JWT_SECRET=<生产环境JWT密钥>
NODE_ENV=production
VITE_BACKEND_URL=https://xitools.furdow.com/api
```

**Staging 环境密钥**：
```
DATABASE_URL=postgresql://xitools_user:预发布密码@localhost:5432/xitools_staging
POSTGRES_USER=xitools_user
POSTGRES_PASSWORD=<预发布环境密码>
POSTGRES_DB=xitools_staging
JWT_SECRET=<预发布环境JWT密钥>
NODE_ENV=staging
VITE_BACKEND_URL=http://xitools.furdow.com:8081/api
```

**Development 环境密钥**（本地开发，可选）：
```
DATABASE_URL=postgresql://xitools_user:开发密码@localhost:5432/xitools_dev
POSTGRES_USER=xitools_user
POSTGRES_PASSWORD=<开发环境密码>
POSTGRES_DB=xitools_dev
JWT_SECRET=<开发环境JWT密钥>
NODE_ENV=development
VITE_BACKEND_URL=http://localhost:3000/api
```

### 1.3 配置环境

在 **Settings** > **Environments** 中创建以下环境：

#### Development 环境
- 无需审批
- 自动部署

#### Staging 环境
- 需要审批
- 指定审批人员

#### Production 环境
- 需要审批
- 多人审批
- 部署保护规则

## 第二步：服务器环境准备

### 2.1 安装必需软件

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

# 安装其他工具
sudo apt install -y git curl wget unzip
```

### 2.2 配置 SSH 密钥

```bash
# 在本地生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your-email@example.com"

# 将公钥添加到服务器
ssh-copy-id root@8.140.237.185

# 测试连接
ssh root@8.140.237.185 "echo 'SSH连接成功'"
```

### 2.3 创建应用目录

```bash
# 在服务器上创建目录
ssh root@8.140.237.185 << 'EOF'
mkdir -p /opt/xitools
mkdir -p /opt/xitools/data
mkdir -p /opt/xitools/logs
mkdir -p /opt/xitools/backups
chown -R root:root /opt/xitools
EOF
```

## 第三步：Docker 配置优化

### 3.1 创建生产环境配置

创建 `.env.production` 文件：

```env
# 应用配置
NODE_ENV=production
PORT=3000
VITE_BACKEND_URL=https://xitools.furdow.com/api

# 数据库配置
DATABASE_URL=postgresql://xitools_user:${POSTGRES_PASSWORD}@postgres:5432/xitools
POSTGRES_USER=xitools_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=xitools

# JWT 配置
JWT_SECRET=${JWT_SECRET}

# CORS 配置
CORS_ORIGINS=https://xitools.furdow.com

# 日志配置
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
```

### 3.2 优化 Docker Compose

更新 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/xitools-docker.conf:/etc/nginx/conf.d/default.conf
      - ./logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

volumes:
  postgres_data:
```

## 第四步：监控系统设置

### 4.1 Prometheus 配置

创建 `monitoring/prometheus.yml`：

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert-rules.yml"

scrape_configs:
  - job_name: 'xitools-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'xitools-frontend'
    static_configs:
      - targets: ['frontend:5173']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 4.2 Grafana 仪表板

创建 `monitoring/grafana-dashboard.json`（基础配置）：

```json
{
  "dashboard": {
    "title": "XItools 监控仪表板",
    "panels": [
      {
        "title": "应用状态",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"xitools-backend\"}",
            "legendFormat": "后端状态"
          }
        ]
      },
      {
        "title": "响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds",
            "legendFormat": "响应时间"
          }
        ]
      }
    ]
  }
}
```

## 第五步：验证配置

### 5.1 本地测试

```bash
# 检查 Docker 配置
docker-compose -f docker-compose.prod.yml config

# 测试构建
docker-compose -f docker-compose.prod.yml build

# 运行健康检查
./scripts/health-check.sh
```

### 5.2 GitHub Actions 测试

1. 创建测试分支
2. 推送代码
3. 检查 Actions 运行状态
4. 验证部署结果

## 故障排除

### 常见问题

1. **SSH 连接失败**
   - 检查 SSH 密钥格式
   - 验证服务器防火墙设置
   - 确认用户权限

2. **Docker 构建失败**
   - 检查 Dockerfile 语法
   - 验证依赖安装
   - 查看构建日志

3. **数据库连接问题**
   - 检查连接字符串
   - 验证数据库服务状态
   - 确认网络连接

### 日志查看

```bash
# GitHub Actions 日志
# 在 GitHub 仓库的 Actions 标签页查看

# 服务器日志
ssh root@8.140.237.185 "docker-compose -f /opt/xitools/docker-compose.prod.yml logs"

# 应用日志
ssh root@8.140.237.185 "tail -f /opt/xitools/logs/app.log"
```

## 开发环境密钥配置

由于您已配置了生产和预发布环境，现在需要配置开发环境密钥：

### 配置步骤
1. 进入 GitHub 仓库 **Settings** > **Environments** > **development**
2. 添加以下环境密钥：

```
DATABASE_URL=postgresql://xitools_dev:dev_password_123@localhost:5432/xitools_dev
POSTGRES_USER=xitools_dev
POSTGRES_PASSWORD=dev_password_123
POSTGRES_DB=xitools_dev
JWT_SECRET=dev-jwt-secret-key-for-testing-only
NODE_ENV=development
VITE_BACKEND_URL=http://localhost:3000/api
```

## 日常使用

### 自动部署
- **生产环境**: 推送到 `main` 分支自动部署
- **预发布环境**: 推送到 `develop` 分支自动部署

### 手动操作
```bash
# 健康检查
npm run health-check

# 备份数据库
npm run backup:database

# 回滚到上一版本
npm run rollback:auto

# 查看服务状态
ssh root@8.140.237.185 "docker-compose -f /opt/xitools/current/docker-compose.prod.yml ps"
```

### 监控部署
- 在 GitHub Actions 页面查看部署状态
- 访问 https://xitools.furdow.com/health 检查服务健康

## 故障排除

### 常见问题
1. **部署失败**: 检查 GitHub Actions 日志
2. **SSH连接失败**: 验证 SSH_PRIVATE_KEY 配置
3. **服务启动失败**: 检查环境变量配置

### 紧急回滚
```bash
# 快速回滚
npm run rollback:auto

# 或使用GitHub Actions手动触发回滚工作流
```

---

*CI/CD系统已替换所有脚本部署方式，如有问题请检查GitHub Actions日志。*
