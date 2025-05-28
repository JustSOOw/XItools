# 产品需求文档 (PRD) - 智能任务看板与MCP服务

## 1. 引言与项目愿景 (Introduction & Vision)

本项目旨在开发一个本地运行的智能任务看板桌面应用，该应用深度集成模型上下文协议 (MCP) 服务。核心愿景是：

*   **提升需求到任务的转化效率**：允许大语言模型 (LLM) 通过 MCP 服务，将产品需求文档 (PRD) 智能解析并自动生成结构化的任务卡片，展示在前端看板上。
*   **提供直观的任务管理体验**：用户可以通过类似 Trello 的看板界面，方便地查看、创建、编辑、组织和跟踪任务。
*   **增强 AI 协同能力**：使外部 LLM (如 Cursor 编辑器中的 AI) 能够通过 MCP 服务查询和修改任务状态，实现 AI 与任务管理流程的无缝协作。
*   **构建可扩展的本地工具**：提供一个稳定、高效的本地化任务管理解决方案，未来可根据需求扩展更多高级功能和集成。

## 2. 目标与衡量指标 (Goals & Measurable Outcomes)

*   **核心功能实现**：
    *   成功搭建 MCP 服务，LLM 可通过定义的工具提交任务数据集。
    *   前端看板能成功接收并展示由 MCP 服务推送的任务卡片。
    *   用户可以在前端看板进行基本的卡片操作（创建、编辑、拖拽改变状态）。
*   **用户体验**：
    *   应用启动迅速，界面响应流畅。
    *   任务卡片信息展示清晰，交互符合直觉。
*   **LLM 交互顺畅度**：
    *   LLM 能够通过 `get_task_schema` 准确理解任务数据结构。
    *   LLM 通过 `submit_task_dataset` 和 `update_task` 等工具与看板数据交互的成功率。
*   **稳定性**：应用在常规操作下无明显崩溃或数据丢失。

## 3. 目标用户与使用场景 (Target Users & Use Cases)

*   **目标用户**：
    *   **主要用户**：需要将 PRD 或需求文档快速转化为可执行任务的开发者、产品经理、项目管理者，特别是那些已经在使用或希望利用 LLM 辅助工作的用户。
    *   **次要用户**：希望有一个轻量级、本地化、可由 AI 增强的个人或小团队任务管理工具的用户。
*   **核心使用场景**：
    1.  **PRD 自动任务化**：用户在 Cursor 等编辑器中与 LLM 交互，LLM 解析 PRD 后，通过 MCP 服务将任务列表推送到本地看板的"待办"列。
    2.  **任务看板管理**：用户在前端看板上查看任务，拖拽任务卡片在不同状态列（如"进行中"、"已完成"）之间移动，编辑任务详情（描述、优先级、截止日期等）。
    3.  **LLM 查询与更新任务**：Cursor 中的 LLM 通过 MCP 服务查询特定任务的当前状态或更新任务信息。
    4.  **手动创建与管理任务**：用户直接在前端看板上创建新任务、子任务，并进行管理。

## 4. 整体解决方案与核心功能 (Proposed Solution & Key Features)

本解决方案包含两个主要部分：一个前端看板应用程序和一个后端 MCP 服务。

### 4.1. 前端看板应用

一个本地桌面应用 (通过 Electron 打包)，提供用户友好的图形界面来管理任务。详细功能见：[`frontend_features.md`](./frontend_features.md)。

*   **核心特性**：
    *   多列看板视图（状态列可自定义）。
    *   任务卡片的创建、展示（包含标题、描述、ID、优先级、截止日期、标签、子任务进度等）、编辑、拖拽。
    *   支持任务层级结构（父/子任务）。
    *   通过 WebSocket 与后端 MCP 服务实时同步任务数据。
    *   筛选与搜索功能。
    *   多种视图（看板、列表、日历）。
    *   主题切换（浅色、深色等）。

### 4.2. 后端 MCP 服务

一个本地运行的 Node.js 服务，实现了 MCP 规范，负责处理来自 LLM 的请求、管理任务数据并与前端同步。详细设计见：[`mcp_service_design.md`](./mcp_service_design.md)。

*   **核心特性**：
    *   提供 MCP 工具接口 (`submit_task_dataset`, `list_tasks`, `get_task_details`, `update_task`, `delete_task`, `get_task_schema`)。
    *   管理任务数据模型 (Task Object JSON Schema)。
    *   通过 PostgreSQL 数据库持久化任务数据。
    *   通过 WebSocket 与前端看板进行实时双向通信。
    *   遵循 JSON-RPC 2.0 协议。

