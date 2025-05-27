# 后端 MCP 服务设计文档

## 1. 引言与概述

本文档旨在详细描述本地 MCP (Model Context Protocol) 服务的设计与功能。该服务是整个智能任务管理系统的核心后端组件，充当大语言模型 (LLM) 与前端看板应用之间的桥梁，并负责任务数据的持久化、管理以及实时同步。

核心目标是提供一组标准化的接口 (MCP Tools)，允许授权的 LLM 客户端（如集成在 Cursor 等编辑器中的 AI）以结构化的方式提交从 PRD 解析出的任务数据，并对这些任务数据进行查询和管理，从而间接驱动前端看板的展示与交互。

### 1.1. LLM 与前端交互的核心原则

LLM 通过调用本 MCP 服务定义的工具来间接影响前端看板。具体来说：

1.  **数据生成与操作**: LLM 通过工具（如 `submit_task_dataset`, `update_task`, `delete_task`）来创建或修改任务数据。LLM 负责理解 PRD 并将其转换为符合本服务定义的数据结构（见 4.1 任务对象 JSON Schema）。
2.  **MCP 服务处理与通知**: MCP 服务在接收到这些操作后，会验证数据、更新后端数据库，并通过 WebSocket 将数据变更事件实时推送给前端看板。
3.  **前端响应与展示**: 前端看板应用监听这些事件，并相应地更新其界面展示。例如，一个新任务会显示为一个新卡片，任务状态的改变会将卡片移动到看板的不同列。

LLM 不直接控制前端的 UI 元素或渲染逻辑，而是通过改变共享的任务数据状态来驱动前端更新。因此，LLM 需要通过工具的定义（特别是其描述和参数/返回值）来理解其操作对数据产生的影响，以及这些数据变更通常如何在前端看板上体现。本服务定义的 `get_task_schema` 工具（或在工具注册时提供的Schema信息）对于 LLM 正确构造数据至关重要。

## 2. 核心职责

*   **接收和处理结构化任务数据**：从 LLM 客户端接收预定义格式的任务数据集（LLM 负责将 PRD 解析并转换为此数据集）。
*   **任务数据持久化**：将任务数据存储在后端数据库中。
*   **提供 MCP 工具接口**：定义和暴露一组 MCP 工具，供 LLM 进行任务的创建、查询、更新和删除。
*   **状态同步与前端通信**：通过 WebSocket 将任务数据的变更实时推送给前端看板应用，确保数据一致性。
*   **定义数据交互规范**：明确 LLM 与前端之间任务数据的结构和交互规则。

## 3. 架构定位

```mermaid
graph LR
    LLM_Client[外部 LLM 客户端 (如 Cursor 内的 AI)] -- JSON-RPC --> MCP_Service{本地 MCP 服务};
    MCP_Service -- WebSocket --> Frontend_App[前端看板应用];
    MCP_Service -- CRUD --> Task_DB[(任务数据库)];
    subgraph AI 能力 (可选，用于未来增强)
        MCP_Service -.-> AI_Microservice[AI 微服务 (例如: 任务增强)];
    end
```

*   **LLM 客户端**：主要的交互方，通过 MCP 工具与服务通信。
*   **前端看板应用**：通过 WebSocket 从 MCP 服务接收任务数据更新，并展示给用户。用户在前端的操作（如拖拽卡片、编辑）也会通过 MCP 服务（可能调用相应的 MCP 工具）更新后端数据。
*   **任务数据库**：负责存储所有任务卡片的信息。
*   **AI 微服务 (可选)**：在当前 PRD 解析流程中，核心解析由外部 LLM 完成。但未来若 MCP 服务提供更复杂的任务增强工具（如 `augment_task`），则可能需要调用此内部微服务。

## 4. 数据模型 (Data Model)

MCP 服务与 LLM 及前端交互的核心是任务数据。一个任务卡片对应一个任务对象。

