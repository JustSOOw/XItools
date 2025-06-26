# XItools Docker 部署指南

本文档描述了如何使用 Docker 部署 XItools 项目。

## 部署方式选择

### 1. Docker 部署（推荐）
使用 Docker 容器化部署，简化环境配置和依赖管理。

### 2. 传统部署
参考 `deploy/README.md` 中的传统部署方式。

---

## Docker 部署

### 前提条件
- 已安装 Docker 和 Docker Compose
- 有足够的磁盘空间和内存

### 本地测试

在部署到服务器之前，先在本地测试 Docker 配置：

```bash
# 启动本地 Docker 服务
docker-compose up --build -d

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试健康检查
curl http://localhost:3000/health

# 停止服务
docker-compose down
```

### 服务器部署步骤

#### 1. 上传项目文件到服务器
```bash
# 将整个项目上传到服务器
scp -r . user@your-server:/path/to/xitools/
```

#### 2. 配置生产环境变量
```bash
# 复制环境变量模板
cp .env.prod.example .env.prod

# 编辑生产环境配置
nano .env.prod
```

配置示例：
```env
# 数据库密码
POSTGRES_PASSWORD=your_secure_password_here

# CORS配置 - 添加你的域名
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

#### 3. 启动生产服务
```bash
# 使用生产配置启动
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

#### 4. Docker化反向代理配置
XItools使用Docker化的Nginx反向代理，配置已包含在docker-compose.prod.yml中：

```bash
# 启动包含Nginx的完整服务
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

# 检查Nginx配置
docker exec xitools-nginx-prod nginx -t

# 查看Nginx日志
docker logs xitools-nginx-prod
```

**服务架构：**
- **Nginx容器**: 监听80/443端口，处理外部请求
- **后端容器**: 内部3000端口，通过Docker网络通信
- **数据库容器**: 内部5432端口

**访问地址：**
- 主页: http://xitools.furdow.com
- MCP服务: http://xitools.furdow.com/mcp
- 健康检查: http://xitools.furdow.com/health

### 验证部署

```bash
# 运行完整测试脚本
bash deploy/test-subdomain.sh

# 或手动测试
curl http://xitools.furdow.com/health
curl -X POST http://xitools.furdow.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}'
```

### Docker 部署优势

- **环境一致性**：本地和服务器环境完全一致
- **简化部署**：无需手动安装 Node.js、PostgreSQL 等依赖
- **易于维护**：容器化管理，便于更新和回滚
- **资源隔离**：避免与服务器其他服务冲突

### 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]

# 重启服务
docker-compose restart [service_name]

# 停止服务
docker-compose down

# 更新服务
docker-compose pull
docker-compose up --build -d

# 清理未使用的镜像
docker system prune -f
```

### 故障排除

1. **端口冲突**：检查端口 3000 和 5432 是否被占用
2. **权限问题**：确保 Docker 有足够的权限访问文件
3. **内存不足**：确保服务器有足够的内存运行容器
4. **网络问题**：检查防火墙设置和网络连接

### 数据备份

```bash
# 备份数据库
docker exec xitools-postgres-prod pg_dump -U postgres xitools > backup.sql

# 恢复数据库
docker exec -i xitools-postgres-prod psql -U postgres xitools < backup.sql
```
