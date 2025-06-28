# XItools 后端多阶段构建Dockerfile
# 支持开发和生产环境

# 阶段1: 基础镜像
FROM node:18-alpine AS base

# 安装系统依赖
RUN apk add --no-cache \
    curl \
    openssl \
    bash \
    && rm -rf /var/cache/apk/*

# 设置工作目录
WORKDIR /app

# 阶段2: 依赖安装
FROM base AS dependencies

# 复制package文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装所有依赖
RUN npm ci

# 阶段3: 开发环境
FROM dependencies AS development

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

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

# 阶段4: 构建阶段
FROM dependencies AS build

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 阶段5: 生产环境
FROM base AS production

# 复制package文件
COPY package*.json ./
COPY prisma ./prisma/

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# 复制必要的文件
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 使用启动脚本
ENTRYPOINT ["docker-entrypoint.sh"]
