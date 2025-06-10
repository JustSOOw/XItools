# XItools MCP工具规范文档

## 概述

本文档定义了XItools项目中MCP（Model Context Protocol）工具的完整规范，包括工具列表、数据类型、接口定义和使用示例。

## 数据类型定义

### 基础类型

#### Task（任务对象）
```typescript
interface Task {
  // 必填字段
  id: string;                    // UUID格式的任务唯一标识
  title: string;                 // 任务标题
  status: string;                // 任务状态（对应BoardColumn的id）
  createdAt: string;             // 创建时间（ISO 8601格式）
  updatedAt: string;             // 更新时间（ISO 8601格式）
  
  // 可选字段
  description?: string;          // 任务描述（支持Markdown）
  priority?: 'High' | 'Medium' | 'Low' | null;  // 优先级
  dueDate?: string | null;       // 截止日期（ISO 8601格式）
  assignee?: string | null;      // 负责人
  color?: string | null;         // 任务卡片颜色（CSS颜色值或渐变）
  tags?: TagObject[];            // 标签数组（对象格式）
  parentId?: string | null;      // 父任务ID
  acceptanceCriteria?: string;   // 验收标准
  estimatedEffort?: number | null;  // 预估工作量（小时）
  loggedTime?: number | null;    // 已记录时间（小时）
  sortOrder?: number;            // 列内排序值
}
```

