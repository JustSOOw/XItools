# XItools 环境配置指南

## 🌍 双环境部署架构

XItools 采用双环境部署策略，确保代码质量和部署安全：

```
本地开发环境 (Local) ← feature/* 分支 (本地开发)
    ↓
预生产环境 (Staging) ← develop 分支
    ↓
生产环境 (Production) ← main 分支
```

## 📋 环境配置清单

### GitHub 环境变量配置

在 GitHub 仓库的 Settings → Environments 中配置以下两个环境：

#### 1. staging 环境
```
SERVER_HOST=8.140.237.185
SERVER_USER=root
SSH_PRIVATE_KEY=[您的SSH私钥]
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[数据库密码]
JWT_SECRET=[预生产环境JWT密钥]
```

#### 2. production 环境
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

## 🚀 部署流程

### 本地开发环境
- **触发条件**: 本地运行 `npm run dev`
- **访问地址**: http://localhost:5173
- **数据库**: 本地Docker容器 (端口5432)
- **特点**: 热重载，调试模式，完整开发工具

### 预生产环境部署
- **触发条件**: 推送到 `develop` 分支
- **访问地址**: http://xitools.furdow.com:8081
- **数据库端口**: 5433
- **特点**: 生产级配置，发布前最终测试

### 生产环境部署
- **触发条件**: 推送到 `main` 分支
- **访问地址**: https://xitools.furdow.com
- **数据库端口**: 5432
- **特点**: 最高安全级别，SSL证书，生产优化

## 🔧 服务器端配置

### 目录结构
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
└── xitools-development/        # 开发环境
    ├── releases/
    ├── shared/
    └── current -> releases/xxx
```

### 端口分配
- **本地开发**: 5173 (vite) → 3000 (backend) → 5432 (postgres)
- **预生产环境**: 8081 (nginx) → 3000 (backend) → 5433 (postgres)
- **生产环境**: 8080 (nginx) → 3000 (backend) → 5432 (postgres)

### Nginx 配置
确保系统 nginx 配置包含以下代理规则：

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

## 🔍 监控和维护

### 健康检查
```bash
# 检查远程环境状态
curl -f https://xitools.furdow.com/health          # 生产环境
curl -f http://xitools.furdow.com:8081/health      # 预生产环境

# 检查本地开发环境
curl -f http://localhost:3000/health               # 本地后端
curl -f http://localhost:5173                      # 本地前端
```

### 日志查看
```bash
# 生产环境日志
docker-compose -f /opt/xitools/current/docker-compose.prod.yml logs -f

# 预生产环境日志
docker-compose -f /opt/xitools-staging/current/docker-compose.prod.yml logs -f
```

### 服务管理
```bash
# 重启服务
cd /opt/xitools/current && docker-compose -f docker-compose.prod.yml restart

# 查看服务状态
cd /opt/xitools/current && docker-compose -f docker-compose.prod.yml ps

# 清理旧版本
find /opt/xitools/releases -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;
```

## ⚠️ 注意事项

1. **环境隔离**: 远程环境使用独立的数据库和端口
2. **密钥安全**: 不同环境使用不同的JWT密钥
3. **SSL证书**: 仅生产环境使用HTTPS
4. **本地开发**: 使用 `npm run dev` 进行本地开发，无需远程开发环境
5. **资源监控**: 定期检查服务器资源使用情况
6. **备份策略**: 定期备份生产环境数据库

## 🚨 故障排除

### 常见问题
1. **端口冲突**: 检查端口是否被其他服务占用
2. **数据库连接**: 验证数据库服务是否正常启动
3. **镜像拉取**: 确认GitHub Container Registry访问权限
4. **健康检查失败**: 检查服务启动时间和依赖关系

### 紧急回滚
```bash
# 使用GitHub Actions手动触发回滚
# 或者手动回滚到上一个版本
cd /opt/xitools
ln -sfn releases/[上一个版本] current
cd current && docker-compose -f docker-compose.prod.yml up -d
```
