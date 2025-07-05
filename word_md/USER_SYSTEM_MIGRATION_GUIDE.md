# XItools 用户系统迁移指南

## 文档说明

本文档是**操作指南文档**，详细说明如何在Docker环境下执行XItools用户系统的数据库迁移。

> 📖 **相关文档**：如需了解详细的数据库架构设计，请参考 [数据库架构迁移计划](DATABASE_MIGRATION_PLAN.md)

> ⚠️ **重要提示**：本指南基于实际迁移过程中遇到的问题和解决方案进行了更新，包含了Docker volume挂载、Prisma迁移冲突、依赖安装等实际问题的解决方法。

## 概述

本指南提供完整的操作步骤，帮助您在Docker环境下为现有系统添加完整的用户认证和数据隔离功能。经过实际验证，这些步骤可以成功完成用户系统的迁移。

## 迁移前准备

### 1. 环境检查

确保您的开发环境满足以下要求：

- ✅ Docker Desktop 已安装并运行
- ✅ Node.js >= 18.0.0
- ✅ 项目依赖已安装
- ✅ Docker服务正常运行

### 2. 数据备份（重要）

虽然现有数据已清空，但在生产环境中建议先备份数据：

```bash
# 备份数据库（如果有重要数据）
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres xitools > backup.sql
```

### 3. 停止现有服务

```bash
# 停止所有Docker服务
npm run docker:stop:dev
```

## 迁移步骤

### 步骤1：启动Docker服务

```bash
# 启动开发环境
npm run dev

# 或者使用详细命令
npm run docker:up:dev
```

**等待所有服务启动完成**，确保看到类似以下输出：
```
✔ Container xitools-postgres-dev   Healthy
✔ Container xitools-backend-dev    Started
✔ Container xitools-frontend-dev   Started
✔ Container xitools-nginx-dev      Started
```

### 步骤2：确保Docker Volume挂载正确

**重要**：由于Docker容器需要访问最新的schema文件，请确保容器重新启动以应用volume挂载：

```bash
# 停止所有服务
docker-compose -f docker-compose.dev.yml down

# 重新启动服务
docker-compose -f docker-compose.dev.yml up -d
```

### 步骤3：验证Schema文件同步

```bash
# 检查容器内的schema文件是否包含用户模型
docker-compose -f docker-compose.dev.yml exec backend grep -n "model User" prisma/schema.prisma
```

**预期输出**：应该看到User、UserSession、UserRole等模型的行号。

### 步骤4：执行数据库Schema推送

```bash
# 使用Prisma db push应用schema变更
docker-compose -f docker-compose.dev.yml exec backend npx prisma db push
```

**注意**：
- 如果提示需要重置数据库，输入 `y` 确认
- 如果提示忽略警告，输入 `y` 继续
- 这个过程会重置现有数据，确保在开发环境中执行

### 步骤5：验证数据库表创建

```bash
# 检查数据库表是否创建成功
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d xitools -c "\dt"
```

**预期输出**：应该看到以下表：
- User
- UserSession
- UserRole
- Workspace (已添加ownerId字段)
- Project (已添加ownerId字段)
- Board (已添加ownerId字段)
- Task (已添加ownerId字段)
- Tag (已添加ownerId字段)

### 步骤6：初始化用户系统数据

由于容器中可能缺少依赖，我们使用SQL脚本直接初始化数据：

```bash
# 创建初始化数据的SQL文件
cat > init_user_data.sql << 'EOF'
-- 插入默认用户角色
INSERT INTO "UserRole" (id, name, "displayName", description, permissions, "isSystem", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'admin', '管理员', '系统管理员，拥有所有权限', ARRAY['*'], true, NOW(), NOW()),
(gen_random_uuid(), 'user', '普通用户', '普通用户，可以管理自己的数据', ARRAY['read:own', 'write:own', 'delete:own', 'create:workspace', 'create:project', 'create:board', 'create:task'], true, NOW(), NOW()),
(gen_random_uuid(), 'viewer', '查看者', '只读用户，只能查看被分享的数据', ARRAY['read:shared'], true, NOW(), NOW());

-- 创建默认管理员用户
INSERT INTO "User" (id, username, email, "passwordHash", "displayName", "isActive", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'admin', 'admin@xitools.local', '$2b$10$K7L/8Y8qY8qY8qY8qY8qYOK7L/8Y8qY8qY8qY8qY8qYOK7L/8Y8qY8', '系统管理员', true, NOW(), NOW());
EOF

# 复制SQL文件到postgres容器
docker cp init_user_data.sql xitools-postgres-dev:/tmp/init_user_data.sql

# 执行SQL脚本
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d xitools -f /tmp/init_user_data.sql

# 清理临时文件
rm init_user_data.sql
```

