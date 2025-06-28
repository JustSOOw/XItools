#!/bin/sh

# XItools 后端Docker启动脚本
# 处理数据库迁移和应用启动

set -e

echo "🚀 启动XItools后端服务..."

# 等待数据库就绪
echo "⏳ 等待数据库连接..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "数据库未就绪，等待5秒后重试..."
  sleep 5
done

echo "✅ 数据库连接成功"

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
npx prisma migrate deploy || echo "⚠️ 迁移失败或无需迁移"

# 生成Prisma客户端（确保最新）
echo "🔧 生成Prisma客户端..."
npx prisma generate

echo "🎯 启动应用服务器..."

# 根据环境启动不同模式
if [ "$NODE_ENV" = "development" ]; then
  echo "🔧 开发模式启动..."
  exec npm run dev
else
  echo "🚀 生产模式启动..."
  exec npm start
fi
