/**
 * 工作区管理路由
 */

import { FastifyInstance } from 'fastify';
import { workspaceService } from '../services/workspaceService';
import { workspaceSchema, workspaceUpdateSchema } from '../types/multiBoardSchema';
import { authMiddleware, requireAuth, createOwnershipVerifier } from '../middleware/authMiddleware';

export default async function workspaceRoutes(fastify: FastifyInstance) {
  // 获取当前用户的所有工作区
  fastify.get('/workspaces', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const workspaces = await workspaceService.getWorkspacesByUser(userId);
      return { success: true, data: workspaces };
    } catch (error) {
      console.error('获取工作区列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取工作区列表失败' };
    }
  });

  // 获取默认工作区
  fastify.get('/workspaces/default', async (request, reply) => {
    try {
      const defaultWorkspace = await workspaceService.getDefaultWorkspace();
      if (!defaultWorkspace) {
        reply.status(404);
        return { success: false, error: '未找到默认工作区' };
      }
      return { success: true, data: defaultWorkspace };
    } catch (error) {
      console.error('获取默认工作区失败:', error);
      reply.status(500);
      return { success: false, error: '获取默认工作区失败' };
    }
  });

  // 根据ID获取工作区（需要验证所有权）
  fastify.get(
    '/workspaces/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('workspace')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const workspace = await workspaceService.getWorkspaceById(id);

        if (!workspace) {
          reply.status(404);
          return { success: false, error: '工作区不存在' };
        }

        return { success: true, data: workspace };
      } catch (error) {
        console.error('获取工作区失败:', error);
        reply.status(500);
        return { success: false, error: '获取工作区失败' };
      }
    },
  );

  // 创建工作区
  fastify.post('/workspaces', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const workspaceData = workspaceSchema.parse(request.body);
      const workspace = await workspaceService.createWorkspace(workspaceData, userId);

      // 广播工作区创建事件
      const io = fastify.io;
      if (io) {
        io.emit('workspace_created', workspace);
      }

      return { success: true, data: workspace };
    } catch (error) {
      console.error('创建工作区失败:', error);
      // 业务逻辑错误返回 400，服务器错误返回 500
      const statusCode = error instanceof Error && error.message.includes('已存在') ? 400 : 500;
      reply.status(statusCode);
      return { success: false, error: error instanceof Error ? error.message : '创建工作区失败' };
    }
  });

  // 更新工作区
  fastify.put(
    '/workspaces/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('workspace')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const updateData = workspaceUpdateSchema.parse(request.body);
        const workspace = await workspaceService.updateWorkspace(id, updateData);

        // 广播工作区更新事件
        const io = fastify.io;
        if (io) {
          io.emit('workspace_updated', workspace);
        }

        return { success: true, data: workspace };
      } catch (error) {
        console.error('更新工作区失败:', error);
        // 业务逻辑错误返回 400，服务器错误返回 500
        const statusCode = error instanceof Error && error.message.includes('已存在') ? 400 : 500;
        reply.status(statusCode);
        return { success: false, error: error instanceof Error ? error.message : '更新工作区失败' };
      }
    },
  );

  // 删除工作区
  fastify.delete(
    '/workspaces/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('workspace')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        await workspaceService.deleteWorkspace(id);

        // 广播工作区删除事件
        const io = fastify.io;
        if (io) {
          io.emit('workspace_deleted', { workspaceId: id });
        }

        return { success: true, message: '工作区删除成功' };
      } catch (error) {
        console.error('删除工作区失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '删除工作区失败' };
      }
    },
  );

  // 获取工作区统计信息
  fastify.get(
    '/workspaces/:id/stats',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('workspace')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const stats = await workspaceService.getWorkspaceStats(id);
        return { success: true, data: stats };
      } catch (error) {
        console.error('获取工作区统计失败:', error);
        reply.status(500);
        return { success: false, error: '获取工作区统计失败' };
      }
    },
  );

  // 初始化默认数据
  fastify.post('/workspaces/initialize', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const workspace = await workspaceService.initializeDefaultData(userId);
      return { success: true, data: workspace, message: '默认数据初始化成功' };
    } catch (error) {
      console.error('初始化默认数据失败:', error);
      reply.status(500);
      return { success: false, error: '初始化默认数据失败' };
    }
  });

  // 兼容性端点：获取当前工作区信息（用于单看板模式）
  fastify.get('/workspace/current', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      // 返回用户的默认工作区，保持向后兼容
      const defaultWorkspace = await workspaceService.getDefaultWorkspaceForUser(userId);
      if (!defaultWorkspace) {
        // 如果没有默认工作区，创建一个
        const newWorkspace = await workspaceService.ensureDefaultWorkspace(userId);
        return { success: true, data: newWorkspace };
      }
      return { success: true, data: defaultWorkspace };
    } catch (error) {
      console.error('获取当前工作区失败:', error);
      reply.status(500);
      return { success: false, error: '获取当前工作区失败' };
    }
  });
}
