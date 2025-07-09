# XItools - 智能任务看板

XItools是一个基于React和Node.js的智能任务看板应用，集成了MCP（Model Context Protocol）服务，提供智能化的任务管理体验。

## 快速启动

### 🐳 Docker部署 (推荐)

本项目提供了完整的容器化解决方案，包含前端、后端、数据库和Nginx代理。使用以下命令可以快速启动开发或生产环境。

#### 开发环境

```bash
# 启动开发环境 (支持热重载)
npm run dev
```
- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000 (直接访问)
- **Nginx代理**: http://localhost:8080 (前端通过此地址访问后端)
- **数据库**: localhost:5432 (PostgreSQL)
- **API文档**: http://localhost:3000/documentation

#### 生产环境

```bash
# 启动生产环境 (Nginx代理)
npm run prod
```
- **应用入口**: http://localhost (Nginx代理)
- **后端API**: http://localhost/api (通过Nginx代理)

#### Docker环境管理

```bash
# 查看状态 (dev/prod)
npm run docker:status:dev
npm run docker:status:prod

# 查看日志 (dev/prod)
npm run docker:logs:dev
npm run docker:logs:prod

# 停止环境 (dev/prod)
npm run docker:stop:dev
npm run docker:stop:prod

# 重启环境 (dev/prod)
npm run docker:restart:dev
npm run docker:restart:prod
```

#### Docker架构说明

XItools采用了Nginx反向代理架构，解决了前端在浏览器中无法直接访问Docker容器网络的问题：

```
浏览器前端 ←→ localhost:8080 ←→ nginx ←→ backend:3000 (API + MCP)
外部Cursor ←→ localhost:3000 ←→ backend:3000 (MCP直接访问)
```

## 核心架构

```
前端 (React + Vite)  ←→  后端 (Fastify + MCP)  ←→  数据库 (PostgreSQL)
       ↓                           ↓                          ↓
   Web + Electron            JWT认证 + Socket.IO         Prisma ORM
   多语言支持                MCP工具 (14个)             用户数据隔离
   Zustand状态管理           实时同步                   多层级结构
```

本应用采用三层组织结构：**工作区 (Workspace)** → **项目 (Project)** → **看板 (Board)**。每个层级都支持直属看板，并通过 `ownerId` 实现用户数据隔离。

## 项目结构

```
XItools/
├── frontend/          # 前端React应用 (Web + 桌面)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── electron/      # Electron桌面应用配置
├── backend/           # 后端Node.js服务 (API + MCP)
│   ├── Dockerfile
│   └── prisma/        # Prisma ORM & 数据库迁移
├── nginx/             # Nginx配置文件
├── scripts/           # 项目脚本
├── word_md/           # 项目文档
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── package.json
```

## 后端服务 (API & MCP)

后端基于 **Node.js, Fastify, TypeScript, Prisma, 和 Socket.IO** 构建，提供RESTful API和MCP服务。

### 主要功能
- **用户认证**: JWT认证、注册/登录、会话管理。
- **多级导航**: 工作区 → 项目 → 看板的三级组织结构管理。
- **实时通信**: 通过WebSocket进行多用户实时同步。
- **MCP服务**: 集成AI辅助功能，提供14个MCP工具。
- **数据持久化**: 使用PostgreSQL和Prisma ORM。

### API端点
- **认证**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **工作区**: `GET`, `POST`, `PUT`, `DELETE /api/workspaces/:id`
- **项目**: `POST`, `PUT`, `DELETE /api/projects/:id`
- **看板**: `POST`, `PUT`, `DELETE /api/boards/:id`

### MCP工具集

提供14个MCP工具用于AI交互，覆盖任务、看板列、实用工具和多看板管理。
- **任务管理**: `submit_task_dataset`, `list_tasks`, `get_task_details`, `update_task`, `delete_task`
- **看板列管理**: `get_columns`, `create_column`, `update_column`, `delete_column`, `reorder_columns`
- **实用工具**: `get_task_schema`, `clear_all_tasks`, `update_task_color`

