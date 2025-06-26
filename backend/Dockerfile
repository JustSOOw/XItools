# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 安装curl和openssl用于健康检查和Prisma
RUN apk add --no-cache curl openssl

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括devDependencies，用于构建）
RUN npm ci

# 复制源代码和配置文件
COPY . .
# 修复权限问题并生成Prisma客户端
RUN chmod +x node_modules/.bin/* && npm run prisma:generate

# 构建应用
RUN npm run build

# 删除devDependencies以减小镜像大小
RUN npm ci --only=production && npm cache clean --force

# 复制并设置启动脚本权限
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 使用启动脚本
ENTRYPOINT ["docker-entrypoint.sh"]
