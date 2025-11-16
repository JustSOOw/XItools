/**
 * 任务管理路由 - 支持多看板
 */

import { FastifyInstance } from 'fastify';
import { taskService } from '../services/taskService';
import { extendedTaskSchema, extendedTaskUpdateSchema } from '../types/multiBoardSchema';
import { authMiddleware, requireAuth, createOwnershipVerifier } from '../middleware/authMiddleware';
import {
  createOwnershipOrPermissionVerifier
} from '../middleware/permissionMiddleware';
import { ProjectPermissionType } from '../types/teamTypes';

export default async function taskRoutes(fastify: FastifyInstance) {
  // 获取指定看板的所有任务（需要查看权限）
  fastify.get(
    '/boards/:boardId/tasks',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW)],
    },
    async (request, reply) => {
      try {
        const { boardId } = request.params as { boardId: string };
        const tasks = await taskService.getTasksByBoard(boardId);
        return { success: true, data: tasks };
      } catch (error) {
        console.error('获取看板任务失败:', error);
        reply.status(500);
        return { success: false, error: '获取看板任务失败' };
      }
    },
  );

  // 注意：获取看板列的路由已在 columnRoutes.ts 中定义，避免重复

  // 获取指定项目的所有任务（需要查看权限）
  fastify.get(
    '/projects/:projectId/tasks',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW)],
    },
    async (request, reply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const tasks = await taskService.getTasksByProject(projectId);
        return { success: true, data: tasks };
      } catch (error) {
        console.error('获取项目任务失败:', error);
        reply.status(500);
        return { success: false, error: '获取项目任务失败' };
      }
    },
  );

  // 获取指定工作区的所有任务（需要验证工作区所有权）
  fastify.get(
    '/workspaces/:workspaceId/tasks',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('workspace')],
    },
    async (request, reply) => {
      try {
        const { workspaceId } = request.params as { workspaceId: string };
        const tasks = await taskService.getTasksByWorkspace(workspaceId);
        return { success: true, data: tasks };
      } catch (error) {
        console.error('获取工作区任务失败:', error);
        reply.status(500);
        return { success: false, error: '获取工作区任务失败' };
      }
    },
  );

  // 根据ID获取任务（需要查看权限）
  fastify.get(
    '/tasks/:id',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW)],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const task = await taskService.getTaskById(id);

        if (!task) {
          reply.status(404);
          return { success: false, error: '任务不存在' };
        }

        return { success: true, data: task };
      } catch (error) {
        console.error('获取任务失败:', error);
        reply.status(500);
        return { success: false, error: '获取任务失败' };
      }
    },
  );

  // 创建任务（需要编辑权限）
  fastify.post('/tasks', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const taskData = extendedTaskSchema.parse(request.body);

      // 检查用户是否对看板所属的项目有编辑权限
      if (taskData.boardId) {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const board = await prisma.board.findUnique({
          where: { id: taskData.boardId },
          include: { project: true },
        });
        await prisma.$disconnect();

        if (board?.project) {
          const { permissionService } = await import('../services/permissionService');
          const hasPermission = await permissionService.checkProjectPermission(
            userId,
            board.project.id,
            ProjectPermissionType.EDIT
          );

          if (!hasPermission) {
            reply.status(403);
            return { success: false, error: '您没有在该项目中创建任务的权限' };
          }
        }
      }

      const task = await taskService.createTask(taskData, userId);

      // 广播任务创建事件
      const io = fastify.io;
      if (io) {
        io.emit('task_created', task);
      }

      return { success: true, data: task };
    } catch (error) {
      console.error('创建任务失败:', error);
      reply.status(500);
      return { success: false, error: error instanceof Error ? error.message : '创建任务失败' };
    }
  });

  // 批量创建任务
  fastify.post('/tasks/batch', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { tasks } = request.body as { tasks: any[] };

      if (!Array.isArray(tasks)) {
        reply.status(400);
        return { success: false, error: 'tasks必须是数组' };
      }

      const createdTasks = await taskService.createTasks(tasks, userId);

      // 广播批量任务创建事件
      const io = fastify.io;
      if (io) {
        io.emit('tasks_batch_created', createdTasks);
      }

      return { success: true, data: createdTasks };
    } catch (error) {
      console.error('批量创建任务失败:', error);
      reply.status(500);
      return { success: false, error: error instanceof Error ? error.message : '批量创建任务失败' };
    }
  });

  // 更新任务（需要编辑权限）
  fastify.put(
    '/tasks/:id',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.EDIT)],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const updateData = extendedTaskUpdateSchema.parse(request.body);
        const task = await taskService.updateTask(id, updateData, request.user!.userId);

        // 广播任务更新事件
        const io = fastify.io;
        if (io) {
          io.emit('task_updated', task);
        }

        return { success: true, data: task };
      } catch (error) {
        console.error('更新任务失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '更新任务失败' };
      }
    },
  );

  // 删除任务（需要编辑权限）
  fastify.delete(
    '/tasks/:id',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.EDIT)],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        await taskService.deleteTask(id);

        // 广播任务删除事件
        const io = fastify.io;
        if (io) {
          io.emit('task_deleted', { taskId: id });
        }

        return { success: true, message: '任务删除成功' };
      } catch (error) {
        console.error('删除任务失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '删除任务失败' };
      }
    },
  );

  // 移除跨看板移动API - 任务只能在同一看板内移动

  // 兼容性端点：获取任务列表（用于单看板模式）
  fastify.get('/tasks', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      // 获取用户默认看板的任务，保持向后兼容
      const { workspaceService } = await import('../services/workspaceService');
      const { boardService } = await import('../services/boardService');

      const defaultWorkspace = await workspaceService.getDefaultWorkspaceForUser(userId);
      if (!defaultWorkspace) {
        return { success: true, data: [] };
      }

      const boards = await boardService.getBoardsByWorkspace(defaultWorkspace.id);
      if (boards.length === 0) {
        return { success: true, data: [] };
      }

      const tasks = await taskService.getTasksByBoard(boards[0].id);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('获取任务列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取任务列表失败' };
    }
  });

  // 兼容性端点：任务列表查询（用于单看板模式）
  fastify.post('/tasks/list', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      // 设置响应头
      reply.header('Content-Type', 'application/json');

      console.log('接收到任务列表请求:', request.body);

      // 获取过滤选项
      const filterOptions = request.body ? (request.body as any).filter_options || {} : {};

      // 获取用户默认看板的任务
      const { workspaceService } = await import('../services/workspaceService');
      const { boardService } = await import('../services/boardService');
      const { PrismaClient } = await import('@prisma/client');

      const prisma = new PrismaClient();

      const defaultWorkspace = await workspaceService.getDefaultWorkspaceForUser(userId);
      if (!defaultWorkspace) {
        return { success: true, data: [] };
      }

      const boards = await boardService.getBoardsByWorkspace(defaultWorkspace.id);
      if (boards.length === 0) {
        return { success: true, data: [] };
      }

      // 构建查询条件
      const where: any = {
        boardId: boards[0].id,
      };

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
                in: filterOptions.tags,
              },
            },
          };
        }
      }

      // 查询数据库
      const tasks = await prisma.task.findMany({
        where,
        include: {
          tags: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });

      console.log(`返回 ${tasks.length} 个任务`);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('获取任务列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取任务列表失败' };
    }
  });
}
