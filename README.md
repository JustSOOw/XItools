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

XItools采用了完全容器化的Nginx反向代理架构，解决了前端在浏览器中无法直接访问Docker容器网络的问题：

```
浏览器前端 ←→ 80/443端口 ←→ Docker Nginx ←→ backend:3000 (API + MCP)
外部Cursor ←→ localhost:3000 ←→ backend:3000 (MCP直接访问)
```

容器化Nginx直接处理SSL终止，使用Let's Encrypt证书提供HTTPS服务，无需系统级Nginx配置。

## 核心架构

```
前端 (React + Vite)  ←→  后端 (Fastify + MCP)  ←→  数据库 (PostgreSQL)
       ↓                           ↓                          ↓
   Web + Electron            JWT认证 + Socket.IO         Prisma ORM
   多语言支持                MCP工具 (14个)             用户数据隔离
   Zustand状态管理           实时同步                   多层级结构
```

本应用采用三层组织结构：**工作区 (Workspace)** → **项目 (Project)** → **看板 (Board)**。每个层级都支持直属看板，并通过 `ownerId` 实现用户数据隔离。

## 🏗️ 双通道架构设计

XItools 采用**双通道架构**，前端用户操作和 MCP 工具操作完全分离，通过 WebSocket 实现数据实时同步：

### 通道 1：前端用户操作（浏览器）

```
浏览器 → taskService.ts → REST API (/api/tasks/*)
                          ↓
                     JWT Token 认证
                          ↓
                   taskRoutes.ts → Prisma ORM
                          ↓
              WebSocket 广播 (tasks_batch_created, task_created)
```

**关键特点**：
- 使用标准 REST API（GET、POST、PUT、DELETE）
- JWT Token 认证（用户登录后自动获取）
- 适用于所有浏览器中的用户操作

### 通道 2：MCP 工具操作（外部 AI）

```
Cursor/Claude → 内置 MCP 客户端 → MCP 协议 (/mcp-auth)
                                      ↓
                                API Key 认证
                                      ↓
                        authenticatedMcpService.ts → Prisma ORM
                                      ↓
                      WebSocket 广播 (tasks_added)
```

**关键特点**：
- 使用 JSON-RPC 2.0 协议（MCP 标准）
- API Key 认证（在网站"设置"中创建）
- 外部独立程序（不依赖前端代码）

### 实时同步机制

```
┌─────────────────────────────────────────────────────────────┐
│                    数据流完整图示                             │
└─────────────────────────────────────────────────────────────┘

通道 1: 浏览器用户创建任务
    ↓
taskService.ts (REST API)
    ↓
后端 taskRoutes.ts → Prisma.create() → WebSocket 广播
    ↓                                         ↓
数据库                                  所有客户端接收
    ↑                                         ↑
后端 authenticatedMcpService.ts → Prisma.create() → WebSocket 广播
    ↑
MCP 工具 (JSON-RPC)
    ↑
通道 2: Cursor/Claude 创建任务
```

### 核心原则

| 特性 | 前端用户操作 | MCP 工具操作 |
|------|------------|-------------|
| **运行环境** | 浏览器 JavaScript | 桌面应用（Cursor.app、Claude.app） |
| **代码位置** | `frontend/src/services/taskService.ts` | Cursor/Claude 内置客户端 |
| **通信协议** | REST API（HTTP） | JSON-RPC 2.0（MCP 标准） |
| **认证方式** | JWT Token | API Key |
| **API 端点** | `/api/tasks/*`, `/api/boards/*` 等 | `/mcp-auth` |
| **数据存储** | Prisma ORM → PostgreSQL | Prisma ORM → PostgreSQL（相同） |
| **实时同步** | WebSocket (`tasks_batch_created`) | WebSocket (`tasks_added`) |
| **依赖关系** | 依赖后端 REST API | **不依赖前端代码** |

**重要说明**：
- ✅ 前端 **不使用** MCP 协议，只使用 REST API
- ✅ MCP 工具是**外部独立程序**，修改前端代码不会影响 MCP 工具
- ✅ 两个通道通过 **WebSocket** 实现数据实时同步
- ✅ 数据格式完全一致（都来自 Prisma Schema）

### 前端核心服务文件

**taskService.ts**
- **作用**：前端用户操作的核心服务
- **使用场景**：浏览器中的所有任务操作（创建、更新、删除等）
- **协议**：REST API（**不是** MCP 协议！）
- **认证**：JWT Token
- **与 MCP 关系**：完全独立，修改此文件不影响 MCP 工具

