# XItools - 智能任务看板

XItools是一个基于React和Node.js的智能任务看板应用，集成了MCP（Model Context Protocol）服务，提供智能化的任务管理体验。

## 快速启动

项目提供了便捷的启动脚本，可以同时启动前端、后端和浏览器工具服务：

### 使用npm脚本启动（推荐）
```bash
# 启动所有服务
npm run start:all

# 或者单独启动各服务
npm run start:frontend  # 启动前端
npm run start:backend   # 启动后端
npm run start:browser-tools  # 启动浏览器工具
```

### 直接使用脚本文件

#### Windows系统
```bash
# 在PowerShell中运行时，需要添加".\"前缀
.\start-services.bat

# 在CMD命令提示符中运行时，可直接使用
start-services.bat
```

#### Linux/macOS系统
```bash
# 给脚本添加执行权限
chmod +x start-services.sh

# 运行脚本
./start-services.sh
```

该脚本将同时启动:
- 前端开发服务器 (frontend目录下的npm run dev)
- 后端API服务器 (backend目录下的npm run dev)
- 浏览器工具服务器 (@agentdeskai/browser-tools-server)

## 项目结构

项目采用前后端分离架构：

```
XItools/
├── frontend/          # 前端React应用
├── backend/           # 后端Node.js服务
├── shared-types/      # 前后端共享的TypeScript类型定义
├── word_md/           # 项目文档
├── docker-compose.yml # Docker配置
├── package.json       # 主项目依赖
├── tsconfig.json      # TypeScript配置
├── .prettierrc        # 代码格式化配置
├── .eslintrc.js       # ESLint配置
└── .gitignore         # Git忽略配置
```

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
│   ├── routes/         # 路由定义
│   ├── services/       # 业务逻辑服务
│   ├── types/          # TypeScript类型定义
│   └── index.ts        # 应用入口
├── prisma/             # Prisma ORM配置
├── scripts/            # 脚本工具
├── package.json        # 依赖管理
├── tsconfig.json       # TypeScript配置
├── .eslintrc.js        # ESLint配置
├── .prettierrc         # Prettier配置
└── .gitignore          # Git忽略配置
```

## 后端MCP服务

后端提供了基于MCP（模型上下文协议）的服务，用于处理任务数据并与前端进行实时通信。MCP是一个开放协议，它标准化了应用程序如何向AI模型提供上下文。在XItools中，MCP服务作为连接LLM（大语言模型）与前端看板的桥梁。

### 核心功能

- 提供标准化的MCP工具接口
- 任务数据的持久化与管理
- 通过WebSocket与前端实时同步
- 支持任务的创建、查询、更新和删除

### MCP工具接口详解

XItools的MCP服务提供了以下工具接口，供外部LLM（如Cursor编辑器中的AI）调用：

#### 1. `get_task_schema`

**功能**: 获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式。
**参数**: 无
**返回**: 任务对象的JSON Schema
**用途**: LLM可以调用此工具了解任务的数据结构，确保生成的任务数据符合系统要求。

#### 2. `submit_task_dataset`

**功能**: 提交从PRD解析出的结构化任务数据集。
**参数**: 
- `tasks`: 任务对象数组，每个任务至少包含`title`和`status`字段。
**返回**: 创建成功的任务对象数组（包含生成的ID和时间戳）。
**处理流程**:
1. 验证任务数据格式
2. 使用事务将任务批量存入数据库
3. 通过WebSocket广播`tasks_added`事件
4. 返回创建的任务列表

#### 3. `list_tasks`

**功能**: 获取任务列表，支持过滤条件。
**参数**: 
- `filter_options`(可选): 包含过滤条件的对象，可按状态、优先级、负责人和标签过滤。
**返回**: 符合过滤条件的任务对象列表。
**用途**: LLM可以查询特定条件的任务，如获取所有"进行中"状态的任务或某人负责的任务。

#### 4. `get_task_details`

**功能**: 获取特定任务的详细信息。
**参数**: 
- `task_id`: 要查询的任务ID。
**返回**: 包含详细信息的任务对象，包括子任务和标签。
**用途**: LLM可以获取单个任务的完整信息，包括其层级结构。

#### 5. `update_task`

**功能**: 更新现有任务的一个或多个属性。
**参数**: 
- `task_id`: 要更新的任务ID。
- `updates`: 包含要更新字段的对象（不允许更新`id`和`createdAt`）。
**返回**: 更新后的任务对象。
**处理流程**:
1. 更新数据库中的任务
2. 通过WebSocket广播`task_updated`事件
3. 返回更新后的任务

#### 6. `delete_task`

**功能**: 删除指定的任务。
**参数**: 
- `task_id`: 要删除的任务ID。
**返回**: 操作结果对象，表示是否成功。
**处理流程**:
1. 从数据库删除任务
2. 通过WebSocket广播`task_deleted`事件
3. 返回操作结果

### WebSocket事件

MCP服务通过Socket.IO与前端进行实时通信，发送以下事件：

- `tasks_added`: 当新任务被添加时，携带新任务数据。
- `task_updated`: 当任务被更新时，携带更新后的任务数据。
- `task_deleted`: 当任务被删除时，携带被删除任务的ID。

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
   ```bash
   cd backend
   npm install
   ```

2. 创建`.env`文件或运行初始化脚本:
   ```bash
   node scripts/init.js
   ```

3. 启动PostgreSQL数据库:
   ```bash
   docker compose up -d
   ```

4. 生成Prisma客户端并运行数据库迁移:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate:dev
   ```