> **重要**: 当前MCP工具不强制认证，未来将引入API Key机制。

### WebSocket 事件
- **任务事件**: `tasks_added`, `task_updated`, `task_deleted`
- **列事件**: `column_created`, `column_updated`, `column_deleted`, `columns_reordered`

## 前端应用

前端基于 **React, TypeScript, Vite, Zustand, 和 Tailwind CSS** 构建，并使用 **Electron** 提供桌面端支持。它提供了一个功能丰富、交互流畅的用户界面。

### 主题与个性化
- **主题系统**: 内置浅色、深色、樱花、海洋四套主题，支持手动和系统主题切换。
- **颜色定制**: 支持自定义看板、列和任务卡片的背景色，包括多种单色和渐变色方案。

### 核心功能

#### 多视图切换系统
提供三种任务查看方式，以适应不同场景：
- **看板视图**: 经典的多列看板，支持拖拽操作和列管理。
- **列表视图**: 紧凑的表格布局，支持批量操作、排序和快速编辑。
- **日历视图**: 按月/周展示任务截止日期，支持拖拽调整日期。

#### 任务筛选和搜索
- **实时搜索**: 按任务标题和描述进行实时搜索，支持防抖优化。
- **多维度筛选**: 按优先级、负责人等多种条件组合筛选任务。

#### 增强的任务详情面板
采用专业级的标签页布局，提供全面的任务管理功能：
- **内联编辑**: 所有字段点击即可编辑，实时自动保存。
- **Markdown编辑器**: 支持实时预览、分屏模式和格式化工具栏。
- **操作历史**: 可视化的时间线，记录任务的所有变更历史。
- **快捷操作**: 面板集成状态切换、优先级调整等常用操作。

#### 动画与交互系统
基于 **Framer Motion** 构建，提供流畅的动画体验：
- **页面过渡**: 在不同视图和页面间提供平滑的切换动画。
- **微动画**: 丰富的悬停、点击、拖拽等交互反馈。
- **快捷键系统**: 支持全局快捷键（如新建任务、搜索）和视图切换快捷键。

#### 多级导航系统
- **层级化结构**: 支持 **工作区 → 项目 → 看板** 的层级化管理。
- **便捷操作**: 通过侧边栏进行导航，悬停显示操作按钮，保持界面简洁。

#### 多语言支持 (i18n)
- **内置语言**: 支持中文和英文，可实时切换。
- **智能检测**: 自动检测浏览器语言偏好，并持久化用户选择。

## 开发与部署

## 环境与约定

### 环境配置

项目通过 `.env` 文件管理环境变量，关键变量包括：
- **前端**: `VITE_BACKEND_URL`, `VITE_API_TIMEOUT`
- **后端**: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`

### 重要约定

- **代码风格**: TypeScript严格模式, ESLint + Prettier。
- **数据库**: Prisma schema-first 设计。
- **API与安全**: Zod输入验证, JWT令牌, bcryptjs密码哈希, CORS, 数据所有权验证。

## 测试

项目提供了一系列手动测试脚本来验证MCP相关功能：
- `npm run test:mcp-tools` - 测试MCP工具
- `npm run test:mcp-sdk` - 测试MCP SDK集成
- `npm run test:mcp-native` - 测试原生MCP实现

## 📚 文档

项目的详细文档位于 `word_md/` 目录，覆盖了产品、设计、架构和开发指南。关键文档包括：

- **产品与设计**: `PROJECT_PRD.md`, `API_KEY_MANAGEMENT_UI_DESIGN.md`
- **技术与架构**: `mcp_service_design.md`, `DATABASE_MIGRATION_PLAN.md`
- **指南与参考**: `USER_SYSTEM_MIGRATION_GUIDE.md`, `mcp_tools_specification.md`

## 🔧 MCP工具使用

XItools集成了MCP工具，支持通过AI编辑器直接管理任务。

