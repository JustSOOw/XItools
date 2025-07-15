# XItools CI/CD 部署指南

本指南旨在提供 XItools 项目的 CI/CD 部署的全面指导，涵盖从环境设置到故障排除的所有环节。

## 1. 概述

XItools 采用简化的 CI/CD 部署方案，基于 GitHub Actions 实现自动化构建和部署，专注于实用性和可靠性。项目采用双环境部署策略，确保代码质量和部署安全。

### 部署架构

```
GitHub → 简化 CI/CD → Docker Registry → Production Server
   ↓           ↓              ↓                    ↓
代码推送 → 代码检查构建 → 镜像存储 → 自动部署更新
```

### 环境概览

| 环境         | 分支      | 访问地址                       | 数据库端口 | 用途         |
|--------------|-----------|--------------------------------|------------|--------------|
| 生产环境     | `main`    | `https://xitools.furdow.com`   | 5432       | 正式发布版本 |
| 预生产环境   | `develop` | `http://xitools.furdow.com:8081` | 5433       | 发布前测试   |

**注意**: `feature/*` 分支仅进行 CI 检查（代码质量、构建验证），不进行远程部署。开发者使用本地环境 (`npm run dev`) 进行功能开发和测试。

## 2. 快速入门 (首次设置)

本节提供从零开始设置 CI/CD 环境的简化流程。

### 2.1 前置要求

#### 系统要求
- **服务器**: Ubuntu 20.04+
- **内存**: 最少 2GB，推荐 4GB+
- **存储**: 最少 20GB，推荐 50GB+
- **网络**: 稳定的互联网连接

#### 软件要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+

### 2.2 服务器环境配置

1.  **基础环境安装**:
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

2.  **目录结构创建**:
    ```bash
    # 创建应用目录
    sudo mkdir -p /opt/xitools/{releases,shared}
    sudo chown -R $USER:$USER /opt/xitools

    # 创建预生产目录
    sudo mkdir -p /opt/xitools-staging/{releases,shared}
    sudo chown -R $USER:$USER /opt/xitools-staging
    ```

3.  **SSH 密钥配置**:
    ```bash
    # 生成 SSH 密钥对 (如果没有)
    ssh-keygen -t ed25519 -C "xitools-deploy"

    # 将公钥添加到服务器
    cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

    # 复制私钥内容到 GitHub Secrets (包含 BEGIN/END 行)
    cat ~/.ssh/id_ed25519
    ```

4.  **防火墙配置**:
    ```bash
    # 开放必要端口
    sudo ufw allow 22/tcp      # SSH
    sudo ufw allow 80/tcp      # HTTP
    sudo ufw allow 443/tcp     # HTTPS
    sudo ufw allow 8081/tcp    # Staging
    sudo ufw enable
    ```

### 2.3 GitHub 仓库配置

#### 2.3.1 环境设置

1.  进入 GitHub 仓库，点击 `Settings` 标签。
2.  在左侧菜单中选择 `Environments`。
3.  点击 `New environment`，创建两个环境：`staging` 和 `production`。

#### 2.3.2 Secrets 配置

在每个环境中配置以下必要的 Secrets：

**服务器连接 (必需)**
- `SSH_PRIVATE_KEY`: SSH 私钥内容 (包含 `-----BEGIN` 和 `-----END` 行)
- `SERVER_HOST`: 服务器 IP 地址 (如: `8.140.237.185`)
- `SERVER_USER`: SSH 用户名 (通常是 `root`)

**数据库配置 (必需)**
- `DATABASE_URL`: `postgresql://user:pass@postgres:5432/dbname` (仅 `production` 环境需要)
- `POSTGRES_USER`: PostgreSQL 用户名
- `POSTGRES_PASSWORD`: PostgreSQL 密码
- `POSTGRES_DB`: 数据库名称 (仅 `production` 环境需要)

**应用配置 (必需)**
- `JWT_SECRET`: JWT 密钥 (建议为每个环境生成不同的密钥)
- `VITE_BACKEND_URL`: 前端访问后端的 URL
- `CORS_ORIGINS`: CORS 允许的源 (多个源用逗号分隔)

**staging 环境示例配置:**
```
SERVER_HOST=8.140.237.185
SERVER_USER=root
SSH_PRIVATE_KEY=[您的SSH私钥]
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[数据库密码]
JWT_SECRET=[预生产环境JWT密钥]
CORS_ORIGINS=http://xitools.furdow.com:8081
VITE_BACKEND_URL=http://xitools.furdow.com:8081/api
```

