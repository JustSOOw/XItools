/**
 * 工作区管理路由
 */

import { FastifyInstance } from 'fastify';
import { workspaceService } from '../services/workspaceService';
import { workspaceSchema, workspaceUpdateSchema } from '../types/multiBoardSchema';

export default async function workspaceRoutes(fastify: FastifyInstance) {
  // 获取所有工作区
  fastify.get('/workspaces', async (request, reply) => {
    try {
      const workspaces = await workspaceService.getAllWorkspaces();
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

  // 根据ID获取工作区
  fastify.get('/workspaces/:id', async (request, reply) => {
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
  });

  // 创建工作区
  fastify.post('/workspaces', async (request, reply) => {
    try {
      const workspaceData = workspaceSchema.parse(request.body);
      const workspace = await workspaceService.createWorkspace(workspaceData);
      
      // 广播工作区创建事件
      const io = fastify.io;
      if (io) {
        io.emit('workspace_created', workspace);
      }
      
      return { success: true, data: workspace };
    } catch (error) {
      console.error('创建工作区失败:', error);
      reply.status(500);
      return { success: false, error: error instanceof Error ? error.message : '创建工作区失败' };
    }
  });

  // 更新工作区
  fastify.put('/workspaces/:id', async (request, reply) => {
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
      reply.status(500);
      return { success: false, error: error instanceof Error ? error.message : '更新工作区失败' };
    }
  });

  // 删除工作区
  fastify.delete('/workspaces/:id', async (request, reply) => {
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
  });

  // 获取工作区统计信息
  fastify.get('/workspaces/:id/stats', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const stats = await workspaceService.getWorkspaceStats(id);
      return { success: true, data: stats };
    } catch (error) {
      console.error('获取工作区统计失败:', error);
      reply.status(500);
      return { success: false, error: '获取工作区统计失败' };
    }
  });

  // 初始化默认数据
  fastify.post('/workspaces/initialize', async (request, reply) => {
    try {
      const workspace = await workspaceService.initializeDefaultData();
      return { success: true, data: workspace, message: '默认数据初始化成功' };
    } catch (error) {
      console.error('初始化默认数据失败:', error);
      reply.status(500);
      return { success: false, error: '初始化默认数据失败' };
    }
  });

  // 兼容性端点：获取当前工作区信息（用于单看板模式）
  fastify.get('/workspace/current', async (request, reply) => {
    try {
      // 返回默认工作区，保持向后兼容
      const defaultWorkspace = await workspaceService.getDefaultWorkspace();
      if (!defaultWorkspace) {
        // 如果没有默认工作区，创建一个
        const newWorkspace = await workspaceService.ensureDefaultWorkspace();
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
