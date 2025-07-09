#!/bin/bash
# XItools数据库备份脚本
# 定期备份PostgreSQL数据库

SERVER_HOST="8.140.237.185"
SERVER_USER="root"
BACKUP_DIR="/root/XItools/backups"
RETENTION_DAYS=7

echo "🗄️ XItools数据库备份工具"

# 在服务器上执行备份
ssh "$SERVER_USER@$SERVER_HOST" << EOF
echo "📦 开始数据库备份..."

# 创建备份目录
mkdir -p $BACKUP_DIR

# 生成备份文件名
BACKUP_FILE="$BACKUP_DIR/xitools_backup_\$(date +%Y%m%d_%H%M%S).sql"

# 执行备份
cd /root/XItools
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres xitools > "\$BACKUP_FILE"

if [ \$? -eq 0 ]; then
    echo "✅ 备份完成: \$BACKUP_FILE"
    
    # 压缩备份文件
    gzip "\$BACKUP_FILE"
    echo "🗜️ 备份已压缩"
    
    # 清理旧备份（保留7天）
    find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "🧹 清理旧备份完成"
else
    echo "❌ 备份失败"
    exit 1
fi
EOF

echo "🎉 数据库备份操作完成！"