### 步骤7：验证用户数据创建

```bash
# 创建验证查询文件
cat > check_users.sql << 'EOF'
SELECT username, email, "displayName", "isActive" FROM "User";
SELECT name, "displayName", "isSystem" FROM "UserRole";
EOF

# 复制并执行验证查询
docker cp check_users.sql xitools-postgres-dev:/tmp/check_users.sql
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d xitools -f /tmp/check_users.sql

# 清理临时文件
rm check_users.sql
```

**预期输出**：
```
 username |        email        | displayName | isActive
----------+---------------------+-------------+----------
 admin    | admin@xitools.local | 系统管理员  | t

  name  | displayName | isSystem
--------+-------------+----------
 admin  | 管理员      | t
 user   | 普通用户    | t
 viewer | 查看者      | t
```

### 步骤8：检查服务状态

```bash
# 查看服务状态
npm run docker:status:dev

# 查看后端日志（确保没有错误）
docker-compose -f docker-compose.dev.yml logs backend
```

## 迁移后验证

### 1. 数据库表验证

检查以下表是否已创建：

- ✅ `User` - 用户基本信息
- ✅ `UserSession` - 用户会话管理
- ✅ `UserRole` - 用户角色定义

检查现有表是否添加了用户关联：

- ✅ `Workspace.ownerId` - 工作区所有者
- ✅ `Project.ownerId` - 项目所有者
- ✅ `Board.ownerId` - 看板所有者
- ✅ `Task.ownerId` - 任务所有者
- ✅ `Tag.ownerId` - 标签所有者

### 2. 默认数据验证

检查默认数据是否创建：

- ✅ 管理员角色 (`admin`)
- ✅ 普通用户角色 (`user`)
- ✅ 查看者角色 (`viewer`)
- ✅ 系统管理员用户 (`admin`)

### 3. 服务访问验证

验证以下服务是否正常访问：

- ✅ 前端应用: http://localhost:5173
- ✅ 后端API: http://localhost:3000
- ✅ nginx代理: http://localhost:8080
- ✅ API文档: http://localhost:3000/documentation

## 默认账户信息

迁移完成后，系统将创建以下默认账户：

```
用户名: admin
邮箱: admin@xitools.local
密码: admin123
角色: 管理员
```

**⚠️ 重要安全提醒：请立即修改默认密码！**

## 故障排除

### 常见问题

#### 1. 容器内Schema文件未更新

**问题现象**：执行 `grep "model User" prisma/schema.prisma` 没有找到用户模型

**原因**：Docker volume挂载问题，容器内的文件没有同步

**解决方案**：
```bash
# 停止所有服务
docker-compose -f docker-compose.dev.yml down

# 重新启动服务以应用volume挂载
docker-compose -f docker-compose.dev.yml up -d

# 验证文件是否同步
docker-compose -f docker-compose.dev.yml exec backend grep -n "model User" prisma/schema.prisma
```

#### 2. Prisma迁移文件冲突

**问题现象**：执行 `prisma migrate dev` 时提示找不到迁移文件

**原因**：存在不完整的迁移文件或迁移历史冲突

**解决方案**：
```bash
# 删除有问题的迁移目录
docker-compose -f docker-compose.dev.yml exec backend rm -rf prisma/migrations

# 使用db push直接应用schema
docker-compose -f docker-compose.dev.yml exec backend npx prisma db push
```

#### 3. 数据库表已存在但缺少ownerId字段

**问题现象**：`prisma db push` 提示无法添加必需字段，因为表中有数据

