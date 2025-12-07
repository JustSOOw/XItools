# TaskHistory 数据库 Schema 变更说明

## 变更内容

添加了 `TaskHistory` 模型，用于记录任务的所有变更历史。

### 新增模型：TaskHistory

```prisma
model TaskHistory {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  action    String   // 操作类型：created, updated, deleted, status_changed, assigned, unassigned
  field     String?  // 变更的字段名称
  oldValue  String?  // 旧值（JSON 字符串）
  newValue  String?  // 新值（JSON 字符串）
  changes   Json?    // 完整的变更内容（JSON 格式）

  createdAt DateTime @default(now())

  @@index([taskId])
  @@index([userId])
  @@index([taskId, createdAt])
}
```

### 关联关系变更

1. **Task 模型**：添加 `history TaskHistory[]` 关联
2. **User 模型**：添加 `taskHistory TaskHistory[]` 关联

## 应用变更

### 开发环境

```bash
cd backend
npx prisma db push
```

### 生产环境

由于项目当前使用 `prisma db push`（无迁移目录），在生产环境同样使用：

```bash
cd backend
npx prisma db push
```

**注意**：`prisma db push` 会直接同步 schema 到数据库，不生成迁移文件。

### 如果需要使用迁移（推荐用于生产）

如果未来需要使用迁移系统，可以执行：

```bash
# 初始化迁移系统（首次）
npx prisma migrate dev --name init

# 创建新迁移
npx prisma migrate dev --name add_task_history

# 生产环境应用迁移
npx prisma migrate deploy
```

## 回滚方案

如果需要回滚此变更：

1. 从 `schema.prisma` 中删除 `TaskHistory` 模型
2. 从 `Task` 模型中删除 `history` 字段
3. 从 `User` 模型中删除 `taskHistory` 字段
4. 运行 `npx prisma db push`

或直接执行 SQL：

```sql
DROP TABLE IF EXISTS "TaskHistory";
```

## 数据影响

- **破坏性变更**：否
- **数据迁移需求**：否（新表，无需迁移现有数据）
- **索引影响**：新增3个索引，提升查询性能

## 验证

变更应用后，验证表是否正确创建：

```bash
npx prisma studio
```

或通过 SQL 查询：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'TaskHistory';
```

## 相关文件

- `backend/prisma/schema.prisma` - Schema 定义
- `backend/src/services/taskHistoryService.ts` - 业务逻辑（待创建）
- `backend/src/types/taskHistoryTypes.ts` - 类型定义（待创建）

---

**变更日期**：2025-11-20
**责任人**：Claude Code
**相关任务**：第三阶段任务 3.2 - 任务历史增强