## 5. 详细功能需求 (Functional Requirements)

详细的功能需求已在以下文档中定义：

*   前端看板功能细节：[./frontend_features.md](./frontend_features.md)
*   后端 MCP 服务工具和数据模型定义：[./mcp_service_design.md](./mcp_service_design.md)

## 6. 技术架构与选型 (Technical Architecture & Stack)

### 6.1. 前端

*   **UI 框架**: React
*   **构建工具**: Vite
*   **状态管理**: Zustand
*   **桌面应用打包**: Electron
*   **实时通信**: Socket.IO-client
*   **样式方案**: Tailwind CSS
*   **开发语言**: TypeScript

### 6.2. 后端 (MCP 服务)

*   **语言/运行时**: Node.js
*   **开发语言**: TypeScript
*   **核心框架**: Fastify
*   **数据库**: PostgreSQL (使用 Docker 管理)
    *   **数据库交互**: Prisma (ORM)
*   **WebSocket 通信**: Socket.IO
*   **数据校验**: Zod
*   **MCP SDK**: `@modelcontextprotocol/sdk`

## 7. 开发计划与里程碑 (Development Plan & Milestones)

以下为建议的开发阶段和各阶段的主要任务：

### **阶段 0: 环境搭建与项目初始化 (预计：1-2天)**

*   [ ] 初始化 Git 仓库。
*   [ ] 创建项目基本目录结构 (如 `frontend`, `backend`, `shared-types`)。
*   [ ] **后端**:
    *   [ ] 初始化 Node.js + TypeScript 项目 (Fastify)。
    *   [ ] 配置 ESLint, Prettier, tsconfig.json。
    *   [ ] 使用 Docker Compose 配置并启动 PostgreSQL 服务。
    *   [ ] 安装后端核心依赖 (Fastify, Socket.IO, Zod, Prisma, `@modelcontextprotocol/sdk`)。
*   [ ] **前端**:
    *   [ ] 初始化 React + TypeScript 项目 (Vite)。
    *   [ ] 配置 ESLint, Prettier, tsconfig.json。
    *   [ ] 安装前端核心依赖 (React, Zustand, Socket.IO-client, Tailwind CSS)。
    *   [ ] 初始化 Electron 项目结构并集成 Vite 开发服务器。
*   [ ] 定义共享的数据类型 (例如任务对象的基础接口，可在前后端复用)。

### **阶段 1: 后端 MCP 服务核心功能 (预计：5-7天)**

*   [ ] **数据库设计与 Prisma 配置**:
    *   [ ] 根据 `mcp_service_design.md` 中的 Task Object Schema 设计 PostgreSQL 数据库表结构。
    *   [ ] 初始化 Prisma，生成 Prisma Client。
*   [ ] **MCP 服务基础搭建**:
    *   [ ] 使用 `@modelcontextprotocol/sdk` 初始化 MCP 服务。
    *   [ ] 实现 Socket.IO 服务器，用于与前端通信和广播事件。
*   [ ] **实现核心 MCP 工具**:
    *   [ ] `get_task_schema`: 返回预定义的 JSON Schema。
    *   [ ] `submit_task_dataset`: 接收任务列表，验证数据 (Zod)，使用 Prisma 存入数据库，通过 Socket.IO 广播 `tasks_added`。
    *   [ ] `list_tasks`: 从数据库查询任务列表 (支持基础过滤)。
    *   [ ] `get_task_details`: 查询单个任务。
    *   [ ] `update_task`: 更新任务，存库，广播 `task_updated`。
    *   [ ] `delete_task`: 删除任务，广播 `task_deleted`。
*   [ ] **单元测试/集成测试**: 对核心工具进行基础的测试。

### **阶段 2: 前端看板核心 UI 与数据同步 (预计：7-10天)**

*   [ ] **基础布局与组件**:
    *   [ ] 实现 Electron 主窗口。
    *   [ ] 使用 Tailwind CSS 构建应用整体布局（例如侧边栏、主看板区域）。
    *   [ ] 开发可重用的 UI 组件 (如 `Card`, `Column`, `Button`, `Modal`)。
*   [ ] **状态管理 (Zustand)**:
    *   [ ] 设置用于存储任务列表、看板列、加载状态等的 store。
*   [ ] **WebSocket 连接与事件处理**:
    *   [ ] 实现 Socket.IO 客户端连接到后端 MCP 服务。
    *   [ ] 监听后端推送的事件 (`tasks_added`, `task_updated`, `task_deleted`) 并更新 Zustand store。
