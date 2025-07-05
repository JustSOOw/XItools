# XItools - 智能任务看板

XItools是一个基于React和Node.js的智能任务看板应用，集成了MCP（Model Context Protocol）服务，提供智能化的任务管理体验。


## 快速启动

### 🐳 Docker部署

Docker部署提供了完整的容器化解决方案，包含前端、后端、数据库和nginx代理。

#### 前提条件
- 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 确保Docker Desktop正在运行

#### 快速启动
```bash
# 开发环境（支持热重载）
npm run dev

# 生产环境（nginx代理）
npm run prod

# 或者使用Docker专用命令
npm run docker:dev    # 开发环境
npm run docker:prod   # 生产环境
```

#### 访问地址

**开发环境**：
- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000 (直接访问)
- **nginx代理**: http://localhost:8080 (前端通过此地址访问后端)
- **数据库**: localhost:5432 (PostgreSQL)
- **API文档**: http://localhost:3000/documentation

**生产环境**：
- **应用入口**: http://localhost (nginx代理)
- **后端API**: http://localhost/api (通过nginx代理)
- **数据库**: Docker内部网络

#### Docker环境管理
```bash
# 查看状态
npm run docker:status:dev
npm run docker:status:prod

# 查看日志
npm run docker:logs:dev
npm run docker:logs:prod

# 停止环境
npm run docker:stop:dev 
npm run docker:stop:prod

# 重启环境
npm run docker:restart:dev
npm run docker:restart:prod
```

#### Docker架构说明

XItools采用了nginx反向代理架构，解决了前端在浏览器中无法直接访问Docker容器网络的问题：

```
浏览器前端 ←→ localhost:8080 ←→ nginx ←→ backend:3000 (API + MCP)
外部Cursor ←→ localhost:3000 ←→ backend:3000 (MCP直接访问)
```

**架构优势**：
- **统一访问**：前端通过nginx统一访问后端API和MCP服务
- **MCP兼容**：外部工具（如Cursor）可直接访问MCP服务
- **网络隔离解决**：nginx解决了Docker容器网络访问问题
- **环境变量配置**：前端使用`VITE_BACKEND_URL`动态配置后端地址





## 项目结构

项目采用前后端分离架构：

```
XItools/
├── frontend/          # 前端React应用（支持Web + 桌面双端）
│   ├── Dockerfile     # 前端Docker配置
│   ├── package.docker.json # Docker专用依赖配置（无Electron）
│   ├── nginx.conf     # 前端nginx配置
│   ├── .env.development # 开发环境配置
│   ├── .env.production  # 生产环境配置
│   ├── .env.local.example # 本地环境配置示例
│   └── electron/      # Electron桌面应用配置
├── backend/           # 后端Node.js服务
│   ├── Dockerfile     # 后端Docker配置
│   ├── .env.example   # 环境配置示例
│   └── .env.development # 开发环境配置
├── nginx/             # Nginx配置文件
│   └── xitools-docker.conf # Docker环境nginx配置
├── scripts/           # Docker环境管理脚本
│   └── docker-env.cjs # Docker环境管理脚本
├── shared-types/      # 前后端共享的TypeScript类型定义
├── word_md/           # 项目文档
├── docker-compose.yml # Docker配置（开发环境）
├── docker-compose.dev.yml # Docker开发环境配置
├── docker-compose.prod.yml # Docker生产环境配置
├── package.json       # 主项目依赖
├── tsconfig.json      # TypeScript配置
├── .prettierrc        # 代码格式化配置
├── .eslintrc.js       # ESLint配置
└── .gitignore         # Git忽略配置
```

## 后端服务 (MCP服务)

后端基于Node.js + Fastify + TypeScript + Prisma + Socket.IO构建，提供以下功能：

- **用户认证系统**：JWT认证、用户注册/登录、会话管理
- **多级导航系统**：工作区 → 项目 → 看板的三级组织结构
- **RESTful API接口**：完整的CRUD操作支持
- **WebSocket实时通信**：多用户协作和实时同步
- **MCP服务集成**：提供AI辅助功能
- **PostgreSQL数据库**：可靠的数据持久化存储
- **数据隔离**：用户只能访问自己的数据
- **全局确认对话框**：统一的用户操作确认体验，支持全局弹窗显示

