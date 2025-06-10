import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { PrismaClient } from '../generated/prisma';
import { z } from 'zod';
import { taskSchema, taskUpdateSchema } from '../types/taskSchema';
import { columnService, columnSchema, columnUpdateSchema } from './columnService';
import { randomUUID } from 'crypto';

// 初始化Prisma客户端
const prisma = new PrismaClient();

/**
 * 设置MCP服务及其工具
 * 
 * MCP服务是本应用程序的核心，它提供了一组标准化的工具接口，使外部LLM（如Cursor中的AI）
 * 能够与任务看板进行交互，包括查询任务数据、提交任务数据集和更新任务状态等。
 * 
 * @param server Fastify实例，用于注册HTTP路由
 * @param io Socket.IO服务器实例，用于实时通信
 */
export async function setupMCPService(server: FastifyInstance, io: SocketIOServer): Promise<void> {
  console.log('开始配置MCP服务...');

  // 初始化MCP服务器和HTTP传输层
  const mcpServer = new McpServer({ 
    name: "xitools-mcp-server",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });
  
  // 创建存储活跃传输实例的映射
  const transports: Record<string, StreamableHTTPServerTransport> = {};
  
  // 使用sessionIdGenerator确保会话ID的生成
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      if (sessionId) {
        console.log(`MCP会话初始化，会话ID：${sessionId}`);
        transports[sessionId] = transport;
      }
    }
  });

  // 注册MCP工具 - 必须在连接到传输层之前完成
  
  /**
   * 工具1: get_task_schema
   * 
   * 获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式。
   * 这个工具对于确保LLM生成的任务数据符合应用程序的预期格式至关重要。
   */
  mcpServer.tool("get_task_schema", "获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式", {}, 
    async (_args: any) => {
      // 创建预定义的任务Schema
      const schema = {
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
          "title",
          "status"
        ]
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(schema)
          }
        ]
      };
    }
  );

  /**
   * 工具2: submit_task_dataset
   * 
   * 提交从PRD解析出的结构化任务数据集，服务器将处理并存储这些任务。
   * 此工具接收LLM解析PRD后生成的任务列表，验证数据格式，将任务存入数据库，
   * 并通过Socket.IO广播tasks_added事件，通知前端有新任务添加。
   */
  mcpServer.tool("submit_task_dataset", "提交从PRD解析出的结构化任务数据集，服务器将处理并存储这些任务",
    {
      tasks: z.array(z.object({
        title: z.string(),
        status: z.string(),
        description: z.string().optional(),
        priority: z.enum(['High', 'Medium', 'Low']).nullable().optional(),
        dueDate: z.string().datetime().nullable().optional(),
        assignee: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        parentId: z.string().nullable().optional(),
        acceptanceCriteria: z.string().optional(),
        estimatedEffort: z.number().nullable().optional(),
        loggedTime: z.number().nullable().optional()
      }))
    },
    async (args) => {
      const { tasks } = args;
      // 处理任务数据集
      const createdTasks: any[] = [];
      
      try {
        // 使用事务确保数据一致性
        await prisma.$transaction(async (tx) => {
          for (const taskData of tasks) {
            // 处理标签 - 将标签名称数组转换为Tag关系
            const tags = taskData.tags ? { 
              connectOrCreate: taskData.tags.map((tagName: any) => ({
                where: { name: typeof tagName === 'string' ? tagName : tagName.name },
                create: { name: typeof tagName === 'string' ? tagName : tagName.name }
              }))
            } : undefined;
            
            // 创建任务记录
            const task = await tx.task.create({
              data: {
                title: taskData.title,
                description: taskData.description || '',
                status: taskData.status,
                priority: taskData.priority || null,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                assignee: taskData.assignee || null,
                parentId: taskData.parentId || null,
                acceptanceCriteria: taskData.acceptanceCriteria || '',
                estimatedEffort: taskData.estimatedEffort || null,
                loggedTime: taskData.loggedTime || null,
                tags: tags,
              },
              include: {
                tags: true,
              }
            });
            
            createdTasks.push(task);
          }
        });
        
        // 通过WebSocket广播任务添加事件
        io.emit('tasks_added', createdTasks);
        console.log(`已创建 ${createdTasks.length} 个任务并广播通知`);
        
        // 返回创建的任务
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(createdTasks)
            }
          ]
        };
      } catch (error) {
        console.error('创建任务失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: false, error: '创建任务失败' })
            }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * 工具3: list_tasks
   * 
   * 获取当前任务列表，支持过滤条件。
   * 此工具允许LLM查询任务数据，可按状态、优先级、负责人和标签等条件进行过滤。
   */
  mcpServer.tool("list_tasks", "获取当前任务列表，支持过滤条件",
    {
      filter_options: z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        assignee: z.string().optional(),
        tags: z.array(z.string()).optional()
      }).optional()
    },
    async (args) => {
      const { filter_options } = args;
      try {
        // 构建查询条件
        const where: any = {};

        if (filter_options) {
          if (filter_options.status) {
            where.status = filter_options.status;
          }
          if (filter_options.priority) {
            where.priority = filter_options.priority;
          }
          if (filter_options.assignee) {
            where.assignee = filter_options.assignee;
          }
          if (filter_options.tags && filter_options.tags.length > 0) {
            where.tags = {
              some: {
                name: {
                  in: filter_options.tags
                }
              }
            };
          }
        }

        // 查询数据库
        const tasks = await prisma.task.findMany({
          where,
          include: {
            tags: true,
          },
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' }
          ]
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tasks)
            }
          ]
        };
      } catch (error) {
        console.error('查询任务列表失败:', error);
        throw new Error('查询任务列表失败');
      }
    }
  );

  /**
   * 工具4: get_task_details
   * 
   * 获取特定任务的详细信息。
   * 此工具允许LLM查询单个任务的详细信息，包括其子任务和标签。
   */
  mcpServer.tool("get_task_details", "获取特定任务的详细信息",
    {
      task_id: z.string().describe('要查询的任务ID')
    },
    async (args) => {
      const { task_id } = args;
      try {
        const task = await prisma.task.findUnique({
          where: { id: task_id },
          include: {
            subTasks: {
              include: {
                tags: true
              }
            },
            tags: true
          }
        });

        if (!task) {
          throw new Error(`未找到ID为 ${task_id} 的任务`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(task)
            }
          ]
        };
      } catch (error) {
        console.error('获取任务详情失败:', error);
        throw new Error('获取任务详情失败');
      }
    }
  );

  /**
   * 工具5: update_task
   * 
   * 更新现有任务的一个或多个属性。
   * 此工具允许LLM更新任务的属性，如标题、描述、状态等，并通过Socket.IO广播task_updated事件，
   * 通知前端任务已更新。
   */
  mcpServer.tool("update_task", "更新现有任务的一个或多个属性",
    {
      task_id: z.string().describe('要更新的任务ID'),
      updates: taskUpdateSchema
    },
    async (args) => {
      const { task_id, updates } = args;
      try {
        // 处理标签更新
        const { tags, ...otherUpdates } = updates as any;
        
        let tagsUpdate = undefined;
        if (tags && Array.isArray(tags)) {
          tagsUpdate = {
            connectOrCreate: tags.map((tagName: any) => ({
              where: { name: typeof tagName === 'string' ? tagName : tagName.name },
              create: { name: typeof tagName === 'string' ? tagName : tagName.name }
            }))
          };
        }
        
        // 更新任务
        const updatedTask = await prisma.task.update({
          where: { id: task_id as string },
          data: {
            ...otherUpdates,
            updatedAt: new Date(),
            tags: tagsUpdate
          },
          include: {
            tags: true,
          }
        });

        // 广播任务更新事件
        io.emit('task_updated', updatedTask);
        console.log(`任务 ${task_id} 已更新并广播通知`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedTask)
            }
          ]
        };
      } catch (error) {
        console.error('更新任务失败:', error);
        throw new Error('更新任务失败');
      }
    }
  );

  /**
   * 工具6: delete_task
   * 
   * 删除指定的任务。
   * 此工具允许LLM删除任务，并通过Socket.IO广播task_deleted事件，通知前端任务已删除。
   */
  mcpServer.tool("delete_task", "删除指定的任务",
    {
      task_id: z.string().describe('要删除的任务ID')
    },
    async (args) => {
      const { task_id } = args;
      try {
        // 删除任务
        await prisma.task.delete({
          where: { id: task_id }
        });

        // 广播任务删除事件
        io.emit('task_deleted', { taskId: task_id });
        console.log(`任务 ${task_id} 已删除并广播通知`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, taskId: task_id })
            }
          ]
        };
      } catch (error) {
        console.error('删除任务失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: false, error: String(error) })
            }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * 工具7: get_columns
   *
   * 获取所有看板列，按order排序。
   * 此工具允许LLM查询当前的看板列配置。
   */
  mcpServer.tool("get_columns", "获取所有看板列，按order排序", {},
    async (_args) => {
      try {
        const columns = await columnService.getAllColumns();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(columns)
            }
          ]
        };
      } catch (error) {
        console.error('获取列列表失败:', error);
        throw new Error('获取列列表失败');
      }
    }
  );

  /**
   * 工具8: create_column
   *
   * 创建新的看板列。
   * 此工具允许LLM创建新的看板列，并通过Socket.IO广播column_created事件。
   */
  mcpServer.tool("create_column", "创建新的看板列",
    {
      column_data: columnSchema.omit({ id: true })
    },
    async (args) => {
      const { column_data } = args;
      try {
        const newColumn = await columnService.createColumn(column_data);

        // 广播列创建事件
        io.emit('column_created', newColumn);
        console.log(`列 ${newColumn.id} 已创建并广播通知`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(newColumn)
            }
          ]
        };
      } catch (error) {
        console.error('创建列失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: false, error: error instanceof Error ? error.message : '创建列失败' })
            }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * 工具9: update_column
   *
   * 更新现有看板列的属性。
   * 此工具允许LLM更新列的名称、顺序、颜色等属性。
   */
  mcpServer.tool("update_column", "更新现有看板列的属性",
    {
      column_id: z.string().describe('要更新的列ID'),
      updates: columnUpdateSchema
    },
    async (args) => {
      const { column_id, updates } = args;
      try {
        const updatedColumn = await columnService.updateColumn(column_id, updates);

        // 广播列更新事件
        io.emit('column_updated', updatedColumn);
        console.log(`列 ${column_id} 已更新并广播通知`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedColumn)
            }
          ]
        };
      } catch (error) {
        console.error('更新列失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: false, error: error instanceof Error ? error.message : '更新列失败' })
            }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * 工具10: delete_column
   *
   * 删除指定的看板列。
   * 此工具允许LLM删除看板列，但会检查列中是否有任务。
   */
  mcpServer.tool("delete_column", "删除指定的看板列",
    {
      column_id: z.string().describe('要删除的列ID')
    },
    async (args) => {
      const { column_id } = args;
      try {
        const result = await columnService.deleteColumn(column_id);

        // 广播列删除事件
        io.emit('column_deleted', { id: column_id });
        console.log(`列 ${column_id} 已删除并广播通知`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        console.error('删除列失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: false, error: error instanceof Error ? error.message : '删除列失败' })
            }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * 工具11: reorder_columns
   *
   * 重新排序看板列。
   * 此工具允许LLM重新排序看板列的顺序。
   */
  mcpServer.tool("reorder_columns", "重新排序看板列",
    {
      column_ids: z.array(z.string()).describe('按新顺序排列的列ID数组')
    },
    async (args) => {
      const { column_ids } = args;
      try {
        const reorderedColumns = await columnService.reorderColumns(column_ids);

        // 广播列重排序事件
        io.emit('columns_reordered', reorderedColumns);
        console.log(`列已重新排序并广播通知`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(reorderedColumns)
            }
          ]
        };
      } catch (error) {
        console.error('重新排序列失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: false, error: error instanceof Error ? error.message : '重新排序列失败' })
            }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * 工具12: migrate_task_status
   *
   * 数据迁移工具：将任务的status字段从旧的字符串值迁移到新的列UUID
   */
  mcpServer.tool("migrate_task_status", "迁移任务状态数据到新的列系统", {},
    async (_args) => {
      try {
        console.log('开始迁移任务状态数据...');

        // 1. 获取所有列
        const columns = await columnService.getAllColumns();
        console.log('找到列:', columns.map(col => `${col.name} (${col.id})`));

        // 2. 创建状态映射
        const statusMapping: Record<string, string> = {};

        for (const column of columns) {
          switch (column.name) {
            case '待办':
              statusMapping['todo'] = column.id;
              statusMapping['To Do'] = column.id;
              statusMapping['待办'] = column.id;
              break;
            case '进行中':
              statusMapping['in-progress'] = column.id;
              statusMapping['In Progress'] = column.id;
              statusMapping['进行中'] = column.id;
              break;
            case '已完成':
              statusMapping['done'] = column.id;
              statusMapping['Done'] = column.id;
              statusMapping['已完成'] = column.id;
              break;
          }
        }

        console.log('状态映射:', statusMapping);

        // 3. 获取所有需要迁移的任务
        const tasks = await prisma.task.findMany();
        console.log(`找到 ${tasks.length} 个任务需要检查`);

        let migratedCount = 0;

        // 4. 更新任务状态
        for (const task of tasks) {
          const newStatus = statusMapping[task.status];

          if (newStatus && newStatus !== task.status) {
            await prisma.task.update({
              where: { id: task.id },
              data: { status: newStatus }
            });

            console.log(`任务 "${task.title}" 状态从 "${task.status}" 更新为 "${newStatus}"`);
            migratedCount++;
          } else if (!newStatus) {
            console.warn(`任务 "${task.title}" 的状态 "${task.status}" 没有找到对应的列`);
          }
        }

        const result = {
          success: true,
          message: `迁移完成！共更新了 ${migratedCount} 个任务的状态`,
          migratedCount,
          totalTasks: tasks.length,
          statusMapping
        };

        console.log(result.message);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error('迁移失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : '迁移失败'
              })
            }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * 工具13: update_task_color
   *
   * 更新任务颜色
   */
  mcpServer.tool("update_task_color", "更新任务的颜色", {
    task_id: {
      type: "string",
      description: "任务ID"
    },
    color: {
      type: "string",
      description: "颜色值（CSS颜色格式）"
    }
  },
    async (args) => {
      try {
        const { task_id, color } = args;

        if (!task_id) {
          throw new Error('任务ID不能为空');
        }

        const updatedTask = await prisma.task.update({
          where: { id: task_id },
          data: {
            color: color || null,
            updatedAt: new Date()
          },
          include: {
            tags: true,
          }
        });

        // 广播任务更新事件
        io.emit('task_updated', updatedTask);
        console.log(`任务颜色已更新: ${task_id} -> ${color || '清除'} 并广播通知`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedTask, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error('更新任务颜色失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : '更新任务颜色失败'
              })
            }
          ],
          isError: true
        };
      }
    }
  );

  // 在注册完所有工具后连接到传输层
  mcpServer.connect(transport);
  
  // 配置MCP HTTP路由
  server.post('/mcp', async (request, reply) => {
    const sessionId = request.headers['mcp-session-id'] as string | undefined;
    
    // 打印请求详情
    console.log('收到MCP请求:', {
      headers: request.headers,
      body: request.body,
      url: request.url,
      method: request.method
    });
    
    // 设置响应的Content-Type
    reply.header('Content-Type', 'application/json');
    // 设置允许的Accept类型
    reply.header('Accept', 'application/json');
    // 允许任何内容类型
    reply.header('Vary', '*');

    try {
      // 检查请求是否有请求体并且是JSON-RPC格式
      if (request.body && typeof request.body === 'object' && 
          'jsonrpc' in request.body && 'method' in request.body) {
          
        const body = request.body as any;
        
        // 处理所有已定义的MCP工具方法
        const mcpMethods = [
          'get_task_schema', 'submit_task_dataset', 'list_tasks', 'get_task_details', 'update_task', 'delete_task',
          'get_columns', 'create_column', 'update_column', 'delete_column', 'reorder_columns', 'migrate_task_status',
          'update_task_color'
        ];
        if (mcpMethods.includes(body.method)) {
          console.log(`使用自定义处理函数处理${body.method}请求`);
          await handleMcpRequest(request, reply);
          return;
        }
      }
      
      // 非自定义处理的请求使用MCP传输层处理
      if (sessionId && transports[sessionId]) {
        // 使用现有的传输实例处理请求
        console.log(`使用现有会话处理请求: ${sessionId}`);
        await transports[sessionId].handleRequest(request.raw, reply.raw, request.body);
      } else {
        // 处理初始化请求
        console.log('处理新的MCP请求');
        await transport.handleRequest(request.raw, reply.raw, request.body);
      }
    } catch (error) {
      console.error('处理MCP请求时出错:', error);
      if (!reply.sent) {
        reply.status(500).send({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: '内部服务器错误',
          },
          id: null,
        });
      }
    }
  });

  server.get('/mcp', async (request, reply) => {
    const sessionId = request.headers['mcp-session-id'] as string | undefined;
    
    // 设置响应的Content-Type
    reply.header('Content-Type', 'application/json');
    
    try {
      if (sessionId && transports[sessionId]) {
        console.log(`使用现有会话建立SSE流: ${sessionId}`);
        await transports[sessionId].handleRequest(request.raw, reply.raw);
      } else {
        console.log('无效的会话ID，拒绝建立SSE流');
        reply.status(400).send({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: '无效的会话ID',
          },
          id: null,
        });
      }
    } catch (error) {
      console.error('处理SSE请求时出错:', error);
      if (!reply.sent) {
        reply.status(500).send({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: '内部服务器错误',
          },
          id: null,
        });
      }
    }
  });
  
  // 当WebSocket客户端连接时的处理逻辑
  io.on('connection', (socket) => {
    console.log('前端连接成功, socket id:', socket.id);

    // 监听客户端加入看板事件
    socket.on('join_board', (boardId) => {
      console.log(`客户端 ${socket.id} 加入看板: ${boardId}`);
      socket.join(`board:${boardId}`);
    });

    // 监听客户端离开看板事件
    socket.on('leave_board', (boardId) => {
      console.log(`客户端 ${socket.id} 离开看板: ${boardId}`);
      socket.leave(`board:${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log('前端断开连接, socket id:', socket.id);
    });
  });

  // 手动处理JSON-RPC请求的函数
  const handleMcpRequest = async (request: any, reply: any) => {
    try {
      const body = request.body;
      
      if (!body || typeof body !== 'object' || !body.jsonrpc || body.jsonrpc !== '2.0' || !body.method) {
        reply.status(400).send({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: '无效的请求',
          },
          id: body?.id || null,
        });
        return;
      }
      
      // 根据方法名分派到对应的工具处理函数
      switch (body.method) {
        case 'submit_task_dataset': {
          try {
            const { tasks } = body.params || { tasks: [] };
            
            if (!Array.isArray(tasks) || tasks.length === 0) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: tasks不是数组或为空',
                },
                id: body.id,
              });
              return;
            }
            
            // 创建任务
            const createdTasks: any[] = [];
            
            // 使用事务确保数据一致性
            await prisma.$transaction(async (tx) => {
              for (const taskData of tasks) {
                if (!taskData.title || !taskData.status) {
                  throw new Error('任务必须包含标题和状态');
                }
                
                // 处理标签 - 将标签名称数组转换为Tag关系
                const tags = taskData.tags ? { 
                  connectOrCreate: taskData.tags.map((tagName: any) => ({
                    where: { name: typeof tagName === 'string' ? tagName : tagName.name },
                    create: { name: typeof tagName === 'string' ? tagName : tagName.name }
                  }))
                } : undefined;
                
                // 创建任务记录
                const task = await tx.task.create({
                  data: {
                    title: taskData.title,
                    description: taskData.description || '',
                    status: taskData.status,
                    priority: taskData.priority || null,
                    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                    assignee: taskData.assignee || null,
                    parentId: taskData.parentId || null,
                    acceptanceCriteria: taskData.acceptanceCriteria || '',
                    estimatedEffort: taskData.estimatedEffort || null,
                    loggedTime: taskData.loggedTime || null,
                    tags: tags,
                  },
                  include: {
                    tags: true,
                  }
                });
                
                createdTasks.push(task);
              }
            });
            
            // 通过WebSocket广播任务添加事件
            io.emit('tasks_added', createdTasks);
            console.log(`已创建 ${createdTasks.length} 个任务并广播通知`);
            
            // 返回JSON-RPC格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: createdTasks,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('创建任务失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '创建任务失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }
          
        case 'list_tasks': {
          try {
            const filterOptions = body.params?.filter_options || {};
            
            // 构建查询条件
            const where: any = {};

            if (filterOptions) {
              if (filterOptions.status) {
                where.status = filterOptions.status;
              }
              if (filterOptions.priority) {
                where.priority = filterOptions.priority;
              }
              if (filterOptions.assignee) {
                where.assignee = filterOptions.assignee;
              }
              if (filterOptions.tags && filterOptions.tags.length > 0) {
                where.tags = {
                  some: {
                    name: {
                      in: filterOptions.tags
                    }
                  }
                };
              }
            }

            // 查询数据库
            const tasks = await prisma.task.findMany({
              where,
              include: {
                tags: true,
              },
              orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' }
              ]
            });
            
            console.log(`MCP方法返回 ${tasks.length} 个任务`);
            
            // 返回JSON-RPC格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: tasks,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('查询任务列表失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '查询任务列表失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }
          
        case 'get_task_details': {
          try {
            const { task_id } = body.params || {};
            
            if (!task_id) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: 缺少task_id',
                },
                id: body.id,
              });
              return;
            }
            
            // 获取任务详情
            const task = await prisma.task.findUnique({
              where: { id: task_id },
              include: {
                subTasks: {
                  include: {
                    tags: true
                  }
                },
                tags: true
              }
            });

            if (!task) {
              reply.status(404).send({
                jsonrpc: '2.0',
                error: {
                  code: -32000,
                  message: `未找到ID为 ${task_id} 的任务`,
                },
                id: body.id,
              });
              return;
            }
            
            // 返回JSON-RPC格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: task,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('获取任务详情失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '获取任务详情失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }
        
        case 'update_task': {
          try {
            const { task_id, updates } = body.params || {};
            
            if (!task_id) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: 缺少task_id',
                },
                id: body.id,
              });
              return;
            }
            
            // 处理标签更新
            const { tags, ...otherUpdates } = updates || {};
            
            let tagsUpdate = undefined;
            if (tags && Array.isArray(tags)) {
              tagsUpdate = {
                connectOrCreate: tags.map((tagName: any) => ({
                  where: { name: typeof tagName === 'string' ? tagName : tagName.name },
                  create: { name: typeof tagName === 'string' ? tagName : tagName.name }
                }))
              };
            }
            
            // 更新任务
            const updatedTask = await prisma.task.update({
              where: { id: task_id },
              data: {
                ...otherUpdates,
                updatedAt: new Date(),
                tags: tagsUpdate
              },
              include: {
                tags: true,
              }
            });

            // 广播任务更新事件
            io.emit('task_updated', updatedTask);
            console.log(`任务 ${task_id} 已更新并广播通知`);

            // 返回JSON-RPC格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: updatedTask,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('更新任务失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '更新任务失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }
        
        case 'delete_task': {
          try {
            const { task_id } = body.params || {};
            
            if (!task_id) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: 缺少task_id',
                },
                id: body.id,
              });
              return;
            }
            
            // 删除任务
            await prisma.task.delete({
              where: { id: task_id }
            });

            // 广播任务删除事件
            io.emit('task_deleted', { taskId: task_id });
            console.log(`任务 ${task_id} 已删除并广播通知`);

            // 返回JSON-RPC格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: { success: true, taskId: task_id },
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('删除任务失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '删除任务失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }
        
        case 'get_task_schema': {
          try {
            // 创建预定义的任务Schema
            const schema = {
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
                "title",
                "status"
              ]
            };
            
            // 返回JSON-RPC格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: schema,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('获取任务Schema失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '获取任务Schema失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
          }

        case 'get_columns': {
          try {
            const columns = await columnService.getAllColumns();

            reply.send({
              jsonrpc: '2.0',
              result: columns,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('获取列列表失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '获取列列表失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }

        case 'create_column': {
          try {
            const { column_data } = body.params || {};

            if (!column_data) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: 缺少column_data',
                },
                id: body.id,
              });
              return;
            }

            const newColumn = await columnService.createColumn(column_data);

            // 广播列创建事件
            io.emit('column_created', newColumn);
            console.log(`列 ${newColumn.id} 已创建并广播通知`);

            reply.send({
              jsonrpc: '2.0',
              result: newColumn,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('创建列失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '创建列失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }

        case 'update_column': {
          try {
            const { column_id, updates } = body.params || {};

            if (!column_id) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: 缺少column_id',
                },
                id: body.id,
              });
              return;
            }

            const updatedColumn = await columnService.updateColumn(column_id, updates || {});

            // 广播列更新事件
            io.emit('column_updated', updatedColumn);
            console.log(`列 ${column_id} 已更新并广播通知`);

            reply.send({
              jsonrpc: '2.0',
              result: updatedColumn,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('更新列失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '更新列失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }

        case 'delete_column': {
          try {
            const { column_id } = body.params || {};

            if (!column_id) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: 缺少column_id',
                },
                id: body.id,
              });
              return;
            }

            const result = await columnService.deleteColumn(column_id);

            // 广播列删除事件
            io.emit('column_deleted', { id: column_id });
            console.log(`列 ${column_id} 已删除并广播通知`);

            reply.send({
              jsonrpc: '2.0',
              result: result,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('删除列失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '删除列失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }

        case 'reorder_columns': {
          try {
            const { column_ids } = body.params || {};

            if (!column_ids || !Array.isArray(column_ids)) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: column_ids必须是数组',
                },
                id: body.id,
              });
              return;
            }

            const reorderedColumns = await columnService.reorderColumns(column_ids);

            // 广播列重排序事件
            io.emit('columns_reordered', reorderedColumns);
            console.log(`列已重新排序并广播通知`);

            reply.send({
              jsonrpc: '2.0',
              result: reorderedColumns,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('重新排序列失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '重新排序列失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }

        case 'migrate_task_status': {
          try {
            // 获取所有列
            const columns = await columnService.getAllColumns();
            console.log('找到列:', columns.map(col => `${col.name} (${col.id})`));

            // 创建状态映射
            const statusMapping: Record<string, string> = {};

            for (const column of columns) {
              switch (column.name) {
                case '待办':
                  statusMapping['todo'] = column.id;
                  statusMapping['To Do'] = column.id;
                  statusMapping['待办'] = column.id;
                  break;
                case '进行中':
                  statusMapping['in-progress'] = column.id;
                  statusMapping['In Progress'] = column.id;
                  statusMapping['进行中'] = column.id;
                  break;
                case '已完成':
                  statusMapping['done'] = column.id;
                  statusMapping['Done'] = column.id;
                  statusMapping['已完成'] = column.id;
                  break;
              }
            }

            console.log('状态映射:', statusMapping);

            // 获取所有需要迁移的任务
            const tasks = await prisma.task.findMany();
            console.log(`找到 ${tasks.length} 个任务需要检查`);

            let migratedCount = 0;

            // 更新任务状态
            for (const task of tasks) {
              const newStatus = statusMapping[task.status];

              if (newStatus && newStatus !== task.status) {
                await prisma.task.update({
                  where: { id: task.id },
                  data: { status: newStatus }
                });

                console.log(`任务 "${task.title}" 状态从 "${task.status}" 更新为 "${newStatus}"`);
                migratedCount++;
              } else if (!newStatus) {
                console.warn(`任务 "${task.title}" 的状态 "${task.status}" 没有找到对应的列`);
              }
            }

            const result = {
              success: true,
              message: `迁移完成！共更新了 ${migratedCount} 个任务的状态`,
              migratedCount,
              totalTasks: tasks.length,
              statusMapping
            };

            console.log(result.message);

            reply.send({
              jsonrpc: '2.0',
              result: result,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('迁移失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '迁移失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }

        case 'update_task_color': {
          try {
            const { task_id, color } = body.params || {};

            if (!task_id) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: task_id不能为空',
                },
                id: body.id,
              });
              return;
            }

            const updatedTask = await prisma.task.update({
              where: { id: task_id },
              data: {
                color: color || null,
                updatedAt: new Date()
              },
              include: {
                tags: true,
              }
            });

            // 广播任务更新事件
            io.emit('task_updated', updatedTask);
            console.log(`任务颜色已更新: ${task_id} -> ${color || '清除'} 并广播通知`);

            reply.send({
              jsonrpc: '2.0',
              result: updatedTask,
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('更新任务颜色失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '更新任务颜色失败: ' + (error as Error).message,
              },
              id: body.id,
            });
            return;
          }
        }

        // 其他方法处理...
        default: {
          // 如果方法未实现，返回方法未实现的错误
          reply.status(400).send({
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `方法 ${body.method} 未实现`,
            },
            id: body.id,
          });
          return;
        }
      }
    } catch (error) {
      console.error('处理请求时出错:', error);
      reply.status(500).send({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: '内部服务器错误: ' + (error as Error).message,
        },
        id: null,
      });
    }
  };

  // 初始化默认列
  try {
    await columnService.initializeDefaultColumns();
    console.log('默认列初始化完成');
  } catch (error) {
    console.error('初始化默认列失败:', error);
  }

  console.log('MCP 服务配置完成，已准备就绪');
}