**socketService.ts**
- **作用**：WebSocket 实时同步服务
- **监听事件**：
  - `tasks_added` - MCP 工具创建的任务
  - `tasks_batch_created` - 前端批量创建的任务
  - `task_created` - 前端单个创建的任务
  - 其他更新、删除事件
- **核心功能**：确保所有客户端（MCP 工具和浏览器）的数据实时同步

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
│   ├── xitools-docker.conf    # Docker容器内Nginx配置
│   └── xitools-only.conf      # 系统Nginx配置
├── scripts/           # 部署和管理脚本
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

提供19个MCP工具用于AI交互，覆盖任务管理、看板列管理、项目管理和实用工具。
- **任务管理**: `submit_task_dataset`, `list_tasks`, `get_task_details`, `update_task`, `delete_task`
- **看板列管理**: `get_columns`, `create_column`, `update_column`, `delete_column`, `reorder_columns`
- **项目管理**: `get_workspaces`, `get_projects`, `get_boards`, `create_project`, `create_board`
- **实用工具**: `get_task_schema`, `clear_all_tasks`, `update_task_color`, `get_user_hierarchy`

> **重要**: MCP 服务已支持 API Key 认证；请在客户端按下方配置方式携带 Authorization 头。

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

项目的详细文档位于 `docs/` 目录，覆盖了产品、设计、架构和开发指南。关键文档包括：

### CI/CD 部署文档
- **[CI/CD 部署指南](./docs/cicd/unified-ci-cd-guide.md)** - 统一的 CI/CD 部署指南


### 产品与技术文档
- **产品与设计**: `docs/product/PROJECT_PRD.md`, `docs/design/API_KEY_MANAGEMENT_UI_DESIGN.md`
- **技术与架构**: `docs/design/mcp_service_design.md`, `docs/design/DATABASE_MIGRATION_PLAN.md`
- **指南与参考**: `docs/design/USER_SYSTEM_MIGRATION_GUIDE.md`, `docs/mcp/mcp_tools_specification.md`

## 🌿 Git Flow 分支模型

XItools 采用简化版 Git Flow 分支模型，在复杂性和实用性之间取得完美平衡：

### 分支架构
```
main (生产环境) ← develop (预发布环境) ← feature/* (功能开发)
```