### 🗂️ 多级导航功能

XItools 实现了完整的三级导航系统：

#### 功能特性
- **工作区管理**：创建、重命名、删除工作区
- **项目管理**：在工作区下创建和管理项目
- **看板管理**：支持工作区直属看板和项目下看板
- **实时同步**：所有操作实时同步到后端
- **智能UI**：悬浮显示操作按钮，避免界面混乱
- **全局确认对话框**：危险操作使用全局弹窗确认，提供一致的用户体验
- **智能删除保护**：根据内容自动判断是否可删除，防止误删除有内容的容器
- **智能工具栏**：创建任务按钮仅在选中看板时显示，避免无效操作

#### 数据结构
```
工作区 (Workspace)
├── 项目 (Project)
│   └── 看板 (Board)
└── 直属看板 (Board)
```

#### API端点

**认证相关**：
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

**工作区管理**：
- `GET /api/workspaces` - 获取所有工作区（包含项目和看板）
- `POST /api/workspaces` - 创建工作区
- `PUT /api/workspaces/:id` - 更新工作区
- `DELETE /api/workspaces/:id` - 删除工作区
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目
- `POST /api/boards` - 创建看板
- `PUT /api/boards/:id` - 更新看板
- `DELETE /api/boards/:id` - 删除看板

### 技术栈

- **核心框架**: Fastify
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: JWT + bcryptjs
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

XItools的MCP服务提供了**12个工具接口**，分为任务管理（7个）和列管理（5个）两大类，供外部LLM（如Cursor编辑器中的AI）调用：

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
**返回**: 包含详细信息的任务对象，包括标签和其他元数据。
**用途**: LLM可以获取单个任务的完整信息。

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

#### 7. `clear_all_tasks`

**功能**: 删除所有任务卡片，用于测试和开发。
**参数**: 无
**返回**: 删除操作的详细结果，包括删除数量和任务列表。
**用途**: 开发和测试环境中快速清空所有任务数据。
**⚠️ 注意**: 此操作不可逆，仅建议在测试环境使用。

### 列管理工具 ✅ 新增

XItools的MCP服务还提供了完整的列管理工具集，支持动态管理看板列结构：

#### 8. `get_columns`

**功能**: 获取所有看板列，按order排序。
**参数**: 无
**返回**: 所有列的完整信息数组。
**用途**: LLM可以查询当前的看板列配置。

#### 9. `create_column`

**功能**: 创建新的看板列。
**参数**:
- `column_data`: 包含列名称、排序、颜色、是否默认等属性的对象。
**返回**: 创建的列对象，包含生成的UUID。
**处理流程**:
1. 验证列数据格式
2. 创建新列并存入数据库
3. 通过WebSocket广播`column_created`事件
4. 返回创建的列对象

#### 10. `update_column`

**功能**: 更新现有看板列的属性。
**参数**:
- `column_id`: 要更新的列ID
- `updates`: 包含要更新字段的对象（名称、排序、颜色等）
**返回**: 更新后的列对象。
**处理流程**:
1. 更新数据库中的列信息
2. 通过WebSocket广播`column_updated`事件
3. 返回更新后的列

#### 11. `delete_column`

**功能**: 删除指定的看板列。
**参数**:
- `column_id`: 要删除的列ID
**返回**: 操作结果对象。
**处理流程**:
1. 检查列中是否有任务（有任务的列无法删除）
2. 从数据库删除列
3. 通过WebSocket广播`column_deleted`事件
4. 返回操作结果

#### 12. `reorder_columns`

**功能**: 重新排序看板列。
**参数**:
- `column_ids`: 按新顺序排列的列ID数组
**返回**: 重新排序后的列数组。
**处理流程**:
1. 批量更新列的排序值
2. 通过WebSocket广播`columns_reordered`事件
3. 返回重新排序后的列数组

### WebSocket事件

MCP服务通过Socket.IO与前端进行实时通信，发送以下事件：

