# XItools MCP服务

基于MCP（模型上下文协议）的后端服务，用于处理任务数据并与前端进行实时通信。

## 功能概述

- 提供标准化的MCP工具接口，供外部LLM（如Cursor中的AI）调用
- 管理任务数据的持久化存储
- 通过WebSocket与前端看板应用进行实时同步
- 支持任务的创建、查询、更新和删除操作

## MCP工具接口

- `get_task_schema`: 获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式
- `submit_task_dataset`: 提交从PRD解析出的结构化任务数据集
- `list_tasks`: 获取当前任务列表，支持过滤条件
- `get_task_details`: 获取特定任务的详细信息
- `update_task`: 更新现有任务的一个或多个属性
- `delete_task`: 删除指定的任务

## 技术栈

- **语言/运行时**: Node.js
- **开发语言**: TypeScript
- **核心框架**: Fastify
- **数据库**: PostgreSQL (使用Docker管理)
- **数据库交互**: Prisma ORM
- **WebSocket通信**: Socket.IO
- **数据校验**: Zod
- **MCP SDK**: @modelcontextprotocol/sdk

## 开发设置

### 先决条件

- Node.js >=16
- Docker (用于PostgreSQL)

### 安装步骤

1. 运行初始化脚本（创建.env文件和必要目录）:
   ```
   node scripts/init.js
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 启动PostgreSQL数据库:
   ```
   docker compose up -d
   ```

4. 生成Prisma客户端:
   ```
   npm run prisma:generate
   ```

5. 运行数据库迁移:
   ```
   npm run prisma:migrate:dev
   ```

6. 启动开发服务器:
   ```
   npm run dev
   ```

服务将在 http://localhost:3000 上运行，MCP端点为 http://localhost:3000/mcp

## WebSocket事件

前端应用可以监听以下WebSocket事件：

- `tasks_added`: 当新任务被添加时触发
- `task_updated`: 当任务被更新时触发
- `task_deleted`: 当任务被删除时触发

## API文档

访问 http://localhost:3000/documentation 查看API文档。 