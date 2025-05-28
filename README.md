# XItools - 智能任务看板

XItools是一个基于React和Node.js的智能任务看板应用，集成了MCP（Model Context Protocol）服务，提供智能化的任务管理体验。

## 项目结构

项目采用前后端分离架构：

- `frontend/`: 前端React应用
- `backend/`: 后端Node.js服务
- `shared-types/`: 前后端共享的TypeScript类型定义

## 后端服务 (MCP服务)

后端基于Node.js + Fastify + TypeScript + Prisma + Socket.IO构建，提供以下功能：

- RESTful API接口，用于任务的CRUD操作
- WebSocket实时通信
- 与MCP服务集成，提供AI辅助功能
- PostgreSQL数据库存储

### 技术栈

- **核心框架**: Fastify
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **实时通信**: Socket.IO
- **AI集成**: MCP SDK

### 目录结构

```
backend/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由定义
│   ├── services/       # 业务逻辑服务
│   ├── types/          # TypeScript类型定义
│   ├── utils/          # 工具函数
│   └── index.ts        # 应用入口
├── prisma/             # Prisma ORM配置
└── package.json        # 依赖管理
```

## 后端MCP服务

后端提供了基于MCP（模型上下文协议）的服务，用于处理任务数据并与前端进行实时通信。

### 核心功能

- 提供标准化的MCP工具接口
- 任务数据的持久化与管理
- 通过WebSocket与前端实时同步
- 支持任务的创建、查询、更新和删除

### MCP工具接口

- `get_task_schema`: 获取任务对象的JSON Schema
- `submit_task_dataset`: 提交任务数据集
- `list_tasks`: 获取任务列表
- `get_task_details`: 获取任务详情
- `update_task`: 更新任务
- `delete_task`: 删除任务

### 技术栈

- Node.js + TypeScript
- Fastify
- Socket.IO
- PostgreSQL (通过Docker管理)
- Prisma ORM
- Zod (Schema验证)
- MCP SDK

### 开发设置

1. 安装依赖：
   ```
   cd backend
   npm install
   ```

2. 创建`.env`文件或运行初始化脚本:
   ```
   node scripts/init.js
   ```

3. 启动PostgreSQL数据库:
   ```
   docker compose up -d
   ```

4. 生成Prisma客户端并运行数据库迁移:
   ```
   npm run prisma:generate
   npm run prisma:migrate:dev
   ```

5. 启动开发服务器:
   ```
   npm run dev
   ```

6. 访问API文档:
   ```
   http://localhost:3000/documentation
   ```

## 前端应用

前端基于React + TypeScript + Vite构建，提供现代化的用户界面和交互体验。

### 技术栈

- **核心框架**: React
- **构建工具**: Vite
- **语言**: TypeScript
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **UI组件**: Shadcn UI

## 开发指南

### 后端开发

1. 安装依赖:
```bash
cd backend
npm install
```

2. 设置环境变量:
复制`.env.example`为`.env`并填写必要的环境变量。

3. 初始化数据库:
```bash
npx prisma migrate dev
```

4. 启动开发服务器:
```bash
npm run dev
```

### 前端开发

1. 安装依赖:
```bash
cd frontend
npm install
```

2. 启动开发服务器:
```bash
npm run dev
```

## 部署

### 后端部署

1. 构建项目:
```bash
cd backend
npm run build
```

2. 启动服务:
```bash
npm start
```

### 前端部署

1. 构建项目:
```bash
cd frontend
npm run build
```

2. 将`dist`目录部署到Web服务器。