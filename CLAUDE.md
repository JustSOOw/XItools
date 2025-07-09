# CLAUDE.md 

此文件为 Claude Code (claude.ai/code) 在处理此代码库时提供指导。

## 架构概述

XItools 是一个集成了 MCP (模型上下文协议) 的智能任务看板应用，由 React 前端和 Node.js 后端构建。

### 核心架构

```
前端 (React + Vite)  ←→  后端 (Fastify + MCP)  ←→  数据库 (PostgreSQL)
       ↓                           ↓                          ↓
   Web + Electron            JWT认证 + Socket.IO         Prisma ORM
   多语言支持                MCP工具 (14个)             用户数据隔离
   Zustand状态管理           实时同步                   多层级结构
```

### 多层级数据结构

本应用采用三层组织结构：
- **工作区 (Workspace)** (顶层) → **项目 (Project)** (中层) → **看板 (Board)** (底层)
- 每个层级都支持直属看板（即工作区可直接包含看板）
- 所有数据模型都包含 `ownerId` 以实现用户数据隔离

### MCP 集成

XItools 提供14个MCP工具用于外部AI交互：
- 任务管理: `submit_task_dataset`, `list_tasks`, `get_task_details`, `update_task`, `delete_task`
- 看板列管理: `get_columns`, `create_column`, `update_column`, `delete_column`, `reorder_columns`
- 实用工具: `get_task_schema`, `clear_all_tasks`, `update_task_color`
- 多看板管理: 高级的工作区/项目/看板管理工具

## 重要约定

### 基础要求
-  始终使用中文回答
- 在更目录下使用“npm run dev”命令启动整个docker项目

### 代码风格
- 全局使用 **TypeScript 严格模式**
- **Prisma schema-first** 的数据库设计
- 使用 **Zod** 进行 API 输入验证
- 使用 **ESLint + Prettier** 保持格式一致

### 错误处理
- 使用标准的HTTP状态码返回**标准化的错误响应**
- 使用 **Prisma 事务**包装以保证数据一致性
- 通过 **Socket.IO 广播错误**以实现实时的错误状态

### 安全实践
- 在所有受保护的路由上进行 **JWT 令牌验证**
- 使用 **bcryptjs** 进行密码哈希
- 配置 **CORS** 处理跨域请求
- 通过检查 `ownerId` 进行**数据所有权验证**

### MCP 工具开发
- 所有MCP工具必须使用 Zod schema 验证输入
- `status` 字段必须使用看板列的 UUID，而不是列名
- 所有数据变更都应触发 WebSocket 事件
- 返回包含 `content` 数组的标准 MCP 响应格式

## 测试

项目目前使用手动测试脚本：
- `npm run test:mcp-tools` - 测试 MCP 工具功能
- `npm run test:mcp-sdk` - 测试 MCP SDK 集成
- `npm run test:mcp-native` - 测试原生 MCP 实现
