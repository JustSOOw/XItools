#!/usr/bin/env node

/**
 * XItools MCP 服务器 - 标准stdio版本
 * 
 * 这个文件提供了一个标准的MCP服务器实现，使用stdio传输层，
 * 可以被编辑器（如Cursor）直接调用。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { PrismaClient } from './generated/prisma/index.js';
import { z } from 'zod';
import { taskUpdateSchema } from './types/taskSchema.js';
import { columnService } from './services/columnService.js';
import { loadConfig } from './config/config.js';

// 初始化Prisma客户端
const prisma = new PrismaClient();

// 加载配置
const config = loadConfig();

/**
 * 创建并配置MCP服务器
 */
async function createMCPServer(): Promise<McpServer> {
  console.error('初始化XItools MCP服务器...');

  const server = new McpServer({
    name: "xitools-mcp-server",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // 注册所有MCP工具
  await registerMCPTools(server);

  return server;
}

/**
 * 注册所有MCP工具
 */
async function registerMCPTools(server: McpServer): Promise<void> {
  console.error('注册MCP工具...');

  /**
   * 工具1: get_task_schema
   */
  server.tool("get_task_schema", "获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式", {}, 
    async (_args: any) => {
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
            text: JSON.stringify(schema, null, 2)
          }
        ]
      };
    }
  );

  /**
   * 工具2: submit_task_dataset
   */
  server.tool("submit_task_dataset", "提交从PRD解析出的结构化任务数据集，服务器将处理并存储这些任务",
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
      const createdTasks: any[] = [];
      
      try {
        await prisma.$transaction(async (tx) => {
          for (const taskData of tasks) {
            const tags = taskData.tags ? { 
              connectOrCreate: taskData.tags.map((tagName: any) => ({
                where: { name: typeof tagName === 'string' ? tagName : tagName.name },
                create: { name: typeof tagName === 'string' ? tagName : tagName.name }
              }))
            } : undefined;
            
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
        
        console.error(`已创建 ${createdTasks.length} 个任务`);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(createdTasks, null, 2)
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
   */
  server.tool("list_tasks", "获取当前任务列表，支持过滤条件",
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
              text: JSON.stringify(tasks, null, 2)
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
   */
  server.tool("get_task_details", "获取特定任务的详细信息",
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
              text: JSON.stringify(task, null, 2)
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
   */
  server.tool("update_task", "更新现有任务的一个或多个属性",
    {
      task_id: z.string().describe('要更新的任务ID'),
      updates: taskUpdateSchema
    },
    async (args) => {
      const { task_id, updates } = args;
      try {
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

        console.error(`任务 ${task_id} 已更新`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedTask, null, 2)
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
   */
  server.tool("delete_task", "删除指定的任务",
    {
      task_id: z.string().describe('要删除的任务ID')
    },
    async (args) => {
      const { task_id } = args;
      try {
        await prisma.task.delete({
          where: { id: task_id }
        });

        console.error(`任务 ${task_id} 已删除`);

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

  console.error('MCP工具注册完成');
}

/**
 * 主函数 - 启动MCP服务器
 */
async function main() {
  try {
    // 初始化默认列
    await columnService.initializeDefaultColumns();
    console.error('默认列初始化完成');

    // 创建MCP服务器
    const server = await createMCPServer();
    
    // 创建stdio传输层
    const transport = new StdioServerTransport();
    
    // 连接服务器到传输层
    await server.connect(transport);
    
    console.error('XItools MCP服务器已启动，等待连接...');
  } catch (error) {
    console.error('启动MCP服务器失败:', error);
    process.exit(1);
  }
}

// 启动服务器
main();
