/**
 * 项目管理路由
 */

import { FastifyInstance } from 'fastify';
import { projectService } from '../services/projectService';
import { projectSchema, projectUpdateSchema, reorderSchema } from '../types/multiBoardSchema';
import { authMiddleware, requireAuth, createOwnershipVerifier } from '../middleware/authMiddleware';

export default async function projectRoutes(fastify: FastifyInstance) {
  // 获取工作区下的所有项目（需要验证工作区所有权）
  fastify.get(
    '/workspaces/:workspaceId/projects',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('workspace')],
    },
    async (request, reply) => {
      try {
        const { workspaceId } = request.params as { workspaceId: string };
        const projects = await projectService.getProjectsByWorkspace(workspaceId);
        return { success: true, data: projects };
      } catch (error) {
        console.error('获取项目列表失败:', error);
        reply.status(500);
        return { success: false, error: '获取项目列表失败' };
      }
    },
  );

  // 根据ID获取项目（需要验证项目所有权）
  fastify.get(
    '/projects/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('project')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const project = await projectService.getProjectById(id);

        if (!project) {
          reply.status(404);
          return { success: false, error: '项目不存在' };
        }

        return { success: true, data: project };
      } catch (error) {
        console.error('获取项目失败:', error);
        reply.status(500);
        return { success: false, error: '获取项目失败' };
      }
    },
  );

  // 创建项目
  fastify.post('/projects', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const projectData = projectSchema.parse(request.body);
      const project = await projectService.createProject(projectData, userId);

      // 广播项目创建事件
      const io = fastify.io;
      if (io) {
        io.emit('project_created', project);
      }

      return { success: true, data: project };
    } catch (error) {
      console.error('创建项目失败:', error);
      reply.status(500);
      return { success: false, error: error instanceof Error ? error.message : '创建项目失败' };
    }
  });

  // 更新项目
  fastify.put(
    '/projects/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('project')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const updateData = projectUpdateSchema.parse(request.body);
        const project = await projectService.updateProject(id, updateData);

        // 广播项目更新事件
        const io = fastify.io;
        if (io) {
          io.emit('project_updated', project);
        }

        return { success: true, data: project };
      } catch (error) {
        console.error('更新项目失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '更新项目失败' };
      }
    },
  );

  // 删除项目
  fastify.delete(
    '/projects/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('project')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        await projectService.deleteProject(id);

        // 广播项目删除事件
        const io = fastify.io;
        if (io) {
          io.emit('project_deleted', { projectId: id });
        }

        return { success: true, message: '项目删除成功' };
      } catch (error) {
        console.error('删除项目失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '删除项目失败' };
      }
    },
  );

  // 重新排序项目
  fastify.post(
    '/workspaces/:workspaceId/projects/reorder',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('workspace')],
    },
    async (request, reply) => {
      try {
        const { workspaceId } = request.params as { workspaceId: string };
        const { itemIds } = reorderSchema.parse(request.body);
        const projects = await projectService.reorderProjects(workspaceId, itemIds);

        // 广播项目重排序事件
        const io = fastify.io;
        if (io) {
          io.emit('projects_reordered', { workspaceId, projects });
        }

        return { success: true, data: projects };
      } catch (error) {
        console.error('项目重排序失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '项目重排序失败' };
      }
    },
  );

  // 移动项目到其他工作区
  fastify.post(
    '/projects/:id/move',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('project')],
    },
    async (request, reply) => {
      try {
        const userId = requireAuth(request);
        const { id } = request.params as { id: string };
        const { targetWorkspaceId } = request.body as { targetWorkspaceId: string };

        if (!targetWorkspaceId) {
          reply.status(400);
          return { success: false, error: '缺少目标工作区ID' };
        }

        const project = await projectService.moveProject(id, targetWorkspaceId, userId);

        // 广播项目移动事件
        const io = fastify.io;
        if (io) {
          io.emit('project_moved', { project, targetWorkspaceId });
        }

        return { success: true, data: project };
      } catch (error) {
        console.error('移动项目失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '移动项目失败' };
      }
    },
  );

  // 获取项目统计信息
  fastify.get(
    '/projects/:id/stats',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('project')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const stats = await projectService.getProjectStats(id);
        return { success: true, data: stats };
      } catch (error) {
        console.error('获取项目统计失败:', error);
        reply.status(500);
        return { success: false, error: '获取项目统计失败' };
      }
    },
  );

  // 复制项目
  fastify.post(
    '/projects/:id/duplicate',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('project')],
    },
    async (request, reply) => {
      try {
        const userId = requireAuth(request);
        const { id } = request.params as { id: string };
        const { newName } = request.body as { newName?: string };
        const project = await projectService.duplicateProject(id, newName, userId);

        // 广播项目复制事件
        const io = fastify.io;
        if (io) {
          io.emit('project_duplicated', { originalId: id, newProject: project });
        }

        return { success: true, data: project };
      } catch (error) {
        console.error('复制项目失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '复制项目失败' };
      }
    },
  );

  // 兼容性端点：获取所有项目（用于单看板模式）
  fastify.get('/projects', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      // 获取用户默认工作区的所有项目，保持向后兼容
      const { workspaceService } = await import('../services/workspaceService');
      const defaultWorkspace = await workspaceService.getDefaultWorkspaceForUser(userId);

      if (!defaultWorkspace) {
        return { success: true, data: [] };
      }

      const projects = await projectService.getProjectsByWorkspace(defaultWorkspace.id);
      return { success: true, data: projects };
    } catch (error) {
      console.error('获取项目列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取项目列表失败' };
    }
  });
}