**production 环境示例配置:**
```
SERVER_HOST=8.140.237.185
SERVER_USER=root
SSH_PRIVATE_KEY=[您的SSH私钥]
DATABASE_URL=postgresql://postgres:[密码]@postgres:5432/xitools
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[数据库密码]
POSTGRES_DB=xitools
JWT_SECRET=[生产环境JWT密钥]
VITE_BACKEND_URL=https://xitools.furdow.com/api
CORS_ORIGINS=https://xitools.furdow.com,http://xitools.furdow.com
```

#### 2.3.3 分支保护规则 (可选)

如果需要代码审查，可以设置分支保护：
`Settings → Branches → Add rule`
- Branch name pattern: `main`
- ☑️ Require a pull request before merging
- ☑️ Require status checks to pass before merging

### 2.4 首次部署

1.  **测试 SSH 连接**:
    ```bash
    # 从本地测试 SSH 连接
    ssh -o StrictHostKeyChecking=no user@server "echo 'SSH 连接成功'"
    ```

2.  **推送代码触发部署**:
    ```bash
    # 推送到 develop 分支触发预生产部署
    git checkout develop
    git push origin develop

    # 推送到 main 分支触发生产部署
    git checkout main
    git push origin main
    ```

3.  **监控部署**:
    在 GitHub Actions 页面监控部署进度：`Repository → Actions → 选择对应的工作流`

4.  **验证部署**:
    ```bash
    # 检查服务状态
    ssh user@server "docker-compose -f /opt/xitools/current/docker-compose.prod.yml ps"

    # 检查应用访问
    curl -I http://your-domain.com
    ```

## 3. 详细配置

本节提供更深入的配置细节和最佳实践。

### 3.1 GitHub 环境配置核对清单

在配置 GitHub 环境时，请确保以下项已正确设置：

#### 3.1.1 `staging` 环境检查
- [ ] `SERVER_HOST` 已设置
- [ ] `SERVER_USER` 已设置
- [ ] `SSH_PRIVATE_KEY` 已设置且格式正确
- [ ] `POSTGRES_USER` 已设置
- [ ] `POSTGRES_PASSWORD` 已设置
- [ ] `JWT_SECRET` 已设置
- [ ] `CORS_ORIGINS` 已设置 (可选，但建议)
- [ ] `VITE_BACKEND_URL` 已设置 (可选，但建议)

#### 3.1.2 `production` 环境检查
- [ ] `SERVER_HOST` 已设置
- [ ] `SERVER_USER` 已设置
- [ ] `SSH_PRIVATE_KEY` 已设置且格式正确
- [ ] `DATABASE_URL` 已设置
- [ ] `POSTGRES_USER` 已设置
- [ ] `POSTGRES_PASSWORD` 已设置
- [ ] `POSTGRES_DB` 已设置
- [ ] `JWT_SECRET` 已设置
- [ ] `VITE_BACKEND_URL` 已设置
- [ ] `CORS_ORIGINS` 已设置

#### 3.1.3 安全配置建议

-   **SSH 私钥配置**:
    1.  确保 SSH 私钥格式正确（包含 `-----BEGIN` 和 `-----END` 行）。
    2.  私钥应该是完整的，包括所有换行符。
    3.  建议为 CI/CD 创建专用的 SSH 密钥对。
-   **JWT 密钥生成**:
    为每个环境生成不同的 JWT 密钥：
    ```bash
    # 生成强随机密钥
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    # 或使用 openssl
    openssl rand -hex 64
    ```
-   **数据库密码**:
    -   使用强密码。
    -   每个环境可以使用相同的数据库密码（因为数据库实例是隔离的）。
    -   确保密码不包含特殊字符，避免在 shell 中出现问题。

### 3.2 服务器端配置

#### 3.2.1 目录结构

```
/opt/
├── xitools/                    # 生产环境
│   ├── releases/
│   ├── shared/
│   └── current -> releases/xxx
├── xitools-staging/            # 预生产环境
│   ├── releases/
│   ├── shared/
│   └── current -> releases/xxx
└── xitools-development/        # 开发环境 (通常不用于远程部署)
    ├── releases/
    ├── shared/
    └── current -> releases/xxx
```

#### 3.2.2 端口分配

-   **本地开发**: 5173 (vite) → 3000 (backend) → 5432 (postgres)
-   **预生产环境**: 8081 (nginx) → 3000 (backend) → 5433 (postgres)
-   **生产环境**: 8080 (nginx) → 3000 (backend) → 5432 (postgres)