#### 任务相关事件
- `tasks_added`: 当新任务被添加时，携带新任务数据。
- `task_updated`: 当任务被更新时，携带更新后的任务数据。
- `task_deleted`: 当任务被删除时，携带被删除任务的ID。

#### 列管理相关事件 ✅ 新增
- `column_created`: 当新列被创建时，携带新列数据。
- `column_updated`: 当列被更新时，携带更新后的列数据。
- `column_deleted`: 当列被删除时，携带被删除列的ID。
- `columns_reordered`: 当列被重新排序时，携带新的列顺序。

### 技术栈

- Node.js + TypeScript
- Fastify
- Socket.IO
- PostgreSQL (通过Docker管理)
- Prisma ORM
- Zod (Schema验证)
- MCP SDK

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

XItools实现了完整的主题系统，支持四套精心设计的主题配色方案：

1. **浅色主题 (Light Theme)** - 清新明亮的浅色界面，适合日间使用
2. **深色主题 (Dark Theme)** - 护眼舒适的深色界面，适合夜间使用
3. **樱花主题 (Cherry Blossom Theme)** - 温柔浪漫的樱花色调，营造优雅氛围
4. **海洋主题 (Ocean Theme)** - 宁静深邃的海洋色调，带来专业感受

#### 主题功能特性

- **智能主题切换**: 支持手动切换和系统主题跟随
- **实时预览**: 主题切换即时生效，无需刷新页面
- **持久化存储**: 主题选择自动保存到本地存储
- **CSS变量驱动**: 基于CSS变量实现，确保主题一致性
- **组件级支持**: 所有UI组件都完美适配各种主题

#### 主题设置界面

- **主题预览卡片**: 直观展示各主题的配色方案
- **系统跟随选项**: 可选择跟随系统的深色/浅色模式
- **快速切换**: 支持快速循环切换主题
- **详细设置**: 提供完整的主题设置模态框

#### 技术实现

- **状态管理**: 使用Zustand管理主题状态
- **CSS变量**: 基于CSS变量实现主题切换
- **Tailwind集成**: 与Tailwind CSS完美集成
- **TypeScript支持**: 完整的类型定义和类型安全

#### 卡片和看板列背景色

除了全局主题外，XItools还提供了丰富的卡片和看板列背景色选项：

1. **基础色系**：默认白、默认灰、浅蓝、浅绿、浅紫、浅黄、浅红、浅橙、浅青、浅粉等
2. **中等饱和度色系**：天蓝、草绿、薰衣草、柠檬黄、珊瑚红等
3. **渐变色背景**：多种精美渐变色组合

用户可以通过卡片和看板列右上角的"更多"按钮，打开设置面板选择背景色，帮助视觉区分不同类型或优先级的任务。

#### 看板背景色设置

XItools提供独立的看板背景色设置功能：

- **独立于主题**：看板背景色不跟随主题切换，保持用户自定义选择
- **丰富的颜色选项**：与卡片、列使用相同的颜色方案，确保视觉一致性
- **便捷的切换方式**：右上角的看板背景色按钮，快速访问颜色选择器
- **实时预览**：颜色选择即时生效，提供最佳的用户体验
- **持久化存储**：背景色选择自动保存，下次打开应用时保持设置

### 多视图切换系统

XItools提供了三种不同的任务查看方式，满足不同场景的使用需求：

#### 1. 看板视图 (Board View) - 默认视图
- **经典看板布局**：采用类似Trello的多列看板设计
- **拖拽操作**：支持任务卡片在不同状态列间拖拽
- **列管理**：可自定义添加、编辑、删除看板列
- **自然高度**：列随卡片数量自然增长，保持内容完整可见
- **水平滚动**：仅支持水平滚动，列太多时可左右查看
- **高可见度滚动条**：滚动条样式明显可见，适应当前主题色彩
- **视觉化管理**：直观展示任务流转状态

#### 2. 列表视图 (List View) ✅ 新增
- **表格式布局**：紧凑的表格形式展示任务信息
- **批量操作**：支持多选任务进行批量操作
- **排序功能**：可按标题、状态、优先级、负责人、截止日期等字段排序
- **快速编辑**：直接在表格中修改任务状态和优先级
- **滚动优化**：采用flexbox布局，支持表格内容滚动，表头固定
- **圆角矩形设计**：统一采用看板视图的背景方案
- **适用场景**：适合查看大量任务和快速批量处理