5. 启动开发服务器:
   ```bash
   npm run dev
   ```

6. 访问API文档:
   ```bash
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
- **实时通信**: Socket.IO-client
- **桌面应用打包**: Electron

### 目录结构

```
frontend/
├── public/             # 静态资源
│   └── favicon.svg     # 网站图标
├── src/
│   ├── assets/         # 图片、字体等资源
│   ├── components/     # 可复用组件
│   ├── hooks/          # 自定义钩子
│   ├── pages/          # 页面组件
│   ├── services/       # API服务
│   ├── store/          # 状态管理
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 应用主组件
│   ├── main.tsx        # 应用入口
│   └── index.css       # 全局样式
├── .eslintrc.js        # ESLint配置
├── .prettierrc         # Prettier配置
├── .gitignore          # Git忽略配置
├── index.html          # HTML模板
├── package.json        # 项目依赖
├── postcss.config.js   # PostCSS配置
├── tailwind.config.js  # Tailwind配置
├── tsconfig.json       # TypeScript配置
├── tsconfig.node.json  # Node模块TypeScript配置
└── vite.config.ts      # Vite配置
```

### 主题系统

前端支持四套主题配色方案：

1. 浅色主题 (Light Theme)
2. 深色主题 (Dark Theme) 
3. 柔和主题 (Soft Theme)
4. 艺术主题 (Artistic Theme)

### 前端状态管理

前端使用Zustand作为状态管理库，主要管理以下状态：

#### 任务状态管理 (Task Store)

`frontend/src/store/taskStore.ts`提供了任务相关的状态管理：

- **状态**:
  - `tasks`: 所有任务列表
  - `columns`: 看板列配置
  - `isLoading`: 加载状态
  - `error`: 错误信息

- **操作方法**:
  - `setTasks`: 设置任务列表
  - `addTasks`: 添加新任务
  - `updateTask`: 更新任务
  - `deleteTask`: 删除任务
  - `setColumns`: 设置看板列配置
  - `setLoading`: 设置加载状态
  - `setError`: 设置错误信息

#### 示例使用:

```tsx
import useTaskStore from '../store/taskStore';

// 在组件中使用
const { tasks, isLoading, error } = useTaskStore(state => ({
  tasks: state.tasks,
  isLoading: state.isLoading,
  error: state.error
}));

// 更新状态
useTaskStore.getState().addTasks([newTask]);
```

### WebSocket连接与实时通信

前端通过Socket.IO与后端MCP服务建立WebSocket连接，实现实时数据同步：

#### WebSocket服务 (Socket Service)

`frontend/src/services/socketService.ts`提供了WebSocket连接管理：

- **功能**:
  - 建立与MCP服务的WebSocket连接
  - 监听任务相关事件（`tasks_added`, `task_updated`, `task_deleted`）
  - 更新本地任务状态

#### MCP服务客户端 (MCP Service)

`frontend/src/services/mcpService.ts`提供了与MCP服务交互的方法：

- **方法**:
  - `getTaskSchema`: 获取任务Schema
  - `submitTaskDataset`: 提交任务数据集
  - `listTasks`: 获取任务列表
  - `getTaskDetails`: 获取任务详情
  - `updateTask`: 更新任务
  - `deleteTask`: 删除任务

#### MCP连接钩子 (useMcpConnection)

`frontend/src/hooks/useMcpConnection.ts`是一个自定义React钩子，用于初始化MCP连接：

- **功能**:
  - 连接到MCP服务WebSocket
  - 加载初始任务数据
  - 提供连接状态和重连方法

#### 示例使用:

```tsx
import useMcpConnection from '../hooks/useMcpConnection';

// 在组件中使用
const { isConnected, reconnect } = useMcpConnection();

// 重新连接
if (!isConnected) {
  reconnect();
}
```

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