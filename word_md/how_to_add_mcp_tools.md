# XItools MCP工具添加指南

## 概述

本文档详细说明了如何在XItools项目中正确添加新的MCP（Model Context Protocol）工具。基于实际开发经验，特别是`clear_all_tasks`工具的成功添加过程。

## 🎯 核心原则

1. **系统性添加**：必须在所有相关文件中添加工具
2. **服务重启**：添加新工具后必须重启后端服务
3. **完整性验证**：确保工具在整个MCP生态系统中正确注册
4. **文档同步**：及时更新相关文档

## 📋 添加步骤清单

### 步骤1：HTTP MCP服务器注册
**文件**：`backend/src/services/mcpService.ts`

#### 1.1 添加工具注册
在现有工具注册之后，`mcpServer.connect(transport)`之前添加：

```typescript
/**
 * 工具N: your_tool_name
 *
 * 工具描述和功能说明
 */
mcpServer.tool("your_tool_name", "工具描述", 
  {
    // 参数schema定义
    param1: z.string().describe('参数描述'),
    param2: z.number().optional()
  },
  async (args) => {
    const { param1, param2 } = args;
    try {
      // 工具实现逻辑
      const result = await yourImplementation(param1, param2);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('工具执行失败:', error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : '执行失败'
            })
          }
        ],
        isError: true
      };
    }
  }
);
```

#### 1.2 添加到方法列表
找到`mcpMethods`数组，添加新工具名称：

```typescript
const mcpMethods = [
  'get_task_schema', 'submit_task_dataset', 'list_tasks', 'get_task_details', 
  'update_task', 'delete_task', 'get_columns', 'create_column', 'update_column', 
  'delete_column', 'reorder_columns', 'migrate_task_status', 'update_task_color', 
  'clear_all_tasks', 'your_tool_name'  // 添加新工具
];
```

#### 1.3 添加Switch处理逻辑
在`handleMcpRequest`函数的switch语句中添加：

```typescript
case 'your_tool_name': {
  try {
    const { param1, param2 } = body.params || {};
    
    // 参数验证
    if (!param1) {
      reply.status(400).send({
        jsonrpc: '2.0',
        error: {
          code: -32602,
          message: '无效的参数: 缺少param1',
        },
        id: body.id,
      });
      return;
    }
    
    // 执行工具逻辑
    const result = await yourImplementation(param1, param2);
    
    // 可选：广播事件
    io.emit('your_event', result);
    
    reply.send({
      jsonrpc: '2.0',
      result: result,
      id: body.id,
    });
    return;
  } catch (error) {
    console.error('工具执行失败:', error);
    reply.status(500).send({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: '工具执行失败: ' + (error as Error).message,
      },
      id: body.id,
    });
    return;
  }
}
```

### 步骤2：Stdio MCP服务器注册
**文件**：`backend/src/mcp-server.ts`

在现有工具注册之后添加：

```typescript
/**
 * 工具N: your_tool_name
 * 
 * 工具描述和功能说明
 */
server.tool("your_tool_name", "工具描述", 
  {
    param1: z.string().describe('参数描述'),
    param2: z.number().optional()
  },
  async (args) => {
    const { param1, param2 } = args;
    try {
      console.error('开始执行工具...');
      
      const result = await yourImplementation(param1, param2);
      
      console.error('工具执行成功');
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('工具执行失败:', error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : '执行失败'
            })
          }
        ],
        isError: true
      };
    }
  }
);
```

### 步骤3：MCP客户端包装器
**文件**：`backend/mcp-client-wrapper.cjs`

在工具列表数组中添加：

```javascript
{
  name: 'your_tool_name',
  description: '工具描述',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { 
        type: 'string',
        description: '参数描述'
      },
      param2: { 
        type: 'number',
        description: '可选参数描述'
      }
    },
    required: ['param1']
  }
}
```

### 步骤4：前端集成（可选）

#### 4.1 Socket事件监听
**文件**：`frontend/src/services/socketService.ts`

如果工具需要广播事件，添加监听：

```typescript
// 工具相关事件
this.socket.on('your_event', (data: any) => {
  console.log('收到工具事件:', data);
  // 处理事件逻辑
});
```

#### 4.2 前端MCP服务方法
**文件**：`frontend/src/services/mcpService.ts`

添加对应的前端调用方法：

```typescript
/**
 * 调用自定义工具
 * 对应MCP工具: your_tool_name
 */
async callYourTool(param1: string, param2?: number): Promise<any> {
  try {
    const response = await axios.post(this.baseUrl, {
      jsonrpc: '2.0',
      method: 'your_tool_name',
      params: {
        param1,
        param2
      },
      id: this.generateRequestId(),
    }, {
      timeout: this.requestTimeout,
      headers: this.headers
    });

    console.log('工具调用成功:', response.data.result);
    return response.data.result;
  } catch (error) {
    console.error('工具调用失败:', error);
    throw error;
  }
}
```

### 步骤5：文档更新

#### 5.1 MCP工具规范文档
**文件**：`word_md/mcp_tools_specification.md`

添加工具说明：

```markdown
### N. your_tool_name

**功能**: 工具功能描述

**输入参数**:
```typescript
{
  param1: string,    // 参数描述
  param2?: number    // 可选参数描述
}
```

**返回类型**:
```typescript
{
  content: [{
    type: "text",
    text: string  // 结果数据（JSON字符串）
  }]
}
```

**使用示例**:
```
请使用your_tool_name工具执行某个操作
```
```