#### 3. 日历视图 (Calendar View) ✅ 新增
- **月视图/周视图**：支持月度和周度时间视图切换
- **截止日期展示**：任务按截止日期在日历上显示
- **拖拽调整**：可拖拽任务调整截止日期
- **优先级标识**：不同优先级任务用不同颜色标识
- **智能提示**：无截止日期任务时显示非阻塞式提示，不影响操作
- **圆角矩形设计**：统一采用看板视图的背景方案
- **适用场景**：适合基于时间的任务规划和截止日期管理

#### 视图切换方式
- **侧边栏导航**：通过左侧边栏的看板、列表、日历按钮快速切换
- **状态持久化**：视图选择自动保存，下次打开应用时保持设置
- **响应式设计**：所有视图都支持不同屏幕尺寸的响应式布局

#### 技术实现细节
- **滚动优化**：使用 `flex: 1` + `min-height: 0` + `overflow: auto` 的组合解决flexbox中的滚动问题
- **表头固定**：使用 `position: sticky` 实现表格滚动时表头保持固定
- **自然布局**：看板列保持 `min-height` 设计，随内容自然增长
- **单向滚动**：看板容器仅支持水平滚动，禁用垂直滚动避免布局混乱
- **高可见度滚动条**：增强滚动条对比度，确保在所有主题下都清晰可见
- **性能优化**：大量数据时采用虚拟滚动和分页加载策略
- **用户体验**：非阻塞式提示设计，避免全屏遮罩影响操作

### 任务筛选和搜索系统 ✅ 已完成

XItools提供了强大的任务筛选和搜索功能：

#### 搜索功能
- **实时搜索**：支持按任务标题和描述进行实时搜索
- **防抖优化**：300ms防抖延迟，提升搜索性能
- **快捷清空**：支持ESC键和清空按钮快速清除搜索

#### 筛选功能
- **多维度筛选**：支持按优先级、负责人等条件筛选
- **筛选状态显示**：筛选按钮显示当前活动筛选条件数量
- **任务统计**：实时显示筛选结果统计信息
- **一键清空**：支持一键清空所有筛选条件

### 增强的任务详情面板 ✅ 新增

XItools实现了全新的任务详情面板，提供专业级的任务管理体验：

#### 标签页布局设计
- **详细信息标签页**：完整的任务信息展示和编辑
- **操作历史标签页**：任务的完整变更时间线
- **快捷操作标签页**：常用操作的快速访问面板

#### 内联编辑功能
- **点击即编辑**：所有字段支持点击直接编辑
- **实时保存**：编辑完成自动保存，无需手动确认
- **智能验证**：输入验证和错误提示
- **多种输入类型**：文本、下拉选择、日期、数字等

#### Markdown编辑器
- **实时预览**：支持编辑、预览、分屏三种模式
- **格式化工具栏**：快捷插入Markdown语法
- **自动保存**：可配置的自动保存功能
- **快捷键支持**：Ctrl+S保存、Tab缩进等

#### 操作历史时间线
- **可视化时间线**：直观展示任务的所有变更
- **事件分类**：创建、更新、状态变更、分配等不同类型
- **相对时间显示**：智能的时间格式化
- **详细元数据**：完整的变更信息记录

#### 快捷操作面板
- **状态快速切换**：一键切换任务状态
- **优先级设置**：快速调整任务优先级
- **负责人管理**：快速分配和更改负责人
- **批量操作**：复制任务、删除任务等
- **任务统计**：实时显示任务相关统计信息

#### 实时更新机制 ✅ 优化完成
- **乐观更新策略**：编辑操作立即反映在界面上，无需等待服务器响应
- **状态同步**：所有任务修改同时更新本地状态和全局状态
- **筛选状态维护**：任务更新后自动重新应用筛选条件
- **WebSocket协调**：禁用冲突的WebSocket自动更新，避免状态不一致
- **错误回滚**：操作失败时自动回滚到之前状态

### 动画与交互系统 ✅ 新增

