# XItools云端部署指南

## 🎯 部署目标
将XItools的MCP服务部署到furdow.com服务器，实现云端MCP服务供LLM访问。

## 📋 文件说明

- `furdow-docker-compose.yml` - Docker容器配置
- `xitools-nginx.conf` - Nginx反向代理配置
- `README.md` - 本部署说明

## 🚀 部署步骤

### 1. 上传项目到服务器
```bash
# 上传整个项目
rsync -avz --progress ./XItools/ root@您的服务器IP:/opt/xitools/
```

### 2. 配置DNS解析
在阿里云控制台添加A记录：
```
主机记录: xitools
记录值: 您的服务器IP
```

### 3. 服务器配置
```bash
# 连接服务器
ssh root@您的服务器IP

# 进入项目目录
cd /opt/xitools

# 复制Docker配置
cp deploy/furdow-docker-compose.yml docker-compose.yml

# 创建环境变量
cat > .env << 'EOF'
XITOOLS_DB_PASSWORD=your_secure_password_here
EOF
```

### 4. 配置Nginx
```bash
# 复制Nginx配置
sudo cp deploy/xitools-nginx.conf /etc/nginx/sites-available/xitools.furdow.com

# 启用站点
sudo ln -s /etc/nginx/sites-available/xitools.furdow.com /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

### 5. 申请SSL证书
```bash
sudo certbot --nginx -d xitools.furdow.com --email your-email@example.com --agree-tos --non-interactive
```

### 6. 启动服务
```bash
# 启动Docker服务
docker-compose up -d

# 运行数据库迁移
sleep 30
docker exec xitools-backend npm run prisma:migrate:deploy
```

## ✅ 验证部署

```bash
# 检查服务状态
docker-compose ps

# 测试健康检查
curl https://xitools.furdow.com/health

# 测试MCP端点
curl -X POST https://xitools.furdow.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}'
```

## 🔧 Cursor配置

创建 `.cursor/mcp.json`：
```json
{
  "mcpServers": {
    "xitools-furdow": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "https://xitools.furdow.com/mcp"
      ]
    }
  }
}
```

## 🔧 本地前端配置

修改 `frontend/.env.production`：
```env
VITE_CLOUD_BACKEND_URL=https://xitools.furdow.com
```

## 📊 端口使用

| 服务 | 端口 | 说明 |
|------|------|------|
| 现有Flask | 5000 | 不冲突 |
| 现有Vue | 8080 | 不冲突 |
| XItools后端 | 3001 | 新增 |
| XItools数据库 | 5433 | 新增 |