### 4.1. 任务对象 (Task Object) JSON Schema (示例)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Task",
  "description": "Schema for a single task item",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier for the task (e.g., UUID)",
      "readOnly": true
    },
    "title": {
      "type": "string",
      "description": "The main title or name of the task"
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the task (can be Markdown)"
    },
    "status": {
      "type": "string",
      "description": "Current status of the task (e.g., 'To Do', 'In Progress', 'Done') - 通常对应看板的列名"
    },
    "priority": {
      "type": "string",
      "enum": ["High", "Medium", "Low", null],
      "description": "Priority of the task"
    },
    "dueDate": {
      "type": ["string", "null"],
      "format": "date-time",
      "description": "Optional due date for the task"
    },
    "assignee": {
      "type": ["string", "null"],
      "description": "Identifier of the person assigned to the task (e.g., user ID or name)"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of tags associated with the task"
    },
    "parentId": {
      "type": ["string", "null"],
      "description": "ID of the parent task, if this is a sub-task"
    },
    "subTasks": {
      "type": "array",
      "items": {
        "$ref": "#"
      },
      "description": "List of sub-tasks (recursive definition, handled by client/server logic)",
      "readOnly": true
    },
    "acceptanceCriteria": {
      "type": "string",
      "description": "Acceptance criteria for completing the task"
    },
    "estimatedEffort": {
      "type": ["number", "null"],
      "description": "Estimated effort in hours or points"
    },
    "loggedTime": {
      "type": ["number", "null"],
      "description": "Actual time logged for the task"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of when the task was created",
      "readOnly": true
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of when the task was last updated",
      "readOnly": true
    }
  },
  "required": [
    "id",
    "title",
    "status",
    "createdAt",
    "updatedAt"
  ]
}
```

### 4.2. 任务数据集 (Task Dataset)

当 LLM 解析 PRD 后，它会生成一个包含多个任务对象的数组，作为提交给 MCP 服务的数据集：

`List[Task]` (即 `Task[]`)

## 5. MCP 工具定义 (MCP Tool Definitions)

以下是 MCP 服务向 LLM 客户端暴露的核心工具。这些工具遵循 JSON-RPC 规范。

### 5.1. `submit_task_dataset`

*   **描述**: LLM 调用此工具，将在其端解析 PRD 后生成的结构化任务数据集一次性提交给 MCP 服务。服务将处理这些任务（如分配 ID、存入数据库）并通知前端。
*   **参数**:
    *   `tasks`: `List[Partial<Task>]` - 一个任务对象数组。对于新创建的任务，`id`, `createdAt`, `updatedAt` 等字段可以省略，由服务端生成。必需字段为 `title` 和 `status`（或由服务端设定默认值）。
*   **返回**:
    *   `List[Task]` - 包含已创建/处理的任务对象的完整列表（包含服务端生成的 ID 和时间戳）。
*   **行为**:
    1.  接收任务对象列表。
    2.  为每个新任务生成唯一 ID 和时间戳。
    3.  验证任务数据（基于 Schema）。
    4.  将任务存入数据库。
    5.  通过 WebSocket 向前端广播 `tasks_added` 事件，包含新创建的任务数据。
    6.  返回包含完整信息的任务列表给 LLM。

### 5.2. `list_tasks`

*   **描述**: LLM 调用此工具以获取当前看板上的任务列表，可支持过滤。
*   **参数**:
    *   `filter_options` (可选): `Object` - 一个包含过滤条件的键值对对象，例如：
        *   `status: string`
        *   `priority: string`
        *   `assignee: string`
        *   `tags: List[string]`
*   **返回**:
    *   `List[Task]` - 符合过滤条件的任务对象列表。
*   **行为**: 从数据库查询任务并返回。

### 5.3. `get_task_details`

*   **描述**: LLM 调用此工具以获取特定任务的详细信息。
*   **参数**:
    *   `task_id`: `string` - 要查询的任务的 ID。
*   **返回**:
    *   `Task` 或 `null` - 任务对象，如果未找到则返回 null。
*   **行为**: 从数据库查询特定任务并返回。

### 5.4. `update_task`

*   **描述**: LLM 调用此工具以更新现有任务的一个或多个属性。
*   **参数**:
    *   `task_id`: `string` - 要更新的任务的 ID。
    *   `updates`: `Partial<Task>` - 包含要更新的字段及其新值的对象。不允许更新 `id`, `createdAt`。
*   **返回**:
    *   `Task` 或 `null` - 更新后的完整任务对象，如果任务未找到则返回 null。
*   **行为**:
    1.  查找指定 ID 的任务。
    2.  应用更新 (更新 `updatedAt` 时间戳)。
    3.  将更改保存到数据库。
    4.  通过 WebSocket 向前端广播 `task_updated` 事件。
    5.  返回更新后的任务对象。

### 5.5. `delete_task`

*   **描述**: LLM 调用此工具以删除一个任务。
*   **参数**:
    *   `task_id`: `string` - 要删除的任务的 ID。
*   **返回**:
    *   `boolean` - 如果删除成功则为 `true`，否则为 `false`。
*   **行为**:
    1.  从数据库删除指定 ID 的任务。
    2.  通过 WebSocket 向前端广播 `task_deleted` 事件。
    3.  返回操作结果。

### 5.6. `get_task_schema` (关键工具，用于指导 LLM 生成正确数据格式)

*   **描述**: LLM **应**调用此工具（或在工具注册时由MCP客户端获取此信息）来获取服务端期望的任务对象的 JSON Schema。这**对于确保** LLM 生成的数据符合规范、从而能被前端正确解析和展示至关重要。
*   **参数**: 无
*   **返回**: `Object` - 任务对象的 JSON Schema (如第 4.1 节所示)。
*   **行为**: 返回预定义的 JSON Schema。

## 6. 通信协议

*   **协议**: JSON-RPC 2.0。
*   **传输层**: 主要通过 WebSocket (用于双向通信和服务器推送) 和/或 HTTP (用于请求-响应模式)。
    *   WebSocket 端点: 例如 `ws://localhost:PORT/mcp`
    *   HTTP 端点: 例如 `http://localhost:PORT/mcp`