XItools集成了基于Framer Motion的完整动画系统，提供流畅的用户体验：

#### 页面切换动画
- **视图过渡**：看板、列表、日历视图间的流畅切换动画
- **多种模式**：支持淡入淡出、滑动、缩放等多种过渡效果
- **智能等待**：使用AnimatePresence确保动画完整播放

#### 卡片微动画
- **悬停效果**：鼠标悬停时的轻微缩放和阴影变化
- **点击反馈**：按钮和卡片点击时的缩放反馈
- **拖拽状态**：拖拽时的旋转和阴影增强效果
- **出现动画**：新卡片添加时的渐入动画

#### 列表动画
- **项目进入**：列表项的错位进入动画
- **删除动画**：项目删除时的滑出动画
- **重排动画**：列表重新排序时的流畅过渡
- **加载骨架**：数据加载时的骨架屏动画

#### 模态框动画
- **多种进入方式**：缩放、滑入、淡入等多种模态框动画
- **分层动画**：头部、内容、底部的错位显示动画
- **背景模糊**：带有背景模糊效果的遮罩层
- **确认对话框**：专门优化的确认对话框动画

#### 交互反馈系统
- **操作确认**：重要操作的二次确认对话框
- **成功反馈**：操作成功的庆祝动画和视觉反馈
- **状态指示器**：加载、成功、错误等状态的动态指示
- **连接状态**：实时显示MCP服务连接状态

#### 快捷键系统
- **全局快捷键**：支持Ctrl+N新建任务、Ctrl+F搜索等
- **视图切换**：Ctrl+1/2/3快速切换视图
- **帮助系统**：按?键显示快捷键帮助面板
- **智能过滤**：自动忽略输入框中的快捷键

### 多级导航系统 ✅ 新增

XItools实现了完整的多级导航系统，支持工作区、项目、看板的层级管理：

#### 导航结构
- **工作区 (Workspace)**: 顶级容器，可包含多个项目和直属看板
- **项目 (Project)**: 中级容器，属于工作区，可包含多个看板
- **看板 (Board)**: 基础单元，可直接属于工作区或项目

#### 核心特性
- **层级化新建**: 每个层级都有对应的新建按钮，支持快速创建
- **侧边栏高亮**: 当前选中的看板在侧边栏中高亮显示，替代面包屑导航
- **悬停式操作**: 删除和新建按钮在悬停时显示，保持界面简洁
- **状态持久化**: 导航状态和展开/收起状态自动保存
- **工具栏集成**: 视图切换按钮集成到工具栏中，保持界面一致性

#### 技术实现
- **状态管理**: 使用Zustand管理导航状态
- **API服务**: 独立的多看板API服务层
- **组件化设计**: 模块化的导航组件，便于维护和扩展
- **向后兼容**: 保持现有MCP工具和单看板功能不变

### 多语言支持 (i18n) ✅ 已完成

XItools提供完整的多语言支持，目前支持中文和英文：

#### 核心特性
- **实时语言切换**：无需刷新页面即可切换语言
- **智能语言检测**：自动检测浏览器语言偏好
- **持久化存储**：记住用户的语言选择
- **类型安全**：完整的TypeScript类型支持
- **命名空间组织**：按功能模块组织翻译资源
- **错误处理集成**：统一的多语言错误消息处理
- **表单验证支持**：表单验证消息的多语言支持

#### 支持的语言
- **中文 (zh-CN)**：简体中文界面
- **English (en-US)**：英文界面

#### 覆盖范围
- **认证系统**：登录、注册、用户资料管理的完整翻译
- **错误处理**：所有认证和API错误的多语言消息
- **表单验证**：客户端验证消息的本地化
- **用户界面**：设置页面、主题选择等界面文本
- **密码强度**：密码强度指示器的多语言支持

#### 语言切换方式
- **侧边栏语言选择器**：在左侧边栏底部，支持下拉选择和紧凑模式
- **自动检测**：首次访问时自动检测浏览器语言
- **本地存储**：语言选择自动保存到localStorage

