# 前端多阶段构建Dockerfile
# 支持开发和生产环境

# 阶段1: 基础镜像
FROM node:20-alpine AS base
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 阶段2: 开发环境
FROM node:20-alpine AS development
WORKDIR /app

# 复制Docker专用的package文件（不包含Electron）
COPY package.docker.json package.json

# 设置npm配置以提高稳定性
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3

# 安装依赖（使用install而不是ci，因为没有lock文件）
RUN npm install

# 复制源代码
COPY . .

# 暴露开发服务器端口
EXPOSE 5173

# 开发环境启动命令
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# 阶段3: 构建阶段
FROM node:20-alpine AS build
WORKDIR /app

# 复制Docker专用的package文件（不包含Electron）
COPY package.docker.json package.json

# 设置npm配置以提高稳定性
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3

# 安装依赖（使用install而不是ci，因为没有lock文件）
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 阶段4: 生产环境
FROM nginx:alpine AS production

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
