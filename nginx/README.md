# XItools Nginx配置说明

XItools项目使用容器化Nginx架构来实现高性能和安全的Web服务。

## 配置文件说明

### 1. xitools-docker.conf
**用途**: Docker容器内的Nginx配置
**位置**: 运行在Docker容器内，直接监听80/443端口
**功能**:
- SSL终止和HTTPS处理
- 处理前端静态文件服务
- 代理后端API请求到backend容器
- 专门优化的MCP服务配置
- WebSocket支持（Socket.IO）
- CORS跨域支持

**关键特性**:
```nginx
# MCP服务专用配置
location /mcp {
    proxy_pass http://backend_servers/mcp;
    # 支持长连接和流式响应
    proxy_buffering off;
    proxy_request_buffering off;
    # WebSocket升级支持
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 2. xitools-only.conf (已弃用)
**状态**: 已弃用，不再使用
**原用途**: 系统级Nginx配置
**说明**: 项目现在完全使用容器化Nginx，无需系统级配置

**历史功能**:
- SSL终止和HTTPS处理
- 代理请求到Docker容器
- 使用现有furdow.com SSL证书

## 部署架构

```
Internet → Docker Nginx(80/443) → 应用容器
           (SSL终止+应用路由)     (业务逻辑)
```

### 流量处理流程

1. **HTTPS/HTTP请求** → Docker Nginx (xitools-docker.conf)
   - SSL证书验证和解密
   - 安全头部添加
   - 路由到对应的服务
   - API请求 → 后端容器
   - MCP请求 → 后端容器(专用配置)
   - 静态文件 → 前端容器

2. **响应返回** → 原路返回给客户端

## MCP服务优化

XItools的核心功能是MCP服务，因此在Nginx配置中进行了专门优化：

- **长连接支持**: 保持与AI编辑器的持久连接
- **流式响应**: 支持实时数据流传输
- **CORS配置**: 允许跨域访问MCP端点
- **超时设置**: 120秒超时适应AI处理时间
- **缓冲禁用**: 确保实时响应不被缓存

## 配置管理

### 开发环境
使用 `xitools-docker.conf`，通过docker-compose启动

### 生产环境
1. 系统Nginx使用 `xitools-only.conf`
2. Docker容器使用 `xitools-docker.conf`
3. 通过CI/CD自动部署和配置

### 配置更新
配置更新通过CI/CD自动完成：
- 推送代码到main分支触发自动部署
- 配置文件自动同步到服务器
- 服务自动重启应用新配置

## 故障排查

### 常见问题

1. **MCP服务无响应**
   - 检查后端容器状态
   - 验证nginx代理配置
   - 查看nginx错误日志

2. **SSL证书问题**
   - 确认furdow.com证书包含xitools.furdow.com
   - 检查证书路径和权限

3. **WebSocket连接失败**
   - 验证Upgrade头部配置
   - 检查防火墙设置

### 日志查看
```bash
# Docker nginx日志
docker-compose -f docker-compose.prod.yml logs nginx

# 系统nginx日志
tail -f /var/log/nginx/xitools.access.log
tail -f /var/log/nginx/xitools.error.log
```