#### TagObject（标签对象）
```typescript
interface TagObject {
  id: string;                    // 标签唯一标识
  name: string;                  // 标签名称
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

#### BoardColumn（看板列）
```typescript
interface BoardColumn {
  id: string;                    // 列唯一标识
  name: string;                  // 列名称（如"待办"、"进行中"、"已完成"）
  order: number;                 // 排序顺序
  color?: string;                // 列背景色
  isDefault: boolean;            // 是否为默认列
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

#### FilterOptions（过滤选项）
```typescript
interface FilterOptions {
  status?: string;               // 按状态过滤（列ID）
  priority?: string;             // 按优先级过滤
  assignee?: string;             // 按负责人过滤
  tags?: string[];               // 按标签名称过滤
}
```

### 输入类型

#### TaskInput（创建任务输入）
```typescript
interface TaskInput {
  title: string;                 // 必填：任务标题
  status: string;                // 必填：任务状态（列ID）
  description?: string;          // 可选：任务描述
  priority?: 'High' | 'Medium' | 'Low';  // 可选：优先级
  dueDate?: string;              // 可选：截止日期
  assignee?: string;             // 可选：负责人
  tags?: string[];               // 可选：标签名称数组
  parentId?: string;             // 可选：父任务ID
  acceptanceCriteria?: string;   // 可选：验收标准
  estimatedEffort?: number;      // 可选：预估工作量
  loggedTime?: number;           // 可选：已记录时间
}
```

#### TaskUpdate（更新任务输入）
```typescript
interface TaskUpdate {
  title?: string;
  description?: string;
  status?: string;               // 列ID
  priority?: 'High' | 'Medium' | 'Low' | null;
  dueDate?: string | null;
  assignee?: string | null;
  color?: string | null;
  tags?: string[];               // 标签名称数组
  parentId?: string | null;
  acceptanceCriteria?: string;
  estimatedEffort?: number | null;
  loggedTime?: number | null;
}
```

## 🔧 编辑器配置

### MCP服务器配置示例

在您的编辑器（如Cursor）中添加以下配置：

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

**注意**: 请将路径替换为您的实际项目路径。

## MCP工具列表

### 1. get_task_schema

**功能**: 获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式

**输入参数**: 无

**返回类型**: 
```typescript
{
  content: [{
    type: "text",
    text: string  // JSON Schema字符串
  }]
}
```

**使用示例**:
```
请调用get_task_schema工具获取任务数据结构
```

### 2. submit_task_dataset

**功能**: 批量提交任务数据集，服务器将处理并存储这些任务

**输入参数**:
```typescript
{
  tasks: TaskInput[]  // 任务输入数组
}
```

**返回类型**:
```typescript
{
  content: [{
    type: "text", 
    text: string  // 创建的任务对象数组（JSON字符串）
  }]
}
```

**使用示例**:
```
请使用submit_task_dataset工具创建以下任务：
- 标题："实现用户登录功能"
- 状态："41c632df-4c6e-470b-b1a5-bef81432a6b0"（待办列ID）
- 优先级："High"
- 标签：["前端", "认证"]
```

### 3. list_tasks

**功能**: 获取任务列表，支持过滤条件

**输入参数**:
```typescript
{
  filter_options?: FilterOptions  // 可选的过滤条件
}
```

**返回类型**:
```typescript
{
  content: [{
    type: "text",
    text: string  // 任务对象数组（JSON字符串）
  }]
}
```

**使用示例**:
```
请调用list_tasks工具查看所有状态为"待办"的任务
```

### 4. get_task_details

**功能**: 获取特定任务的详细信息

**输入参数**:
```typescript
{
  task_id: string  // 任务ID
}
```

**返回类型**:
```typescript
{
  content: [{
    type: "text",
    text: string  // 任务对象（JSON字符串）
  }]
}
```

**使用示例**:
```
请调用get_task_details工具查看任务ID为"fbc684e4-f105-4c58-836e-0471bd2d9846"的详细信息
```

### 5. update_task

**功能**: 更新现有任务的一个或多个属性

**输入参数**:
```typescript
{
  task_id: string,     // 任务ID
  updates: TaskUpdate  // 更新内容
}
```

**返回类型**:
```typescript
{
  content: [{
    type: "text",
    text: string  // 更新后的任务对象（JSON字符串）
  }]
}
```

**使用示例**:
```
请使用update_task工具将任务ID为"xxx"的状态更新为"129c5c2d-dd0c-4fe1-8304-f43190bac9e4"（进行中列ID）
```

### 6. delete_task

**功能**: 删除指定的任务

**输入参数**:
```typescript
{
  task_id: string  // 任务ID
}
```

**返回类型**:
```typescript
{
  content: [{
    type: "text",
    text: string  // 删除结果（JSON字符串）
  }]
}
```

**使用示例**:
```
请使用delete_task工具删除任务ID为"xxx"的任务
```

## 重要注意事项

### 状态字段规范

**⚠️ 关键点**: 任务的`status`字段必须使用**列ID**（UUID格式），而不是列名称字符串。

**正确的状态值示例**:
- 待办列: `"41c632df-4c6e-470b-b1a5-bef81432a6b0"`
- 进行中列: `"129c5c2d-dd0c-4fe1-8304-f43190bac9e4"`
- 已完成列: `"[具体的列ID]"`

**错误的状态值**:
- ❌ `"To Do"`
- ❌ `"In Progress"`  
- ❌ `"Done"`

### 标签处理规范

**输入时**: 使用字符串数组
```typescript
tags: ["前端", "认证", "高优先级"]
```

**输出时**: 返回标签对象数组
```typescript
tags: [
  {
    id: "584f39e7-e05e-470b-918a-d9978190c577",
    name: "前端",
    createdAt: "2025-06-10T08:34:18.387Z",
    updatedAt: "2025-06-10T08:34:18.387Z"
  }
]
```

### 前端兼容性

前端组件已经支持两种标签格式的兼容处理：
```typescript
// 兼容处理标签显示
const tagName = typeof tag === 'string' ? tag : tag.name;
```

## 获取列ID的方法

如果需要获取当前系统中的列ID，可以通过以下方式：

1. **直接API查询**:
   ```
   GET http://localhost:3000/api/columns
   ```

2. **通过现有任务查看**:
   ```
   调用list_tasks工具查看现有任务的status字段
   ```

## 错误处理

所有MCP工具在出错时会返回错误信息：
```typescript
{
  content: [{
    type: "text",
    text: string  // 错误信息（JSON字符串）
  }],
  isError?: true
}
```

## 版本信息

- **文档版本**: 1.0.0
- **创建日期**: 2025-06-10
- **最后更新**: 2025-06-10
- **适用于**: XItools v1.0.0

## 常用列ID参考

基于当前系统配置，常用的列ID如下：

```typescript
// 系统默认列ID（仅供参考，实际使用时请通过API获取最新值）
const COLUMN_IDS = {
  TODO: "41c632df-4c6e-470b-b1a5-bef81432a6b0",      // 待办
  IN_PROGRESS: "129c5c2d-dd0c-4fe1-8304-f43190bac9e4", // 进行中
  DONE: "[需要查询具体ID]"                              // 已完成
};
```

## 最佳实践

### 1. 创建任务时的建议

```typescript
// 推荐的任务创建格式
{
  title: "具体明确的任务标题",
  description: "详细的任务描述，支持Markdown格式",
  status: "41c632df-4c6e-470b-b1a5-bef81432a6b0", // 使用列ID
  priority: "High", // 明确优先级
  tags: ["功能模块", "技术栈", "优先级标识"], // 有意义的标签
  acceptanceCriteria: "明确的验收标准",
  estimatedEffort: 8 // 预估工作量（小时）
}
```

### 2. 批量操作建议

- 单次提交任务数量建议不超过50个
- 大批量操作时建议分批处理
- 每个任务都应该有明确的标题和状态

### 3. 错误处理建议

- 创建任务前先验证列ID是否存在
- 处理标签时注意前后端格式差异
- 更新任务时只传递需要更新的字段

## 故障排除

### 常见问题

1. **任务创建成功但前端不显示**
   - 检查status字段是否使用了正确的列ID
   - 确认WebSocket连接是否正常

2. **标签显示异常**
   - 前端已兼容两种标签格式
   - 如有问题，检查TaskCard组件的标签渲染逻辑

3. **优先级显示问题**
   - 确保使用标准优先级值：'High'、'Medium'、'Low'
   - null值会显示为"普通"

### 调试工具

```bash
# 查看当前所有列
curl -X GET http://localhost:3000/api/columns

# 查看所有任务
curl -X POST http://localhost:3000/api/tasks/list \
  -H "Content-Type: application/json" \
  -d '{"filter_options":{}}'
```

---

**注意**: 本文档应与代码实现保持同步，任何接口变更都应及时更新此文档。