#### 翻译覆盖范围
- **界面文本**：所有按钮、标签、菜单项
- **消息提示**：成功、错误、警告等反馈信息
- **表单字段**：输入框标签和占位符文本
- **快捷键帮助**：快捷键说明和分类
- **状态文本**：加载、保存等状态提示

#### 技术实现
- **i18next + react-i18next**：业界标准的React国际化解决方案
- **命名空间拆分**：common、task、board、calendar、settings、feedback
- **动态加载**：按需加载翻译资源
- **类型定义**：完整的TypeScript类型安全支持
- **自定义Hook**：useI18n Hook提供便捷的翻译功能

#### 技术实现
- **Framer Motion**：基于业界领先的动画库
- **性能优化**：使用transform和opacity避免重排重绘
- **可配置性**：支持禁用动画以适应性能要求
- **无障碍支持**：遵循无障碍设计原则，支持减少动画偏好

### 前端状态管理

前端使用Zustand作为状态管理库，主要管理以下状态：

#### 任务状态管理 (Task Store)

`frontend/src/store/taskStore.ts`提供了任务相关的状态管理：

- **状态**:
  - `tasks`: 所有任务列表
  - `columns`: 看板列配置
  - `currentView`: 当前视图类型 (board/list/calendar)
  - `filterOptions`: 筛选条件配置
  - `filteredTasks`: 筛选后的任务列表
  - `isLoading`: 加载状态
  - `error`: 错误信息

- **操作方法**:
  - `setTasks`: 设置任务列表
  - `addTasks`: 添加新任务
  - `updateTask`: 更新任务
  - `deleteTask`: 删除任务
  - `setColumns`: 设置看板列配置
  - `setCurrentView`: 切换当前视图
  - `setFilterOptions`: 设置筛选条件
  - `clearFilters`: 清空所有筛选条件
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

### 🐳 Docker开发（推荐）

Docker开发提供了一致的开发环境，无需手动配置数据库和依赖。

#### 快速开始
```bash
# 启动开发环境（包含热重载）
npm run dev

# 或者使用Docker专用命令
npm run docker:dev
```

#### 开发环境特性
- **热重载**：代码修改自动反映到容器中
- **数据库**：自动启动PostgreSQL容器
- **网络隔离**：服务间通过Docker网络通信
- **端口映射**：
  - 前端：http://localhost:5173
  - 后端：http://localhost:3000
  - 数据库：localhost:5432

#### 常用Docker命令
```bash
# 查看服务状态
npm run docker:status:dev

# 查看实时日志
npm run docker:logs:dev

# 查看特定服务日志
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# 进入容器调试
docker exec -it xitools-backend-dev sh
docker exec -it xitools-frontend-dev sh

# 重启服务
npm run docker:restart:dev

# 停止所有服务
npm run docker:stop:dev
```

## 环境配置

XItools 提供了完整的多环境配置支持：

- **开发环境 (development)**：本地开发和调试
- **生产环境 (production)**：服务器部署

3. **本地环境 (local)**
   - 前端：http://localhost:5173
   - 后端：可配置本地或远程
   - 数据库：可配置本地或远程
   - 用途：个人开发配置

#### 快速环境切换

```bash
# 使用npm脚本（推荐）
npm run env:dev      # 切换到开发环境
npm run env:prod     # 切换到生产环境
npm run env:local    # 切换到本地环境

# 或者直接使用脚本
node scripts/env-setup.cjs development
node scripts/env-setup.cjs production
node scripts/env-setup.cjs local

# Windows用户可以使用批处理脚本
scripts\env-setup.bat development

# Linux/macOS用户可以使用shell脚本
./scripts/env-setup.sh development
```

#### 环境变量说明

**前端环境变量：**
- `VITE_BACKEND_URL`: 后端服务地址
- `VITE_API_TIMEOUT`: API请求超时时间
- `VITE_DEBUG_MODE`: 是否启用调试模式
- `VITE_LOG_LEVEL`: 日志级别

**后端环境变量：**
- `PORT`: 服务器端口
- `HOST`: 服务器主机地址
- `NODE_ENV`: 运行环境
- `DATABASE_URL`: 数据库连接字符串
- `CORS_ORIGINS`: 允许的跨域来源
- `LOG_LEVEL`: 日志级别
- `DEBUG_MODE`: 是否启用调试模式
- `JWT_SECRET`: JWT签名密钥（生产环境必须更改）
- `JWT_EXPIRES_IN`: JWT过期时间（默认7天）