### 分支说明
- **main**: 生产就绪代码，触发生产环境部署 (https://xitools.furdow.com)
- **develop**: 集成分支，触发预发布环境部署 (http://xitools.furdow.com:8081)
- **feature/***: 功能开发分支，触发 CI 检查，完成后删除

### 工作流程
1. 从 `develop` 创建 `feature/功能名` 分支
2. 开发完成后创建 PR 到 `develop`
3. 代码审查通过后合并，自动部署到预发布环境
4. 测试通过后创建 PR 从 `develop` 到 `main`
5. 合并后自动部署到生产环境

📋 **详细规则**: 查看 [Git Flow 规则文档](.augment/rules/gitflow.md)

## 🚀 简化版 CI/CD 部署

XItools 采用简化的 CI/CD 部署方案，基于 GitHub Actions 实现自动化构建和部署，专注于实用性和可靠性。

### 部署架构

```
GitHub → 简化 CI/CD → Docker Registry → Production Server
   ↓           ↓              ↓                    ↓
代码推送 → 代码检查构建 → 镜像存储 → 自动部署更新
```
   
### 工作流程

#### 持续集成 (CI)
- **代码检查**: ESLint + TypeScript 类型检查
- **构建验证**: 前端和后端构建测试
- **基础安全检查**: npm audit 依赖漏洞扫描
- **Docker构建验证**: 仅在 PR 时验证 Docker 构建
- **触发条件**: PR 到 main/develop 分支，或推送到 main/develop 分支

#### 自动部署 (双环境部署)
- **预生产环境**: 仅在PR合并到 `develop` 分支时触发部署
- **生产环境**: 仅在PR合并到 `main` 分支时触发部署
- **安全机制**: 禁止直接push触发部署，强制代码审查流程

#### 数据库初始化与管理员自动化（重要）
- 后端容器启动时将自动处理数据库：
  - 若存在 Prisma 迁移目录 prisma/migrations，则执行 `prisma migrate deploy`
  - 若无迁移目录（当前仓库），则执行 `prisma db push` 以同步 schema，确保首次部署可用
- 健康检查将额外验证认证接口的基本可用性（401/400），帮助尽早发现数据库未初始化的问题

#### 紧急回滚
- **手动触发**: GitHub Actions 手动回滚工作流
- **自动回滚**: 回滚到上一个稳定版本
- **基础验证**: 简单的健康检查

### 部署监控

```bash
# 健康检查
npm run health-check

# 查看服务状态
ssh root@8.140.237.185 "docker-compose -f /opt/xitools/current/docker-compose.prod.yml ps"

# 查看应用日志
ssh root@8.140.237.185 "docker-compose -f /opt/xitools/current/docker-compose.prod.yml logs -f"

# 验证所有环境部署状态
npm run verify:deployment

# 快速检查环境可访问性
npm run verify:deployment:quick
```

### 手动操作

```bash
# 完整备份
npm run backup

# 仅备份数据库
npm run backup:database

# 快速回滚到上一版本
npm run rollback:auto
```

### 访问地址

- **生产环境**: https://xitools.furdow.com (容器化Nginx直接提供HTTPS服务)
- **预生产环境**: http://xitools.furdow.com:8081
- **健康检查**: https://xitools.furdow.com/health
- **API文档**: https://xitools.furdow.com/api/documentation

### 环境对应关系

| 环境 | 分支 | 访问地址 | 数据库端口 | 用途 |
|------|------|----------|------------|------|
| 生产环境 | `main` | https://xitools.furdow.com | 5432 | 正式发布版本 |
| 预生产环境 | `develop` | http://xitools.furdow.com:8081 | 5433 | 发布前测试 |

**注意**: `feature/*` 分支仅进行CI检查（代码质量、构建验证），不进行远程部署。开发者使用本地环境 (`npm run dev`) 进行功能开发和测试。

## 🔧 MCP工具使用

XItools集成了MCP（Model Context Protocol）工具，支持通过AI编辑器直接管理任务。

### 🚀 快速配置

1. **获取API Key**：在XItools网站的"设置" → "API密钥管理"中创建
2. **配置AI客户端**：

**Cursor配置（远程服务器）**：
```json
{
  "mcpServers": {
    "xitools": {
      "type": "streamable-http",
      "url": "https://xitools.furdow.com/mcp-auth",
      "headers": {
        "Authorization": "Bearer xitool_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

**Augment配置（远程服务器｜双通道推荐）**：
```json
{
  "mcpServers": {
    "xitools": {
      "url": "https://xitools.furdow.com/mcp-auth?api_key=xitool_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "headers": {
        "Authorization": "Bearer xitool_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "X-Api-Key": "xitool_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

> **重要提示**：确保API密钥具有 `mcp:read` 和 `mcp:write` 权限。Cursor 必须包含 `type: "streamable-http"`；Augment Code 不支持 `type` 字段，且建议采用“URL 查询参数 + Headers（Authorization 与 X-Api-Key）”的双通道传递，以兼容其个别阶段可能不携带 Authorization 头的情况。

**Claude Desktop配置**：
```json
{
  "mcpServers": {
    "xitools": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://xitools.furdow.com/mcp-auth",
        "--header",
        "Authorization: Bearer xitool_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      ]
    }
  }
}
```

3. **开始使用**：重启AI客户端，询问"请列出我的任务"

### 🧭 创建任务的推荐流程（强约束）

1. 若无项目/看板/列：
   - 调用 `create_project`（参数：name, workspaceId）
   - 调用 `create_board`（参数：name, projectId）
   - 调用 `create_column`（参数：column_data，包括 boardId、name、order 等）
2. 若已存在：
   - 调用 `get_user_hierarchy` 获取完整层级（工作区→项目→看板→列），记录目标 `boardId` 与列 `status`（列UUID）
3. 使用 `submit_task_dataset` 批量创建任务。每个任务对象必须包含：
   - `title`：任务标题
   - `boardId`：看板UUID（不可用名称）
   - `status`：列UUID（不可用列名）。如不清楚，请先调用 `get_user_hierarchy` 或 `get_columns`。

示例：
```json
{
  "jsonrpc":"2.0","id":"2","method":"tools/call",
  "params":{"name":"submit_task_dataset","arguments":{
    "tasks":[{"title":"修复登录异常","boardId":"<板UUID>","status":"<列UUID>"}]}}
}
```

### 测试账号
test@test.com
test123



### 📚 详细文档

完整的配置指南请参考：[MCP设置指南](docs/mcp/mcp-setup-guide.md)
