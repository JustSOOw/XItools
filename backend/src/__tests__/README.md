# 权限系统测试文档

## 概述

本目录包含团队协作模块的权限系统测试，覆盖以下功能：

- 项目权限管理（VIEW、EDIT）
- 权限中间件验证
- 新成员默认权限分配
- 各种权限场景的端到端测试

## 测试结构

```
backend/src/__tests__/
├── services/
│   └── permissionService.test.ts      # 权限服务单元测试
├── middleware/
│   └── permissionMiddleware.test.ts   # 权限中间件单元测试
└── integration/
    ├── permission.test.ts             # 权限API集成测试
    └── newMemberPermissions.test.ts   # 新成员权限测试
```

## 测试覆盖范围

### 1. permissionService.test.ts

测试 `permissionService` 的核心业务逻辑：

- ✅ **权限设置和更新**
  - 创建新权限
  - 更新已有权限
  - 移除权限

- ✅ **权限检查逻辑**
  - 项目所有者权限（个人项目）
  - 团队所有者权限（团队项目）
  - 成员权限检查
  - 无权限用户拒绝访问

- ✅ **编辑权限功能边界**
  - EDIT 权限允许创建/修改资源
  - EDIT 权限不允许删除项目（需要管理员）

- ✅ **查看权限功能边界**
  - VIEW 权限允许读取资源
  - VIEW 权限不允许修改资源

- ✅ **新成员默认权限**
  - 自动分配所有项目的 VIEW 权限
  - 支持自定义默认权限级别
  - 错误处理

### 2. permissionMiddleware.test.ts

测试权限中间件的正确性：

- ✅ **createPermissionMiddleware**
  - 允许有权限的用户通过
  - 拒绝无权限的用户
  - 未认证用户处理
  - 从 boardId 派生 projectId
  - 从 taskId 派生 projectId

- ✅ **requireProjectEdit & requireProjectView**
  - 编辑权限验证
  - 查看权限验证

- ✅ **createOwnershipOrPermissionVerifier**
  - 项目所有者访问
  - 团队成员权限访问
  - 无权限用户拒绝

- ✅ **requireProjectAdmin**
  - 项目所有者访问
  - 团队所有者访问
  - 非管理员拒绝

### 3. permission.test.ts

集成测试，测试完整的 API 流程：

- ✅ **权限API端点**
  - POST /api/projects/:projectId/permissions
  - GET /api/projects/:projectId/permissions
  - PUT /api/projects/:projectId/permissions/:permissionId
  - DELETE /api/projects/:projectId/permissions/:permissionId
  - GET /api/members/:memberId/permissions

- ✅ **项目权限检查**
  - 所有者可以查看和编辑
  - VIEW 权限只能查看
  - EDIT 权限可以编辑但不能删除
  - 无权限用户无法访问

- ✅ **看板权限检查**
  - EDIT 权限可以创建看板
  - VIEW 权限可以查看看板
  - VIEW 权限不能修改看板

- ✅ **任务权限检查**
  - EDIT 权限可以创建、修改、删除任务
  - VIEW 权限只能查看任务

### 4. newMemberPermissions.test.ts

专门测试新成员权限分配流程：

- ✅ **acceptInvitation 流程**
  - 自动分配所有项目的 VIEW 权限
  - 权限分配失败不中断邀请流程

- ✅ **setDefaultPermissions 功能**
  - 为所有现有项目分配权限
  - 支持自定义权限级别
  - 空项目列表处理
  - 错误处理

- ✅ **新成员权限验证**
  - 新成员可以查看所有项目
  - 新成员默认不能编辑

- ✅ **权限更新场景**
  - 管理员升级权限（VIEW → EDIT）
  - 管理员撤销权限

## 运行测试

### 安装依赖

```bash
cd backend
npm install
```

这将安装以下测试相关依赖：
- `vitest`: 测试框架
- `@vitest/coverage-v8`: 代码覆盖率工具

### 运行所有测试

```bash
npm test
```

### 运行单元测试

```bash
npm run test:unit
```

只运行 `services/` 和 `middleware/` 目录下的单元测试。

### 运行集成测试

```bash
npm run test:integration
```

只运行 `integration/` 目录下的集成测试。

### 监听模式（开发时使用）

```bash
npm run test:watch
```

文件修改时自动重新运行测试。

### 生成覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `backend/coverage/` 目录。

## 测试验收标准

根据 `tasks.md` 中的 2.1.7 测试任务，所有测试需要验证：

### ✅ 权限设置和更新
- [x] 成功创建新权限
- [x] 更新已有权限
- [x] 移除权限

### ✅ 权限检查逻辑（各种场景）
- [x] 项目所有者访问
- [x] 团队所有者访问
- [x] 成员权限访问
- [x] 无权限用户拒绝

### ✅ 编辑权限的功能边界
- [x] EDIT 权限可以创建/修改看板和任务
- [x] EDIT 权限不能删除/修改项目（需要管理员）

### ✅ 查看权限的功能边界
- [x] VIEW 权限可以查看项目、看板、任务
- [x] VIEW 权限不能修改任何资源

### ✅ 新成员默认权限
- [x] 新成员加入时自动获得所有项目的 VIEW 权限
- [x] 权限分配失败不中断邀请流程

## 注意事项

### Mock 数据库

所有测试都使用 Mock 的 Prisma Client，不会影响真实数据库。测试时无需启动 PostgreSQL 服务。

### 测试隔离

每个测试用例都在独立的环境中运行：
- `beforeEach`: 清理 mock 状态
- `afterEach`: 重置 mock

### CI/CD 集成

这些测试已集成到 CI/CD 流程中：
- PR 合并前会自动运行所有测试
- 测试失败将阻止 PR 合并

## 下一步

如果需要添加更多测试场景：

1. **在现有测试文件中添加**：
   - 找到对应的测试文件
   - 在相应的 `describe` 块中添加新的 `it` 测试

2. **创建新的测试文件**：
   - 在 `__tests__/` 目录下创建 `.test.ts` 文件
   - 文件会自动被 vitest 发现并运行

3. **更新测试配置**：
   - 修改 `vitest.config.ts` 调整测试行为
   - 修改 `package.json` 添加新的测试脚本

## 故障排查

### 测试无法运行

1. 确保已安装依赖：`npm install`
2. 检查 Node.js 版本：需要 >= 18.x
3. 清理缓存：`rm -rf node_modules && npm install`

### 测试失败

1. 查看详细错误信息：`npm test -- --reporter=verbose`
2. 运行单个测试文件：`npx vitest run src/__tests__/services/permissionService.test.ts`
3. 使用调试模式：在测试代码中添加 `console.log` 或使用 `it.only` 只运行特定测试

### Mock 不生效

1. 确保在 `beforeEach` 中正确设置 mock
2. 使用 `vi.clearAllMocks()` 清理状态
3. 检查 mock 的导入路径是否正确

## 参考资料

- [Vitest 文档](https://vitest.dev/)
- [Fastify 测试指南](https://www.fastify.io/docs/latest/Guides/Testing/)
- [Prisma 测试最佳实践](https://www.prisma.io/docs/guides/testing/unit-testing)