#### 5.2 README文档
**文件**：`README.md`

在可用工具列表中添加：

```markdown
- `your_tool_name` - 工具简短描述
```

## ⚠️ 重要注意事项

### 1. 服务重启必须性
- MCP工具在服务器启动时一次性注册
- 添加新工具后**必须重启后端服务**
- 运行时无法动态添加新工具

### 2. 注册顺序
```typescript
// 正确的顺序
mcpServer.tool("tool1", ...);
mcpServer.tool("tool2", ...);
mcpServer.tool("your_new_tool", ...);  // 新工具

// 最后连接传输层
mcpServer.connect(transport);
```

### 3. 错误处理
- 始终包含try-catch错误处理
- 返回标准化的错误格式
- 使用适当的日志记录

### 4. 参数验证
- 使用Zod进行参数schema验证
- 在HTTP处理中添加额外的参数检查
- 提供清晰的错误消息

## 🔍 验证步骤

1. **代码检查**：确保所有文件都已正确修改
2. **服务重启**：重启后端服务
3. **工具发现**：验证工具出现在工具列表中
4. **功能测试**：测试工具的实际功能
5. **错误处理**：测试错误情况的处理

## 📚 常见问题

### Q: 工具添加后无法发现？
A: 确保重启了后端服务，并检查所有必要文件是否都已修改。

### Q: 工具调用失败？
A: 检查参数schema定义、错误处理逻辑和数据库连接。

### Q: 前端无法调用？
A: 确保在前端MCP服务中添加了对应的方法。

## 🎯 最佳实践

1. **命名规范**：使用清晰、一致的工具命名
2. **文档先行**：先设计工具接口，再实现功能
3. **测试驱动**：编写测试用例验证工具功能
4. **渐进式添加**：先实现核心功能，再添加高级特性

## 🔧 实际示例：clear_all_tasks工具

以下是`clear_all_tasks`工具的完整实现示例：

### HTTP MCP服务器实现
```typescript
mcpServer.tool("clear_all_tasks", "删除所有任务卡片，用于测试和开发。注意：此操作不可逆，请谨慎使用。", {},
  async (_args) => {
    try {
      console.log('开始清空所有任务...');

      // 获取所有任务ID用于广播
      const allTasks = await prisma.task.findMany({
        select: { id: true, title: true }
      });

      const taskCount = allTasks.length;

      if (taskCount === 0) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: '没有任务需要删除',
              deletedCount: 0,
              deletedTaskIds: []
            }, null, 2)
          }]
        };
      }

      // 使用事务删除所有任务
      await prisma.$transaction(async (tx) => {
        await tx.task.deleteMany({});
      });

      // 广播清空事件
      const deletedTaskIds = allTasks.map(task => task.id);
      io.emit('tasks_cleared', { deletedTaskIds, deletedCount: taskCount });

      const result = {
        success: true,
        message: `成功删除了 ${taskCount} 个任务`,
        deletedCount: taskCount,
        deletedTaskIds: deletedTaskIds,
        deletedTasks: allTasks.map(task => ({ id: task.id, title: task.title }))
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      console.error('清空所有任务失败:', error);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : '清空所有任务失败'
          })
        }],
        isError: true
      };
    }
  }
);
```

## 🚨 故障排除

### 问题1：工具无法发现
**症状**：调用工具时提示"Tool does not exist"

**解决方案**：
1. 检查是否在所有必要文件中添加了工具
2. 确认已重启后端服务
3. 验证工具名称在所有地方保持一致
4. 检查MCP客户端包装器中的工具定义

### 问题2：工具调用返回错误
**症状**：工具被发现但调用失败

**解决方案**：
1. 检查参数schema定义是否正确
2. 验证数据库连接和权限
3. 查看服务器日志获取详细错误信息
4. 确认错误处理逻辑完整

### 问题3：前端无法接收事件
**症状**：工具执行成功但前端没有更新

**解决方案**：
1. 检查Socket.IO事件名称是否一致
2. 确认前端已添加对应的事件监听
3. 验证WebSocket连接状态
4. 检查事件数据格式

## 📊 开发流程建议

### 阶段1：设计阶段
1. 明确工具功能和用途
2. 设计输入参数和返回格式
3. 考虑错误处理场景
4. 规划前端集成需求

### 阶段2：实现阶段
1. 按照步骤清单逐一实现
2. 先实现核心功能，后添加辅助特性
3. 及时测试每个实现步骤
4. 保持代码风格一致

### 阶段3：测试阶段
1. 单元测试工具核心逻辑
2. 集成测试MCP调用流程
3. 前端功能测试
4. 错误场景测试

### 阶段4：文档阶段
1. 更新MCP工具规范文档
2. 更新README和使用指南
3. 添加代码注释
4. 记录已知问题和限制

## 🎯 成功指标

- ✅ 工具在MCP工具列表中可见
- ✅ 工具调用返回预期结果
- ✅ 错误处理正常工作
- ✅ 前端集成（如需要）正常
- ✅ 文档更新完整
- ✅ 代码通过审查

---

**注意**：本指南基于XItools项目的实际开发经验，特别是`clear_all_tasks`工具的成功添加过程。遵循这些步骤可以确保新工具的正确添加和集成。

**版本**：v1.0.0
**创建日期**：2025-06-16
**最后更新**：2025-06-16