#### 3.2.3 Nginx 配置

确保系统 Nginx 配置包含以下代理规则：

```nginx
# 生产环境
server {
    listen 443 ssl;
    server_name xitools.furdow.com;
    location / {
        proxy_pass http://localhost:8080;
    }
}

# 预生产环境
server {
    listen 8081;
    server_name xitools.furdow.com;
    location / {
        proxy_pass http://localhost:8081;
    }
}
```

## 4. 部署与监控

### 4.1 持续集成 (CI) 工作流程

-   **代码检查**: ESLint + TypeScript 类型检查
-   **构建验证**: 前端和后端构建测试
-   **基础安全检查**: npm audit 依赖漏洞扫描
-   **Docker 构建验证**: 仅在 PR 时验证 Docker 构建
-   **触发条件**: PR 到 `main`/`develop` 分支，或推送到 `main`/`develop` 分支

### 4.2 自动部署 (双环境部署)

-   **预生产环境**: 仅在 PR 合并到 `develop` 分支时触发部署。
-   **生产环境**: 仅在 PR 合并到 `main` 分支时触发部署。
-   **安全机制**: 禁止直接 push 触发部署，强制代码审查流程。

### 4.3 监控和维护

#### 健康检查
```bash
# 检查远程环境状态
curl -f https://xitools.furdow.com/health          # 生产环境
curl -f http://xitools.furdow.com:8081/health      # 预生产环境

# 检查本地开发环境
curl -f http://localhost:3000/health               # 本地后端
curl -f http://localhost:5173                      # 本地前端
```

#### 日志查看
```bash
# 生产环境日志
docker-compose -f /opt/xitools/current/docker-compose.prod.yml logs -f

# 预生产环境日志
docker-compose -f /opt/xitools-staging/current/docker-compose.prod.yml logs -f
```

#### 服务管理
```bash
# 重启服务
cd /opt/xitools/current && docker-compose -f docker-compose.prod.yml restart

# 查看服务状态
cd /opt/xitools/current && docker-compose -f docker-compose.prod.yml ps

# 清理旧版本
find /opt/xitools/releases -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;
```

#### 注意事项

1.  **环境隔离**: 远程环境使用独立的数据库和端口。
2.  **密钥安全**: 不同环境使用不同的 JWT 密钥。
3.  **SSL 证书**: 仅生产环境使用 HTTPS。
4.  **本地开发**: 使用 `npm run dev` 进行本地开发，无需远程开发环境。
5.  **资源监控**: 定期检查服务器资源使用情况。
6.  **备份策略**: 定期备份生产环境数据库。

## 5. 故障排除

### 5.1 常见问题排查

-   **SSH 连接失败**:
    -   检查 SSH 私钥格式是否完整。
    -   确保服务器防火墙允许 SSH 连接。
    -   验证 `SERVER_HOST` 和 `SERVER_USER` 配置。
-   **数据库连接失败**:
    -   检查 `POSTGRES_PASSWORD` 是否正确。
    -   确认数据库服务是否启动。
    -   验证 `DATABASE_URL` 格式是否正确。
-   **构建失败**:
    -   检查 Node.js 版本是否兼容。
    -   确认依赖安装是否成功。
    -   查看 GitHub Actions 日志获取详细错误信息。
-   **健康检查失败**:
    -   等待更长时间让服务完全启动。
    -   检查 Nginx 配置是否正确。
    -   验证端口是否被正确映射。
-   **端口冲突**: 检查端口是否被其他服务占用。
-   **镜像拉取**: 确认 GitHub Container Registry 访问权限。
-   **环境变量问题**:
    -   确保所有必需的 Secrets 都已配置。
    -   检查变量名称是否完全匹配。
    -   验证数据库连接字符串格式。

### 5.2 紧急回滚

-   **手动触发**: GitHub Actions 手动回滚工作流。
-   **自动回滚**: 回滚到上一个稳定版本。
-   **基础验证**: 简单的健康检查。

```bash
# 使用 GitHub Actions 手动触发回滚
# 或者手动回滚到上一个版本
cd /opt/xitools
ln -sfn releases/[上一个版本] current
cd current && docker-compose -f docker-compose.prod.yml up -d
```

### 5.3 获取帮助

如果遇到配置问题：
1.  查看 GitHub Actions 的详细日志。
2.  检查服务器上的 Docker 容器状态。
3.  使用验证脚本诊断问题。
4.  参考本指南文档。
