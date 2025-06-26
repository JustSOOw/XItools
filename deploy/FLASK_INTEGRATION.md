# XItools与Flask项目集成部署指南

## 🏗️ 架构说明

你的服务器架构：
```
外部请求 → Flask项目的Nginx容器(80/443) → 分发到不同后端
├── furdow.com → Flask后端(5000端口)
└── xitools.furdow.com → XItools后端(3000端口)
```

**端口使用情况：**
- Flask前端：8080端口
- Flask后端：5000端口
- XItools后端：3000端口
- Nginx：80/443端口

## 📝 部署步骤

### 1. 修改Flask项目的nginx.conf

在你的Flask项目的`./nginx/nginx.conf`文件中，添加XItools的server块配置。

**找到现有的nginx.conf文件，在文件末尾添加：**

```nginx
# 将 nginx/xitools-server-block.conf 的内容复制到这里
# 或者使用 include 指令包含配置文件

# XItools子域名 - HTTP
server {
    listen 80;
    server_name xitools.furdow.com;

    # 安全头设置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 反向代理到XItools后端服务
    location / {
        proxy_pass http://host.docker.internal:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # MCP服务专用路径
    location /mcp {
        proxy_pass http://host.docker.internal:3000/mcp;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://host.docker.internal:3000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# XItools子域名 - HTTPS（如果有SSL证书）
server {
    listen 443 ssl http2;
    server_name xitools.furdow.com;

    # 使用与主域名相同的SSL证书
    ssl_certificate /etc/letsencrypt/live/furdow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/furdow.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 其他配置与HTTP相同...
    location / {
        proxy_pass http://host.docker.internal:3000;
        # ... 其他proxy设置
    }

    location /mcp {
        proxy_pass http://host.docker.internal:3000/mcp;
        # ... 其他proxy设置
    }

    location /health {
        proxy_pass http://host.docker.internal:3000/health;
        # ... 其他proxy设置
    }
}
```

### 2. 启动XItools服务

在XItools项目目录中：

```bash
# 启动XItools Docker服务
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 检查端口3000是否监听
netstat -tlnp | grep 3000
```

### 3. 重启Flask项目的Nginx

在Flask项目目录中：

```bash
# 重启Nginx容器以加载新配置
docker-compose restart nginx

# 或者重新构建并启动
docker-compose up -d --force-recreate nginx
```

### 4. 配置DNS

在你的域名管理面板中添加：
```
xitools.furdow.com  A  8.140.237.185
```

### 5. 申请SSL证书（可选）

如果需要HTTPS支持：

```bash
# 为子域名申请SSL证书
docker-compose exec certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d xitools.furdow.com
```

## 🧪 测试部署

```bash
# 测试XItools健康检查
curl http://xitools.furdow.com/health

# 测试MCP端点
curl -X POST http://xitools.furdow.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}'

# 测试主域名是否正常（确保没有影响Flask项目）
curl http://furdow.com
```

## 🔧 故障排除

### 问题1：XItools无法访问
- 检查XItools Docker服务是否运行：`docker ps | grep xitools`
- 检查端口3001是否监听：`netstat -tlnp | grep 3001`

### 问题2：Nginx配置错误
- 测试配置：`docker exec <nginx-container> nginx -t`
- 查看日志：`docker logs <nginx-container>`

### 问题3：网络连接问题
- 确保使用`host.docker.internal:3001`访问宿主机端口
- 或者将XItools加入Flask项目的网络中

## 📋 最终架构

部署完成后：
- **furdow.com** → Flask项目
- **xitools.furdow.com** → XItools项目  
- **共享同一个Nginx容器**
- **独立的后端服务和数据库**