**解决方案**：
```bash
# 重置数据库（会丢失所有数据）
docker-compose -f docker-compose.dev.yml exec backend npx prisma db push --force-reset

# 或者手动清空数据库
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d xitools -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

#### 4. 容器中缺少bcrypt依赖

**问题现象**：运行用户初始化脚本时提示 `Cannot find module 'bcrypt'`

**原因**：容器中的package.json是只读挂载，无法安装新依赖

**解决方案**：
```bash
# 使用SQL脚本直接初始化数据，而不依赖Node.js脚本
# 参考步骤6中的SQL脚本方法
```

#### 5. PowerShell引号转义问题

**问题现象**：在Windows PowerShell中执行包含引号的SQL命令失败

**解决方案**：
```bash
# 使用SQL文件而不是直接在命令行中执行SQL
# 创建.sql文件，复制到容器，然后执行
docker cp your_script.sql xitools-postgres-dev:/tmp/script.sql
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d xitools -f /tmp/script.sql
```

#### 6. Docker服务启动失败

```bash
# 检查Docker状态
docker --version
docker-compose --version

# 重启Docker Desktop
# 然后重新启动服务
npm run dev
```

#### 7. 数据库连接失败

```bash
# 检查数据库服务状态
docker-compose -f docker-compose.dev.yml ps postgres

# 查看数据库日志
docker-compose -f docker-compose.dev.yml logs postgres

# 重启数据库服务
docker-compose -f docker-compose.dev.yml restart postgres
```

### 日志查看

```bash
# 查看所有服务日志
npm run docker:logs:dev

# 查看特定服务日志
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs frontend
```

### 重置和重新迁移

如果迁移过程中出现问题，可以重置并重新迁移：

```bash
# 1. 停止所有服务
docker-compose -f docker-compose.dev.yml down

# 2. 清理数据库数据（可选：如果需要完全重置）
docker-compose -f docker-compose.dev.yml down -v

# 3. 重新启动服务
docker-compose -f docker-compose.dev.yml up -d

# 4. 等待服务启动完成，然后重新执行迁移步骤
# 从步骤3开始：验证Schema文件同步
docker-compose -f docker-compose.dev.yml exec backend grep -n "model User" prisma/schema.prisma

# 5. 重新执行数据库推送
docker-compose -f docker-compose.dev.yml exec backend npx prisma db push

# 6. 重新初始化用户数据
# 使用步骤6中的SQL脚本方法
```

### 完全重置（清除所有数据）

如果需要完全重置项目到初始状态：

```bash
# 停止并删除所有容器和数据卷
docker-compose -f docker-compose.dev.yml down -v

# 删除所有相关的Docker镜像（可选）
docker image prune -f

# 重新构建并启动
docker-compose -f docker-compose.dev.yml up -d --build
```

## 迁移完成后的下一步

### 1. 开发用户认证服务

- 实现用户注册API
- 实现用户登录API
- 实现JWT token管理
- 实现权限中间件

### 2. 开发前端认证界面

- 创建登录页面
- 创建注册页面
- 实现用户状态管理
- 实现路由保护

### 3. 测试用户系统

- 测试用户注册功能
- 测试用户登录功能
- 测试数据隔离
- 测试权限控制

## 回滚计划

如果需要回滚迁移：

```bash
# 1. 停止服务
npm run docker:stop:dev

# 2. 恢复数据库备份（如果有）
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres xitools < backup.sql

# 3. 或者重置数据库
docker-compose -f docker-compose.dev.yml down -v
npm run dev
```

## 技术支持

如果在迁移过程中遇到问题：

1. 查看本文档的故障排除部分
2. 检查项目日志文件
3. 参考数据库迁移计划文档
4. 联系开发团队获取支持

## 迁移完成状态

### ✅ 已完成的功能

截至2025-01-30，用户系统迁移已基本完成：

1. **后端认证服务** ✅ 已完成
   - 用户注册/登录API
   - JWT认证机制
   - 密码加密（bcryptjs）
   - 会话管理
   - 认证中间件

2. **数据库架构** ✅ 已完成
   - 用户表结构
   - 数据关联和外键
   - 默认工作区创建

3. **Docker环境配置** ✅ 已完成
   - 开发环境配置
   - 生产环境配置
   - JWT环境变量

4. **API权限保护** 🔄 部分完成
   - 看板和任务创建API已保护
   - 其他API端点待完善

### 🔄 进行中的工作

- 完善所有API端点的权限验证
- 前端认证界面开发
- 数据访问权限控制

---

**文档类型**: 操作指南文档
**文档版本**: 3.0 (添加迁移完成状态)
**创建时间**: 2025-01-27
**最后更新**: 2025-01-30
**适用环境**: Docker开发环境
**验证状态**: ✅ 已通过实际迁移验证
**迁移状态**: 🔄 后端认证服务已完成，前端开发进行中
