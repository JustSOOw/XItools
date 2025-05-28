import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { MCPServer } from '@modelcontextprotocol/sdk';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { taskSchema, taskUpdateSchema } from '../types/taskSchema';

// 初始化Prisma客户端
const prisma = new PrismaClient();

// 定义MCP服务及工具
export function setupMCPService(server: FastifyInstance, io: SocketIOServer): void {
  // 初始化MCP服务器
  const mcpServer = new MCPServer({
    server: server.server,
    path: '/mcp'
  });

  // 当WebSocket客户端连接时
  io.on('connection', (socket) => {
    console.log('前端连接成功, socket id:', socket.id);

    socket.on('disconnect', () => {
      console.log('前端断开连接, socket id:', socket.id);
    });
  });

  // 注册MCP工具
  
  // 工具1: 获取任务Schema
  mcpServer.registerTool('get_task_schema', {
    description: '获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式',
    parameters: z.object({}),
    handler: async () => {
      // 返回预定义的任务Schema
      return taskSchema.describe();
    }
  });

  // 工具2: 提交任务数据集
  mcpServer.registerTool('submit_task_dataset', {
    description: '提交从PRD解析出的结构化任务数据集，服务器将处理并存储这些任务',
    parameters: z.object({
      tasks: z.array(taskSchema.partial().required({ title: true, status: true }))
    }),
    handler: async ({ tasks }) => {
      // 处理任务数据集
      const createdTasks = [];

      for (const taskData of tasks) {
        // 创建任务记录
        const task = await prisma.task.create({
          data: {
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status,
            priority: taskData.priority || null,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
            assignee: taskData.assignee || null,
            tags: taskData.tags || [],
            parentId: taskData.parentId || null,
            acceptanceCriteria: taskData.acceptanceCriteria || '',
            estimatedEffort: taskData.estimatedEffort || null,
            loggedTime: taskData.loggedTime || null,
          }
        });

        createdTasks.push(task);
      }

      // 通过WebSocket广播任务添加事件
      io.emit('tasks_added', createdTasks);

      // 返回创建的任务
      return createdTasks;
    }
  });

  // 工具3: 获取任务列表
  mcpServer.registerTool('list_tasks', {
    description: '获取当前任务列表，支持过滤条件',
    parameters: z.object({
      filter_options: z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        assignee: z.string().optional(),
        tags: z.array(z.string()).optional()
      }).optional()
    }),
    handler: async ({ filter_options }) => {
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
            hasEvery: filter_options.tags
          };
        }
      }

      // 查询数据库
      const tasks = await prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      return tasks;
    }
  });

  // 工具4: 获取任务详情
  mcpServer.registerTool('get_task_details', {
    description: '获取特定任务的详细信息',
    parameters: z.object({
      task_id: z.string().describe('要查询的任务ID')
    }),
    handler: async ({ task_id }) => {
      const task = await prisma.task.findUnique({
        where: { id: task_id },
        include: {
          subTasks: true // 包含子任务
        }
      });

      return task;
    }
  });

  // 工具5: 更新任务
  mcpServer.registerTool('update_task', {
    description: '更新现有任务的一个或多个属性',
    parameters: z.object({
      task_id: z.string().describe('要更新的任务ID'),
      updates: taskUpdateSchema
    }),
    handler: async ({ task_id, updates }) => {
      // 更新任务
      const updatedTask = await prisma.task.update({
        where: { id: task_id },
        data: {
          ...updates,
          updatedAt: new Date() // 更新时间戳
        }
      });

      // 广播任务更新事件
      io.emit('task_updated', updatedTask);

      return updatedTask;
    }
  });

  // 工具6: 删除任务
  mcpServer.registerTool('delete_task', {
    description: '删除指定的任务',
    parameters: z.object({
      task_id: z.string().describe('要删除的任务ID')
    }),
    handler: async ({ task_id }) => {
      try {
        // 删除任务
        await prisma.task.delete({
          where: { id: task_id }
        });

        // 广播任务删除事件
        io.emit('task_deleted', { taskId: task_id });

        return true;
      } catch (error) {
        console.error('删除任务失败:', error);
        return false;
      }
    }
  });

  // 启动MCP服务器
  mcpServer.start().then(() => {
    console.log('MCP 服务已启动');
  }).catch(error => {
    console.error('MCP 服务启动失败:', error);
  });
} 