## 7. 实时更新与前端同步

当任务数据发生任何变更（通过 LLM 调用 MCP 工具，或未来可能通过前端直接操作）时，MCP 服务将：

1.  更新数据库中的数据。
2.  通过已建立的 WebSocket 连接，向所有已连接的前端看板客户端广播相应的事件。
    *   **事件示例**：
        *   `tasks_added` (payload: `List[Task]`)
        *   `task_updated` (payload: `Task`)
        *   `task_deleted` (payload: `{ taskId: string }`)
3.  前端应用监听这些事件，并相应地更新其本地状态和 UI 展示。

## 8. 错误处理

*   MCP 工具的响应应遵循 JSON-RPC 错误对象规范。
*   错误应包含明确的 `code` 和 `message`。
*   例如：无效参数、任务未找到、数据库错误、权限错误（如果未来实现）等。

## 9. 安全考虑 (初期)

*   **本地部署**: 初期 MCP 服务主要用于本地部署和开发，可以直接信任本地客户端 (如本地运行的 Cursor 编辑器内的 LLM)。
*   **无复杂认证**: MVP 阶段可不实现复杂的用户认证或 API 密钥机制。
*   **未来扩展**: 如果服务需要暴露到公网，则必须实现严格的认证 (如 OAuth2, API Keys) 和授权机制，以及输入验证和防攻击措施 (如速率限制)。

## 10. 未来可能的增强

*   **更复杂的查询能力**: `list_tasks` 支持更丰富的查询语言或组合过滤条件。
*   **批量操作**: 支持批量更新或删除任务。
*   **任务依赖关系管理**: 专门的工具来定义和修改任务间的依赖。
*   **用户和权限管理**: 如果支持多用户协作。
*   **Webhooks**: 当任务发生变化时，可以通知其他第三方服务。
*   **版本控制/审计日志**: 记录任务的变更历史。

---

## 11. 技术选型

根据项目需求、MCP 服务特性以及当前主流技术趋势，后端 MCP 服务拟采用以下技术栈：

*   **语言/运行时**: Node.js
*   **开发语言**: TypeScript
*   **核心框架**: Fastify (以其高性能、低开销和对 TypeScript 的良好支持为主要优势)
*   **数据库**: PostgreSQL (考虑到未来多用户支持和数据管理的健壮性)（PostgreSQL 数据库：强烈建议使用 Docker 来运行和管理，以简化开发环境的搭建和保证一致性。）
    *   **数据库交互**: 建议使用 ORM (Object-Relational Mapper) 如 Prisma 或 TypeORM 来简化数据库操作、提供类型安全并辅助管理数据库 Schema 的演进。
*   **WebSocket 通信**: Socket.IO (与前端 Socket.IO-client 配套，提供可靠的双向通信和事件广播)
*   **数据校验**: Zod (TypeScript-first schema 声明与验证库，确保数据一致性)
*   **MCP SDK**: `@modelcontextprotocol/sdk` (官方 TypeScript SDK，用于快速搭建 MCP 服务端功能)

---