### 后端开发

1. 设置开发环境:
```bash
npm run env:dev
```

2. 安装依赖:
```bash
cd backend
npm install
```

3. 初始化数据库:
```bash
npx prisma migrate dev
```

4. 启动开发服务器:
```bash
npm run dev
```

### 前端开发

1. 设置开发环境:
```bash
npm run env:dev
```

2. 安装依赖:
```bash
cd frontend
npm install
```

3. 启动开发服务器:
```bash
npm run dev
```

## 部署

### 🐳 Docker部署（推荐）

Docker部署提供了完整的生产环境解决方案，包含前端、后端、数据库和nginx反向代理。

#### 生产环境部署

1. **准备环境配置**：
```bash
# 复制生产环境配置模板
cp .env.prod.example .env.prod

# 编辑生产环境配置
nano .env.prod
```

2. **启动生产环境**：
```bash
# 使用便捷命令
npm run prod

# 或者使用Docker专用命令
npm run docker:prod

# 或者直接使用docker-compose
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

3. **验证部署**：
```bash
# 检查服务状态
npm run docker:status:prod

# 查看日志
npm run docker:logs:prod

# 测试健康检查
curl http://localhost/health
```

#### 生产环境架构

```
Internet → Nginx (Port 80/443) → Frontend (Static Files)
                                → Backend API (Port 3000)
                                → WebSocket (Socket.IO)
                                → MCP Service
Backend → PostgreSQL (Docker Network)
```

#### 生产环境特性
- **Nginx反向代理**：统一入口，处理静态文件和API代理
- **容器网络**：服务间通过Docker内部网络通信
- **数据持久化**：数据库数据持久化存储
- **健康检查**：自动监控服务健康状态
- **自动重启**：服务异常时自动重启



## 📚 文档

### 产品设计文档
- [项目PRD](./word_md/PROJECT_PRD.md) - 产品需求文档
- [前端功能设计](./word_md/frontend_features.md) - 前端功能模块详细设计

### 技术架构文档
- [MCP服务设计](./word_md/mcp_service_design.md) - MCP服务架构和接口设计
- [MCP工具规范](./word_md/mcp_tools_specification.md) - MCP工具完整规范文档
- [MCP快速参考](./word_md/mcp_quick_reference.md) - MCP工具快速参考卡片

### 用户系统文档
- [用户系统需求分析](./word_md/USER_SYSTEM_REQUIREMENTS.md) - 用户系统功能需求和架构设计
- [数据库架构迁移计划](./word_md/DATABASE_MIGRATION_PLAN.md) - 数据库架构设计和SQL脚本（技术文档）
- [用户系统迁移指南](./word_md/USER_SYSTEM_MIGRATION_GUIDE.md) - Docker环境下的迁移操作指南（操作手册）

## 🔧 MCP工具使用

XItools集成了完整的MCP（Model Context Protocol）工具，支持通过AI编辑器直接管理任务：

### 配置MCP服务器

在您的编辑器（如Cursor）中配置：

```json
{
  "mcpServers": {
    "xitools-mcp-server": {
      "command": "node",
      "args": [
        "D:/Users/JUSTsoo/Desktop/XItools/backend/mcp-client-wrapper.cjs"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 可用工具

- `get_task_schema` - 获取任务数据结构
- `submit_task_dataset` - 批量创建任务
- `list_tasks` - 查询任务列表
- `get_task_details` - 获取任务详情
- `update_task` - 更新任务
- `delete_task` - 删除任务
- `clear_all_tasks` - 删除所有任务（测试用）

### 使用示例

```
请使用submit_task_dataset工具创建一个任务：
- 标题："实现用户登录功能"
- 状态："41c632df-4c6e-470b-b1a5-bef81432a6b0"
- 优先级："High"
- 标签：["前端", "认证"]
```

详细使用方法请参考 [MCP工具规范文档](./word_md/mcp_tools_specification.md)。