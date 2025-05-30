import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { PrismaClient } from '../generated/prisma';
import { z } from 'zod';
import { taskSchema, taskUpdateSchema } from '../types/taskSchema';
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
export function setupMCPService(server: FastifyInstance, io: SocketIOServer): void {
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
      tasks: z.array(taskSchema.partial().required({ title: true, status: true }))
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
          orderBy: { createdAt: 'desc' }
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
        const { tags, ...otherUpdates } = updates;
        
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

    // 配置fastify处理此请求时不要应用406限制
    reply['sent'] = false;
    
    try {
      // 检查请求是否有请求体并且是JSON-RPC格式
      if (request.body && typeof request.body === 'object' && 
          'jsonrpc' in request.body && 'method' in request.body) {
          
        const body = request.body as any;
        
        // 如果是list_tasks方法，使用我们的自定义处理
        if (body.method === 'list_tasks') {
          console.log('使用自定义处理函数处理list_tasks请求');
          return await handleMcpRequest(request, reply);
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
        return reply.status(400).send({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: '无效的请求',
          },
          id: body?.id || null,
        });
      }
      
      // 根据方法名分派到对应的工具处理函数
      switch (body.method) {
        case 'list_tasks':
          const filterOptions = body.params?.filter_options || {};
          
          try {
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
              orderBy: { createdAt: 'desc' }
            });
            
            console.log(`MCP方法返回 ${tasks.length} 个任务`);
            
            // 返回JSON-RPC格式的响应
            return reply.send({
              jsonrpc: '2.0',
              result: tasks,
              id: body.id,
            });
          } catch (error) {
            console.error('查询任务列表失败:', error);
            return reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '查询任务列表失败',
              },
              id: body.id,
            });
          }
          
        // 其他方法处理...
        default:
          // 如果方法未实现，仍然使用MCP传输层处理
          return reply.status(400).send({
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `方法 ${body.method} 未实现`,
            },
            id: body.id,
          });
      }
    } catch (error) {
      console.error('处理请求时出错:', error);
      return reply.status(500).send({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: '内部服务器错误',
        },
        id: null,
      });
    }
  };

  console.log('MCP 服务配置完成，已准备就绪');
} 