import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { taskUpdateSchema } from '../types/taskSchema';
import { columnService, columnSchema, columnUpdateSchema } from './columnService';
import { workspaceService } from './workspaceService';
import { boardService } from './boardService';
import { registerMultiBoardMCPTools } from './mcpMultiBoardTools';
import { randomUUID } from 'crypto';

// 初始化Prisma客户端
const prisma = new PrismaClient();

/**
 * 获取默认看板ID
 * 用于MCP服务的向后兼容性
 */
async function getDefaultBoardId(): Promise<string> {
  // 获取默认工作区
  const defaultWorkspace = await workspaceService.getDefaultWorkspace();
  if (!defaultWorkspace) {
    throw new Error('未找到默认工作区');
  }

  // 获取默认工作区的第一个看板
  const boards = await boardService.getBoardsByWorkspace(defaultWorkspace.id);
  if (boards.length === 0) {
    throw new Error('默认工作区中没有看板');
  }

  return boards[0].id;
}

/**
 * 获取默认用户ID
 * 用于MCP服务创建任务时指定所有者
 */
async function getDefaultUserId(): Promise<string> {
  // 获取系统中的第一个用户作为默认用户
  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' }
  });

  if (!firstUser) {
    throw new Error('系统中没有用户');
  }

  return firstUser.id;
}



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
   * 重要：包含指定看板的列UUID信息，status字段必须使用这些UUID。
   */
  mcpServer.tool("get_task_schema", "获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式。重要：status字段必须使用返回的列UUID，不能使用列名称。",
    {
      boardId: z.string().min(1, '看板ID不能为空')
    },
    async (args: any) => {
      const { boardId } = args;
      // 获取指定看板的列信息
      const columns = await columnService.getColumnsByBoard(boardId);

      // 创建任务Schema
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
            "description": "任务状态 - 必须使用列的UUID，不能使用列名称",
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
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

      const result = {
        schema: schema,
        availableColumns: columns.map(col => ({
          id: col.id,
          name: col.name,
          order: col.order
        })),
        usage: {
          note: "创建任务时，status字段必须使用列的UUID（id字段），不能使用列名称",
          example: {
            title: "示例任务",
            status: columns[0]?.id || "列UUID",
            description: "任务描述",
            priority: "High"
          }
        }
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
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
   * 重要：status字段必须使用列UUID，boardId字段指定任务所属看板。
   */
  mcpServer.tool("submit_task_dataset", "提交从PRD解析出的结构化任务数据集，服务器将处理并存储这些任务。状态字段必须使用列UUID，boardId字段指定任务所属看板。",
    {
      tasks: z.array(z.object({
        title: z.string(),
        status: z.string().uuid("status必须是有效的UUID格式，请使用get_task_schema工具获取列UUID"),
        description: z.string().optional(),
        priority: z.enum(['High', 'Medium', 'Low']).nullable().optional(),
        dueDate: z.string().datetime().nullable().optional(),
        assignee: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        parentId: z.string().nullable().optional(),
        boardId: z.string().uuid("boardId必须是有效的看板UUID").optional(),
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
        console.log('开始创建任务，任务数量:', tasks.length);

        // 验证所有任务都有boardId
        for (const taskData of tasks) {
          if (!taskData.boardId) {
            throw new Error('每个任务都必须指定boardId');
          }
        }

        // 收集所有涉及的看板ID，用于验证列
        const boardIds = new Set<string>();
        for (const task of tasks) {
          boardIds.add(task.boardId!);
        }

        // 获取所有相关看板的列，用于验证
        const allValidColumnIds = new Set<string>();
        for (const boardId of boardIds) {
          const columns = await columnService.getColumnsByBoard(boardId);
          columns.forEach((col: any) => allValidColumnIds.add(col.id));
        }

        // 验证所有任务的状态UUID
        for (const taskData of tasks) {
          if (!allValidColumnIds.has(taskData.status)) {
            throw new Error(`无效的状态UUID: ${taskData.status}。请确保status对应看板 ${taskData.boardId} 中的有效列UUID。`);
          }
        }

        // 使用事务确保数据一致性
        await prisma.$transaction(async (tx) => {
          for (const taskData of tasks) {
            console.log(`创建任务: "${taskData.title}" 状态UUID: ${taskData.status}`);

            // 处理标签 - 将标签名称数组转换为Tag关系
            const tags = taskData.tags ? {
              connectOrCreate: taskData.tags.map((tagName: any) => ({
                where: { name: typeof tagName === 'string' ? tagName : tagName.name },
                create: { name: typeof tagName === 'string' ? tagName : tagName.name }
              }))
            } : undefined;

            // 使用任务指定的看板ID
            const boardId = taskData.boardId!;

            // 准备任务数据
            const taskCreateData: any = {
              title: taskData.title,
              description: taskData.description || '',
              status: taskData.status, // 使用验证过的状态UUID
              priority: taskData.priority || null,
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
              assignee: taskData.assignee || null,
              acceptanceCriteria: taskData.acceptanceCriteria || '',
              estimatedEffort: taskData.estimatedEffort || null,
              loggedTime: taskData.loggedTime || null,
              boardId: boardId, // 使用传递的看板ID或默认看板ID
              tags: tags,
            };

            // 如果有父任务ID，使用关系字段
            if (taskData.parentId) {
              taskCreateData.parent = {
                connect: { id: taskData.parentId }
              };
            }

            // 创建任务记录
            const task = await tx.task.create({
              data: taskCreateData,
              include: {
                tags: true,
              }
            });

            console.log(`任务创建成功: "${task.title}" 状态UUID: ${task.status}`);
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
   * 获取指定看板的任务列表，支持过滤条件。
   * 此工具允许LLM查询指定看板的任务数据，可按状态、优先级、负责人和标签等条件进行过滤。
   */
  mcpServer.tool("list_tasks", "获取指定看板的任务列表，支持过滤条件",
    {
      boardId: z.string().uuid("看板ID必须是有效的UUID"),
      filter_options: z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        assignee: z.string().optional(),
        tags: z.array(z.string()).optional()
      }).optional()
    },
    async (args) => {
      const { boardId, filter_options } = args;
      try {
        // 使用指定的看板ID
        const targetBoardId = boardId;

        // 构建查询条件，首先按看板过滤
        const where: any = {
          boardId: targetBoardId
        };

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
   * 获取指定看板的所有列，按order排序。
   * 此工具允许LLM查询指定看板的列配置。
   */
  mcpServer.tool("get_columns", "获取指定看板的所有列，按order排序",
    {
      boardId: z.string().uuid("看板ID必须是有效的UUID")
    },
    async (args) => {
      try {
        const { boardId } = args;

        // 使用指定的看板ID
        const columns = await columnService.getColumnsByBoard(boardId);

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
      boardId: z.string().uuid("看板ID必须是有效的UUID"),
      column_ids: z.array(z.string()).describe('按新顺序排列的列ID数组')
    },
    async (args) => {
      const { boardId, column_ids } = args;
      try {
        // 使用指定的看板ID
        const reorderedColumns = await columnService.reorderColumns(boardId, column_ids);

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

  /**
   * 工具14: clear_all_tasks
   *
   * 删除所有任务卡片（用于测试和开发）
   * 此工具会删除数据库中的所有任务，并通过WebSocket广播清空事件通知前端。
   * 注意：此操作不可逆，请谨慎使用。
   */
  mcpServer.tool("clear_all_tasks", "删除所有任务卡片，用于测试和开发。注意：此操作不可逆，请谨慎使用。", {},
    async (_args) => {
      try {
        console.log('开始清空所有任务...');

        // 获取所有任务ID用于广播
        const allTasks = await prisma.task.findMany({
          select: { id: true, title: true }
        });

        const taskCount = allTasks.length;
        console.log(`找到 ${taskCount} 个任务需要删除`);

        if (taskCount === 0) {
          const result = {
            success: true,
            message: '没有任务需要删除',
            deletedCount: 0,
            deletedTaskIds: []
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }

        // 使用事务删除所有任务
        await prisma.$transaction(async (tx) => {
          // 删除所有任务（由于外键约束，相关的标签关系会自动处理）
          await tx.task.deleteMany({});
          console.log(`已删除 ${taskCount} 个任务`);
        });

        // 广播所有任务删除事件
        const deletedTaskIds = allTasks.map(task => task.id);
        io.emit('tasks_cleared', { deletedTaskIds, deletedCount: taskCount });
        console.log(`已广播任务清空事件，删除了 ${taskCount} 个任务`);

        const result = {
          success: true,
          message: `成功删除了 ${taskCount} 个任务`,
          deletedCount: taskCount,
          deletedTaskIds: deletedTaskIds,
          deletedTasks: allTasks.map(task => ({ id: task.id, title: task.title }))
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
        console.error('清空所有任务失败:', error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : '清空所有任务失败'
              })
            }
          ],
          isError: true
        };
      }
    }
  );

  // 注册多看板扩展工具
  registerMultiBoardMCPTools(mcpServer);

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
          'initialize', 'notifications/initialized', 'tools/list', 'tools/call',
          'get_task_schema', 'submit_task_dataset', 'list_tasks', 'get_task_details', 'update_task', 'delete_task',
          'get_columns', 'create_column', 'update_column', 'delete_column', 'reorder_columns', 'migrate_task_status',
          'update_task_color', 'clear_all_tasks'
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
        case 'initialize': {
          try {
            // MCP协议初始化握手
            const { protocolVersion, capabilities, clientInfo } = body.params || {};

            console.log('MCP初始化请求:', {
              protocolVersion,
              capabilities,
              clientInfo
            });

            // 返回服务器能力和信息
            reply.send({
              jsonrpc: '2.0',
              result: {
                protocolVersion: '2024-11-05',
                capabilities: {
                  tools: {},
                  resources: {},
                  prompts: {},
                  logging: {}
                },
                serverInfo: {
                  name: 'xitools-mcp-server',
                  version: '1.0.0'
                }
              },
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('MCP初始化失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '初始化失败: ' + (error instanceof Error ? error.message : '未知错误'),
              },
              id: body.id,
            });
            return;
          }
        }

        case 'notifications/initialized': {
          try {
            // MCP协议通知：客户端已完成初始化
            console.log('MCP客户端初始化完成通知');

            // 对于通知类型的请求，通常不需要响应
            // 但为了兼容性，我们返回一个简单的确认
            reply.send({
              jsonrpc: '2.0',
              result: {},
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('处理初始化通知失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '处理通知失败: ' + (error instanceof Error ? error.message : '未知错误'),
              },
              id: body.id,
            });
            return;
          }
        }

        case 'tools/list': {
          try {
            // 返回所有可用的MCP工具列表
            const tools = [
              {
                name: 'get_task_schema',
                description: '获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式。重要：status字段必须使用返回的列UUID，不能使用列名称。',
                inputSchema: {
                  type: 'object',
                  properties: {},
                  required: []
                }
              },
              {
                name: 'submit_task_dataset',
                description: '批量提交任务数据集，服务器将处理并存储这些任务',
                inputSchema: {
                  type: 'object',
                  properties: {
                    tasks: {
                      type: 'array',
                      description: '任务数组',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string', description: '任务标题' },
                          status: { type: 'string', description: '任务状态（列UUID）' },
                          description: { type: 'string', description: '任务描述' },
                          priority: { type: 'string', enum: ['High', 'Medium', 'Low'], description: '优先级' }
                        },
                        required: ['title', 'status']
                      }
                    }
                  },
                  required: ['tasks']
                }
              },
              {
                name: 'list_tasks',
                description: '获取任务列表，支持过滤条件',
                inputSchema: {
                  type: 'object',
                  properties: {
                    filter_options: {
                      type: 'object',
                      description: '过滤选项',
                      properties: {
                        status: { type: 'string', description: '按状态过滤' },
                        priority: { type: 'string', description: '按优先级过滤' },
                        assignee: { type: 'string', description: '按负责人过滤' }
                      }
                    }
                  }
                }
              },
              {
                name: 'get_task_details',
                description: '获取特定任务的详细信息',
                inputSchema: {
                  type: 'object',
                  properties: {
                    task_id: { type: 'string', description: '任务ID' }
                  },
                  required: ['task_id']
                }
              },
              {
                name: 'update_task',
                description: '更新现有任务的一个或多个属性',
                inputSchema: {
                  type: 'object',
                  properties: {
                    task_id: { type: 'string', description: '任务ID' },
                    updates: { type: 'object', description: '更新内容' }
                  },
                  required: ['task_id', 'updates']
                }
              },
              {
                name: 'delete_task',
                description: '删除指定的任务',
                inputSchema: {
                  type: 'object',
                  properties: {
                    task_id: { type: 'string', description: '任务ID' }
                  },
                  required: ['task_id']
                }
              },
              {
                name: 'get_columns',
                description: '获取所有看板列，按order排序',
                inputSchema: {
                  type: 'object',
                  properties: {},
                  required: []
                }
              },
              {
                name: 'create_column',
                description: '创建新的看板列',
                inputSchema: {
                  type: 'object',
                  properties: {
                    column_data: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: '列名称' },
                        order: { type: 'number', description: '排序顺序' },
                        color: { type: 'string', description: '列背景色' },
                        isDefault: { type: 'boolean', description: '是否为默认列' }
                      },
                      required: ['name', 'order', 'isDefault']
                    }
                  },
                  required: ['column_data']
                }
              },
              {
                name: 'update_column',
                description: '更新现有看板列的属性',
                inputSchema: {
                  type: 'object',
                  properties: {
                    column_id: { type: 'string', description: '要更新的列ID' },
                    updates: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: '新名称' },
                        order: { type: 'number', description: '新排序' },
                        color: { type: 'string', description: '新颜色' },
                        isDefault: { type: 'boolean', description: '是否默认' }
                      }
                    }
                  },
                  required: ['column_id', 'updates']
                }
              },
              {
                name: 'delete_column',
                description: '删除指定的看板列',
                inputSchema: {
                  type: 'object',
                  properties: {
                    column_id: { type: 'string', description: '要删除的列ID' }
                  },
                  required: ['column_id']
                }
              },
              {
                name: 'reorder_columns',
                description: '重新排序看板列',
                inputSchema: {
                  type: 'object',
                  properties: {
                    column_ids: {
                      type: 'array',
                      items: { type: 'string' },
                      description: '按新顺序排列的列ID数组'
                    }
                  },
                  required: ['column_ids']
                }
              },
              {
                name: 'clear_all_tasks',
                description: '删除所有任务卡片，用于测试和开发。注意：此操作不可逆',
                inputSchema: {
                  type: 'object',
                  properties: {},
                  required: []
                }
              }
            ];

            reply.send({
              jsonrpc: '2.0',
              result: {
                tools: tools
              },
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('获取工具列表失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '获取工具列表失败: ' + (error instanceof Error ? error.message : '未知错误'),
              },
              id: body.id,
            });
            return;
          }
        }

        case 'tools/call': {
          try {
            // 工具调用请求 - 将参数转发给对应的工具方法
            const { name, arguments: toolArgs } = body.params || {};

            if (!name) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: 缺少工具名称',
                },
                id: body.id,
              });
              return;
            }

            console.log(`工具调用: ${name}，参数:`, toolArgs);

            // 直接调用对应的工具方法
            switch (name) {
              case 'get_task_schema': {
                // 获取当前可用的列信息
                const defaultBoardId = await getDefaultBoardId();
                const columns = await columnService.getColumnsByBoard(defaultBoardId);

                // 创建任务Schema
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
                      "description": "任务状态 - 必须使用列的UUID，不能使用列名称",
                      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
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

                const result = {
                  schema: schema,
                  availableColumns: columns.map((col: any) => ({
                    id: col.id,
                    name: col.name,
                    order: col.order
                  })),
                  usage: {
                    note: "创建任务时，status字段必须使用列的UUID（id字段），不能使用列名称",
                    example: {
                      title: "示例任务",
                      status: columns[0]?.id || "列UUID",
                      description: "任务描述",
                      priority: "High"
                    }
                  }
                };

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'get_columns': {
                const defaultBoardId = await getDefaultBoardId();
                const columns = await columnService.getColumnsByBoard(defaultBoardId);
                console.log(`获取到 ${columns.length} 个列`);

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(columns, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'list_tasks': {
                const filterOptions = toolArgs?.filter_options || {};

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

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(tasks, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'submit_task_dataset': {
                const { tasks } = toolArgs || {};

                if (!tasks || !Array.isArray(tasks)) {
                  reply.status(400).send({
                    jsonrpc: '2.0',
                    error: {
                      code: -32602,
                      message: '无效的参数: tasks必须是数组',
                    },
                    id: body.id,
                  });
                  return;
                }

                console.log(`准备创建 ${tasks.length} 个任务`);

                // 收集所有任务的看板ID，用于验证列
                const boardIds = new Set<string>();
                const defaultBoardId = await getDefaultBoardId();

                for (const task of tasks) {
                  if (task.boardId) {
                    boardIds.add(task.boardId);
                  } else {
                    boardIds.add(defaultBoardId);
                  }
                }

                // 获取所有相关看板的列，用于验证
                const allValidColumnIds = new Set<string>();
                for (const boardId of boardIds) {
                  const columns = await columnService.getColumnsByBoard(boardId);
                  columns.forEach((col: any) => allValidColumnIds.add(col.id));
                }

                // 验证所有任务的状态UUID
                for (const taskData of tasks) {
                  if (!taskData.title) {
                    reply.status(400).send({
                      jsonrpc: '2.0',
                      error: {
                        code: -32602,
                        message: '无效的参数: 每个任务必须有title',
                      },
                      id: body.id,
                    });
                    return;
                  }

                  if (!taskData.status) {
                    reply.status(400).send({
                      jsonrpc: '2.0',
                      error: {
                        code: -32602,
                        message: '无效的参数: 每个任务必须有status（列UUID）',
                      },
                      id: body.id,
                    });
                    return;
                  }

                  // 验证UUID是否对应实际存在的列
                  if (!allValidColumnIds.has(taskData.status)) {
                    reply.status(400).send({
                      jsonrpc: '2.0',
                      error: {
                        code: -32602,
                        message: `无效的状态UUID: ${taskData.status}。请使用get_task_schema工具获取有效的列UUID。`,
                      },
                      id: body.id,
                    });
                    return;
                  }
                }

                const createdTasks: any[] = [];

                // 使用事务确保数据一致性
                await prisma.$transaction(async (tx: any) => {
                  for (const taskData of tasks) {
                    console.log(`创建任务: "${taskData.title}" 状态UUID: ${taskData.status}`);

                    // 处理标签
                    const tagNames = taskData.tags || [];
                    const tagConnections = [];

                    for (const tagName of tagNames) {
                      // 查找或创建标签
                      let tag = await tx.tag.findFirst({
                        where: { name: tagName }
                      });

                      if (!tag) {
                        tag = await tx.tag.create({
                          data: { name: tagName }
                        });
                        console.log(`创建新标签: ${tagName}`);
                      }

                      tagConnections.push({ id: tag.id });
                    }

                    // 确定使用的看板ID
                    const boardId = taskData.boardId || defaultBoardId;

                    // 准备任务数据
                    const taskCreateData: any = {
                      title: taskData.title,
                      description: taskData.description || '',
                      status: taskData.status,
                      priority: taskData.priority || null,
                      assignee: taskData.assignee || null,
                      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                      acceptanceCriteria: taskData.acceptanceCriteria || '',
                      estimatedEffort: taskData.estimatedEffort || null,
                      loggedTime: taskData.loggedTime || null,
                      boardId: boardId, // 使用传递的看板ID或默认看板ID
                      tags: {
                        connect: tagConnections
                      }
                    };

                    // 如果有父任务ID，使用关系字段
                    if (taskData.parentId) {
                      taskCreateData.parent = {
                        connect: { id: taskData.parentId }
                      };
                    }

                    // 创建任务
                    const task = await tx.task.create({
                      data: taskCreateData,
                      include: {
                        tags: true
                      }
                    });

                    createdTasks.push(task);
                    console.log(`任务创建成功: ${task.id}`);
                  }
                });

                console.log(`成功创建 ${createdTasks.length} 个任务`);

                // 广播任务创建事件
                io.emit('tasks_created', createdTasks);

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(createdTasks, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'get_task_details': {
                const { task_id } = toolArgs || {};

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

                const task = await prisma.task.findUnique({
                  where: { id: task_id },
                  include: {
                    tags: true,
                  }
                });

                if (!task) {
                  reply.status(404).send({
                    jsonrpc: '2.0',
                    error: {
                      code: -32602,
                      message: `任务不存在: ${task_id}`,
                    },
                    id: body.id,
                  });
                  return;
                }

                console.log(`获取任务详情: ${task.id}`);

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(task, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'update_task': {
                const { task_id, updates } = toolArgs || {};

                if (!task_id || !updates) {
                  reply.status(400).send({
                    jsonrpc: '2.0',
                    error: {
                      code: -32602,
                      message: '无效的参数: 缺少task_id或updates',
                    },
                    id: body.id,
                  });
                  return;
                }

                // 验证任务是否存在
                const existingTask = await prisma.task.findUnique({
                  where: { id: task_id }
                });

                if (!existingTask) {
                  reply.status(404).send({
                    jsonrpc: '2.0',
                    error: {
                      code: -32602,
                      message: `任务不存在: ${task_id}`,
                    },
                    id: body.id,
                  });
                  return;
                }

                // 如果更新状态，验证状态UUID
                if (updates.status) {
                  const defaultBoardId = await getDefaultBoardId();
                  const columns = await columnService.getColumnsByBoard(defaultBoardId);
                  const validColumnIds = new Set(columns.map((col: any) => col.id));

                  if (!validColumnIds.has(updates.status)) {
                    reply.status(400).send({
                      jsonrpc: '2.0',
                      error: {
                        code: -32602,
                        message: `无效的状态UUID: ${updates.status}`,
                      },
                      id: body.id,
                    });
                    return;
                  }
                }

                // 处理标签更新
                const updateData: any = { ...updates };
                if (updates.tags) {
                  const tagConnections = [];
                  for (const tagName of updates.tags) {
                    let tag = await prisma.tag.findFirst({
                      where: { name: tagName }
                    });

                    if (!tag) {
                      tag = await prisma.tag.create({
                        data: { name: tagName }
                      });
                    }

                    tagConnections.push({ id: tag.id });
                  }

                  updateData.tags = {
                    set: tagConnections
                  };
                }

                // 处理日期字段
                if (updates.dueDate) {
                  updateData.dueDate = new Date(updates.dueDate);
                }

                const updatedTask = await prisma.task.update({
                  where: { id: task_id },
                  data: updateData,
                  include: {
                    tags: true
                  }
                });

                console.log(`任务 ${task_id} 更新成功`);

                // 广播任务更新事件
                io.emit('task_updated', updatedTask);

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(updatedTask, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'delete_task': {
                const { task_id } = toolArgs || {};

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

                // 验证任务是否存在
                const task = await prisma.task.findUnique({
                  where: { id: task_id }
                });

                if (!task) {
                  reply.status(404).send({
                    jsonrpc: '2.0',
                    error: {
                      code: -32602,
                      message: `任务不存在: ${task_id}`,
                    },
                    id: body.id,
                  });
                  return;
                }

                await prisma.task.delete({
                  where: { id: task_id }
                });

                console.log(`任务 ${task_id} 删除成功`);

                // 广播任务删除事件
                io.emit('task_deleted', { taskId: task_id });

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify({ success: true, taskId: task_id }, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'create_column': {
                const { column_data } = toolArgs || {};

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
                console.log(`列 ${newColumn.id} 创建成功`);

                // 广播列创建事件
                io.emit('column_created', newColumn);

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(newColumn, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'update_column': {
                const { column_id, updates } = toolArgs || {};

                if (!column_id || !updates) {
                  reply.status(400).send({
                    jsonrpc: '2.0',
                    error: {
                      code: -32602,
                      message: '无效的参数: 缺少column_id或updates',
                    },
                    id: body.id,
                  });
                  return;
                }

                const updatedColumn = await columnService.updateColumn(column_id, updates);
                console.log(`列 ${column_id} 更新成功`);

                // 广播列更新事件
                io.emit('column_updated', updatedColumn);

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(updatedColumn, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'delete_column': {
                const { column_id } = toolArgs || {};

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
                console.log(`列 ${column_id} 删除成功`);

                // 广播列删除事件
                io.emit('column_deleted', { columnId: column_id });

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'reorder_columns': {
                const { column_ids } = toolArgs || {};

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

                // 获取默认看板ID以保持兼容性
                const defaultBoardId = await getDefaultBoardId();
                const reorderedColumns = await columnService.reorderColumns(defaultBoardId, column_ids);
                console.log('列重新排序成功');

                // 广播列重排序事件
                io.emit('columns_reordered', reorderedColumns);

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(reorderedColumns, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              case 'clear_all_tasks': {
                // 删除所有任务
                const deletedTasks = await prisma.task.deleteMany({});

                const result = {
                  success: true,
                  deletedCount: deletedTasks.count,
                  message: `成功删除 ${deletedTasks.count} 个任务`
                };

                console.log(`所有任务已清除，删除了 ${deletedTasks.count} 个任务`);

                // 广播任务清除事件
                io.emit('all_tasks_cleared', result);

                reply.send({
                  jsonrpc: '2.0',
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                      }
                    ]
                  },
                  id: body.id,
                });
                return;
              }

              default: {
                reply.status(400).send({
                  jsonrpc: '2.0',
                  error: {
                    code: -32601,
                    message: `工具 ${name} 未实现`,
                  },
                  id: body.id,
                });
                return;
              }
            }

          } catch (error) {
            console.error('工具调用失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '工具调用失败: ' + (error instanceof Error ? error.message : '未知错误'),
              },
              id: body.id,
            });
            return;
          }
        }

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

            // 验证所有任务都有boardId
            for (const task of tasks) {
              if (!task.boardId) {
                throw new Error('每个任务都必须指定boardId');
              }
            }

            // 收集所有任务的看板ID，用于验证列
            const boardIds = new Set<string>();
            for (const task of tasks) {
              boardIds.add(task.boardId);
            }

            // 获取所有相关看板的列，用于验证
            const allValidColumnIds = new Set<string>();
            for (const boardId of boardIds) {
              const columns = await columnService.getColumnsByBoard(boardId);
              columns.forEach((col: any) => allValidColumnIds.add(col.id));
            }

            // 验证所有任务的状态UUID
            for (const taskData of tasks) {
              if (!taskData.title || !taskData.status) {
                throw new Error('任务必须包含标题和状态');
              }

              // 验证UUID格式
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              if (!uuidRegex.test(taskData.status)) {
                throw new Error(`无效的状态格式: ${taskData.status}。status必须是有效的UUID格式，请使用get_task_schema工具获取列UUID。`);
              }

              // 验证UUID是否对应实际存在的列
              if (!allValidColumnIds.has(taskData.status)) {
                throw new Error(`无效的状态UUID: ${taskData.status}。请使用get_task_schema工具获取有效的列UUID。`);
              }
            }

            // 创建任务
            const createdTasks: any[] = [];

            // 获取默认用户ID用于创建任务
            const defaultUserId = await getDefaultUserId();

            // 使用事务确保数据一致性
            await prisma.$transaction(async (tx) => {
              for (const taskData of tasks) {
                console.log(`创建任务: "${taskData.title}" 状态UUID: ${taskData.status}`);

                // 处理标签 - 将标签名称数组转换为Tag关系
                const tags = taskData.tags ? {
                  connectOrCreate: taskData.tags.map((tagName: any) => ({
                    where: {
                      ownerId_name: {
                        ownerId: defaultUserId,
                        name: typeof tagName === 'string' ? tagName : tagName.name
                      }
                    },
                    create: {
                      name: typeof tagName === 'string' ? tagName : tagName.name,
                      ownerId: defaultUserId
                    }
                  }))
                } : undefined;

                // 确定使用的看板ID
                const boardId = taskData.boardId;

                // 创建任务记录
                const task = await tx.task.create({
                  data: {
                    title: taskData.title,
                    description: taskData.description || '',
                    status: taskData.status, // 使用验证过的状态UUID
                    priority: taskData.priority || null,
                    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                    assignee: taskData.assignee || null,
                    parentId: taskData.parentId || null,
                    acceptanceCriteria: taskData.acceptanceCriteria || '',
                    estimatedEffort: taskData.estimatedEffort || null,
                    loggedTime: taskData.loggedTime || null,
                    boardId: boardId, // 使用传递的看板ID
                    ownerId: defaultUserId, // 添加所有者ID
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
            
            // 返回MCP标准格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(createdTasks, null, 2)
                  }
                ]
              },
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
            
            // 返回MCP标准格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(tasks, null, 2)
                  }
                ]
              },
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
            
            // 返回MCP标准格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(task, null, 2)
                  }
                ]
              },
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

            // 返回MCP标准格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(updatedTask, null, 2)
                  }
                ]
              },
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

            // 返回MCP标准格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({ success: true, taskId: task_id }, null, 2)
                  }
                ]
              },
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
            // 返回通用的任务Schema（不包含具体的列信息）
            // 如果需要具体的列信息，应该使用MCP工具并提供boardId参数

            // 创建任务Schema
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
                  "description": "任务状态 - 必须使用列的UUID，不能使用列名称",
                  "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
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

            const result = {
              schema: schema,
              note: "这是通用的任务Schema。要获取具体看板的列信息，请使用MCP工具并提供boardId参数。",
              usage: {
                note: "创建任务时，status字段必须使用列的UUID（id字段），不能使用列名称",
                example: {
                  title: "示例任务",
                  status: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                  description: "任务描述",
                  priority: "High",
                  boardId: "看板UUID"
                }
              }
            };

            // 返回MCP标准格式的响应
            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              },
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

        case 'clear_all_tasks': {
          try {
            console.log('开始清空所有任务...');

            // 获取所有任务ID用于广播
            const allTasks = await prisma.task.findMany({
              select: { id: true, title: true }
            });

            const taskCount = allTasks.length;
            console.log(`找到 ${taskCount} 个任务需要删除`);

            if (taskCount === 0) {
              const result = {
                success: true,
                message: '没有任务需要删除',
                deletedCount: 0,
                deletedTaskIds: []
              };

              reply.send({
                jsonrpc: '2.0',
                result: result,
                id: body.id,
              });
              return;
            }

            // 使用事务删除所有任务
            await prisma.$transaction(async (tx) => {
              // 删除所有任务（由于外键约束，相关的标签关系会自动处理）
              await tx.task.deleteMany({});
              console.log(`已删除 ${taskCount} 个任务`);
            });

            // 广播所有任务删除事件
            const deletedTaskIds = allTasks.map(task => task.id);
            io.emit('tasks_cleared', { deletedTaskIds, deletedCount: taskCount });
            console.log(`已广播任务清空事件，删除了 ${taskCount} 个任务`);

            const result = {
              success: true,
              message: `成功删除了 ${taskCount} 个任务`,
              deletedCount: taskCount,
              deletedTaskIds: deletedTaskIds,
              deletedTasks: allTasks.map(task => ({ id: task.id, title: task.title }))
            };

            console.log(result.message);

            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              },
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('清空所有任务失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '清空所有任务失败: ' + (error as Error).message,
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
            console.log(`列 ${newColumn.id} 创建成功`);

            // 广播列创建事件
            io.emit('column_created', newColumn);

            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(newColumn, null, 2)
                  }
                ]
              },
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('创建列失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '创建列失败: ' + (error instanceof Error ? error.message : '未知错误'),
              },
              id: body.id,
            });
            return;
          }
        }

        case 'update_column': {
          try {
            const { column_id, updates } = body.params || {};

            if (!column_id || !updates) {
              reply.status(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: '无效的参数: 缺少column_id或updates',
                },
                id: body.id,
              });
              return;
            }

            const updatedColumn = await columnService.updateColumn(column_id, updates);
            console.log(`列 ${column_id} 更新成功`);

            // 广播列更新事件
            io.emit('column_updated', updatedColumn);

            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(updatedColumn, null, 2)
                  }
                ]
              },
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('更新列失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '更新列失败: ' + (error instanceof Error ? error.message : '未知错误'),
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
            console.log(`列 ${column_id} 删除成功`);

            // 广播列删除事件
            io.emit('column_deleted', { columnId: column_id });

            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              },
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('删除列失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '删除列失败: ' + (error instanceof Error ? error.message : '未知错误'),
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

            // 获取默认看板ID以保持兼容性
            const defaultBoardId = await getDefaultBoardId();
            const reorderedColumns = await columnService.reorderColumns(defaultBoardId, column_ids);
            console.log('列重新排序成功');

            // 广播列重排序事件
            io.emit('columns_reordered', reorderedColumns);

            reply.send({
              jsonrpc: '2.0',
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(reorderedColumns, null, 2)
                  }
                ]
              },
              id: body.id,
            });
            return;
          } catch (error) {
            console.error('重新排序列失败:', error);
            reply.status(500).send({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: '重新排序列失败: ' + (error instanceof Error ? error.message : '未知错误'),
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

  // 初始化默认数据
  try {
    const defaultUserId = await getDefaultUserId();
    await workspaceService.initializeDefaultData(defaultUserId);
    console.log('默认数据初始化完成');
  } catch (error) {
    console.error('初始化默认数据失败:', error);
  }

  console.log('MCP 服务配置完成，已准备就绪');
}