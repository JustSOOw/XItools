# XItools 数据库架构迁移计划

## 文档说明

本文档是**技术设计文档**，详细描述了为XItools添加用户系统所需的数据库架构变更和SQL脚本。

> 📖 **相关文档**：如需了解具体的迁移操作步骤，请参考 [用户系统迁移指南](USER_SYSTEM_MIGRATION_GUIDE.md)

## 迁移概述

本文档描述了为XItools添加用户系统所需的数据库架构变更，包括新增表结构、现有表修改、索引创建等技术细节。

## 架构变更总结

### 新增模型

#### 1. User（用户模型）
```sql
-- 用户基本信息表
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 创建索引
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
```

#### 2. UserSession（用户会话模型）
```sql
-- 用户会话管理表
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- 创建索引和外键
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX "UserSession_tokenHash_idx" ON "UserSession"("tokenHash");
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");
CREATE INDEX "UserSession_isRevoked_idx" ON "UserSession"("isRevoked");

ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### 3. UserRole（用户角色模型）
```sql
-- 用户角色表（为团队协作预留）
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[],
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- 创建索引
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");
CREATE INDEX "UserRole_name_idx" ON "UserRole"("name");
CREATE INDEX "UserRole_isSystem_idx" ON "UserRole"("isSystem");
```

### 现有模型修改

#### 1. Workspace（工作区）
```sql
-- 添加用户关联字段
ALTER TABLE "Workspace" ADD COLUMN "ownerId" TEXT;

-- 创建外键约束（暂时允许NULL，迁移完成后设为NOT NULL）
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建新索引
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");
CREATE INDEX "Workspace_ownerId_isDefault_idx" ON "Workspace"("ownerId", "isDefault");
```

#### 2. Project（项目）
```sql
-- 添加用户关联字段
ALTER TABLE "Project" ADD COLUMN "ownerId" TEXT;

-- 创建外键约束
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建新索引
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");
CREATE INDEX "Project_ownerId_workspaceId_idx" ON "Project"("ownerId", "workspaceId");
```

#### 3. Board（看板）
```sql
-- 添加用户关联字段
ALTER TABLE "Board" ADD COLUMN "ownerId" TEXT;

-- 创建外键约束
ALTER TABLE "Board" ADD CONSTRAINT "Board_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建新索引
CREATE INDEX "Board_ownerId_idx" ON "Board"("ownerId");
CREATE INDEX "Board_ownerId_workspaceId_idx" ON "Board"("ownerId", "workspaceId");
CREATE INDEX "Board_ownerId_projectId_idx" ON "Board"("ownerId", "projectId");
```

#### 4. Task（任务）
```sql
-- 添加用户关联字段
ALTER TABLE "Task" ADD COLUMN "ownerId" TEXT;

-- 创建外键约束
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建新索引
CREATE INDEX "Task_ownerId_idx" ON "Task"("ownerId");
CREATE INDEX "Task_ownerId_boardId_idx" ON "Task"("ownerId", "boardId");
CREATE INDEX "Task_ownerId_status_idx" ON "Task"("ownerId", "status");
```

#### 5. Tag（标签）
```sql
-- 添加用户关联字段
ALTER TABLE "Tag" ADD COLUMN "ownerId" TEXT;

-- 删除原有的唯一约束
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_name_key";

-- 创建外键约束
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建新的唯一约束和索引
CREATE UNIQUE INDEX "Tag_ownerId_name_key" ON "Tag"("ownerId", "name");
CREATE INDEX "Tag_ownerId_idx" ON "Tag"("ownerId");
```

## 实施说明

本文档提供了完整的数据库架构设计。具体的迁移操作步骤请参考 [用户系统迁移指南](USER_SYSTEM_MIGRATION_GUIDE.md)。

## 默认数据脚本

### 创建默认用户角色
```sql
INSERT INTO "UserRole" (
    "id",
    "name",
    "displayName",
    "description",
    "permissions",
    "isSystem",
    "createdAt",
    "updatedAt"
) VALUES
(
    gen_random_uuid(),
    'admin',
    '管理员',
    '系统管理员，拥有所有权限',
    ARRAY['*'],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'user',
    '普通用户',
    '普通用户，可以管理自己的数据',
    ARRAY['read:own', 'write:own', 'delete:own', 'create:workspace', 'create:project', 'create:board', 'create:task'],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'viewer',
    '查看者',
    '只读用户，只能查看被分享的数据',
    ARRAY['read:shared'],
    true,
    NOW(),
    NOW()
);
```

### 创建默认管理员用户
```sql
INSERT INTO "User" (
    "id",
    "username",
    "email",
    "passwordHash",
    "displayName",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@xitools.local',
    '$2b$10$K7L/8Y8qY8qY8qY8qY8qYOK7L/8Y8qY8qY8qY8qY8qYOK7L/8Y8qY8', -- admin123的bcrypt哈希
    '系统管理员',
    true,
    NOW(),
    NOW()
);
```

## 回滚脚本

如果需要回滚迁移：

```sql
-- 删除外键约束
ALTER TABLE "Workspace" DROP CONSTRAINT IF EXISTS "Workspace_ownerId_fkey";
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_ownerId_fkey";
ALTER TABLE "Board" DROP CONSTRAINT IF EXISTS "Board_ownerId_fkey";
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_ownerId_fkey";
ALTER TABLE "Tag" DROP CONSTRAINT IF EXISTS "Tag_ownerId_fkey";

-- 删除ownerId字段
ALTER TABLE "Workspace" DROP COLUMN IF EXISTS "ownerId";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "ownerId";
ALTER TABLE "Board" DROP COLUMN IF EXISTS "ownerId";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "ownerId";
ALTER TABLE "Tag" DROP COLUMN IF EXISTS "ownerId";

-- 恢复Tag表的唯一约束
DROP INDEX IF EXISTS "Tag_ownerId_name_key";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- 删除用户相关表
DROP TABLE IF EXISTS "UserSession";
DROP TABLE IF EXISTS "UserRole";
DROP TABLE IF EXISTS "User";
```

## 技术注意事项

1. **外键约束**：所有ownerId字段都设置了CASCADE删除，确保数据一致性
2. **索引优化**：为常用查询模式创建了复合索引
3. **数据类型**：使用UUID作为主键，确保全局唯一性
4. **权限数组**：UserRole.permissions使用PostgreSQL数组类型存储
5. **时间戳**：所有时间字段使用TIMESTAMP(3)精确到毫秒

## 性能考虑

1. **查询优化**：为用户相关查询创建了专门的索引
2. **数据隔离**：通过ownerId字段实现高效的数据过滤
3. **会话管理**：UserSession表支持高效的token查找和清理

---

**文档类型**：技术设计文档
**创建时间**：2025-01-27
**最后更新**：2025-01-27
**负责人**：开发团队