*   [ ] **看板核心功能实现**:
    *   [ ] 动态渲染看板列和任务卡片 (从 Zustand store 获取数据)。
    *   [ ] 展示任务卡片的基本信息（标题、ID、描述等）。
    *   [ ] 实现点击卡片展开/显示详情模态框。
    *   [ ] 在详情模态框中编辑任务（标题、描述等），并通过 Socket.IO 调用后端的 `update_task` MCP 工具（或通过一个包装的API）。
    *   [ ] 实现手动创建新任务的表单和逻辑，调用后端的 `submit_task_dataset`（或类似创建单个任务的API）。
*   [ ] **任务拖拽 (Drag & Drop)**:
    *   [ ] 实现卡片在不同列之间拖拽以更新状态 (调用 `update_task`)。
    *   [ ] （可选）实现卡片在同一列内排序。

### **阶段 3: LLM 核心流程集成与测试 (预计：3-5天)**

*   [ ] **模拟 LLM 客户端**: 开发一个简单的脚本或工具，模拟 LLM 客户端调用 MCP 服务的流程：
    *   [ ] 调用 `get_task_schema`。
    *   [ ] 构造符合 Schema 的任务数据集。
    *   [ ] 调用 `submit_task_dataset` 提交数据。
    *   [ ] 验证前端看板是否正确接收并展示了任务。
*   [ ] **测试 `update_task` 和 `list_tasks`**: 从模拟客户端调用这些工具，验证数据一致性和前端响应。
*   [ ] **端到端流程文档化与调试**: 梳理从"LLM 生成数据集"到"前端看板展示"的完整流程，调试解决问题。

### **阶段 4: 前端功能完善与体验优化 (预计：5-7天)**

*   [ ] **高级前端功能**:
    *   [ ] 实现子任务的创建、展示和管理。
    *   [ ] 实现任务筛选和搜索功能。
    *   [ ] 实现不同的视图切换（列表视图、日历视图 - MVP可选）。
    *   [ ] 实现自定义列的添加、删除、重命名、排序。
*   [ ] **UI/UX 优化**:
    *   [ ] 完善卡片详情面板的交互和信息展示。
    *   [ ] 优化加载状态、错误提示、空状态等。
    *   [ ] 主题切换功能实现（浅色、深色）。
*   [ ] **多语言支持 (i18n)**:
    *   [ ] 集成 i18n 库 (如 `i18next`)。
    *   [ ] 提取 UI 文本到资源文件 (中文、英文)。

### **阶段 5: 打包、测试与文档完善 (预计：3-5天)**

*   [ ] **Electron 打包**:
    *   [ ] 配置 `electron-builder` 或 `electron-forge`。
    *   [ ] 构建 Windows, macOS (如果可能) 的可执行程序。
    *   [ ] 测试打包后的应用。
*   [ ] **全面测试**:
    *   [ ] 进行功能测试、用户体验测试。
    *   [ ] 修复发现的 Bug。
*   [ ] **文档完善**:
    *   [ ] 更新 README.md，包括项目介绍、如何运行、如何构建。
    *   [ ] 整理用户手册（如果需要）。
    *   [ ] 确保所有设计文档 (`frontend_features.md`, `mcp_service_design.md`, `PROJECT_PRD.md`) 是最终状态。

**总预计时间**: 约 24-36 工作日 (这是一个初步估计，实际时间会根据具体情况调整)

## 8. 非功能性需求 (Non-Functional Requirements)

*   **性能**: 应用应在本地流畅运行，常规操作（如拖拽、打开详情）响应时间应在可接受范围内。
*   **易用性**: 界面直观，核心功能易于上手。符合标准桌面应用的操作习惯。
*   **可靠性**: 本地数据存储应可靠，避免数据丢失。应用在常规使用下应保持稳定。
*   **可维护性**: 代码结构清晰，注释良好，便于后续迭代和维护。
*   **安全性**: 由于是本地应用且初期不涉及复杂认证，主要关注本地数据安全和防止恶意脚本注入（如果从外部加载内容）。

## 9. 未来展望 (Future Considerations)

参考 `frontend_features.md` 和 `mcp_service_design.md` 中"未来迭代/增强"部分，例如：

*   更高级的过滤和排序。
*   团队协作功能 (需要用户认证和更复杂的后端)。
*   与其他工具的集成。
*   更完善的 AI 增强功能（由 MCP 服务直接提供，而非仅依赖外部 LLM）。

## 10. 附录 (Appendix)

*   **前端功能设计文档**: [./frontend_features.md](./frontend_features.md)
*   **后端 MCP 服务设计文档**: [./mcp_service_design.md](./mcp_service_design.md)

--- 