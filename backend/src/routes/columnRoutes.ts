import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { columnService, columnSchema, columnUpdateSchema } from '../services/columnService';
import { authMiddleware, requireAuth, createOwnershipVerifier } from '../middleware/authMiddleware';

// 扩展FastifyInstance类型以包含io属性
declare module 'fastify' {
  interface FastifyInstance {
    io?: SocketIOServer;
  }
}

/**
 * 列管理相关的API路由
 */
export default async function columnRoutes(fastify: FastifyInstance) {
  // 获取指定看板的所有列（需要验证看板所有权）
  fastify.get(
    '/boards/:boardId/columns',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('board')],
    },
    async (request, reply) => {
      try {
        const { boardId } = request.params as { boardId: string };
        const columns = await columnService.getColumnsByBoard(boardId);
        return { success: true, data: columns };
      } catch (error) {
        console.error('获取看板列失败:', error);
        reply.status(500);
        return { success: false, error: '获取看板列失败' };
      }
    },
  );

  // 兼容性端点：获取所有列（用于单看板模式）
  fastify.get('/columns', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      // 获取用户默认看板的列，保持向后兼容
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

      const columns = await columnService.getColumnsByBoard(boards[0].id);
      return { success: true, data: columns };
    } catch (error) {
      console.error('获取列列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取列列表失败' };
    }
  });

  // 获取单个列（需要验证列所有权）
  fastify.get(
    '/columns/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('column')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const column = await columnService.getColumnById(id);

        if (!column) {
          reply.status(404);
          return { success: false, error: '列不存在' };
        }

        return { success: true, data: column };
      } catch (error) {
        console.error('获取列详情失败:', error);
        reply.status(500);
        return { success: false, error: '获取列详情失败' };
      }
    },
  );

  // 创建新列
  fastify.post('/columns', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const columnData = request.body as any;
      const newColumn = await columnService.createColumn(columnData, userId);

      // 广播列创建事件
      const io = fastify.io;
      if (io) {
        io.emit('column_created', newColumn);
      }

      return { success: true, data: newColumn };
    } catch (error) {
      console.error('创建列失败:', error);
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建列失败',
      };
    }
  });

  // 更新列
  fastify.put(
    '/columns/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('column')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const updateData = request.body as any;

        const updatedColumn = await columnService.updateColumn(id, updateData);

        // 广播列更新事件
        const io = fastify.io;
        if (io) {
          io.emit('column_updated', updatedColumn);
        }

        return { success: true, data: updatedColumn };
      } catch (error) {
        console.error('更新列失败:', error);
        reply.status(400);
        return {
          success: false,
          error: error instanceof Error ? error.message : '更新列失败',
        };
      }
    },
  );

  // 删除列
  fastify.delete(
    '/columns/:id',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('column')],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await columnService.deleteColumn(id);

        // 广播列删除事件
        const io = fastify.io;
        if (io) {
          io.emit('column_deleted', { id });
        }

        return result;
      } catch (error) {
        console.error('删除列失败:', error);
        reply.status(400);
        return {
          success: false,
          error: error instanceof Error ? error.message : '删除列失败',
        };
      }
    },
  );

  // 重新排序指定看板的列
  fastify.post(
    '/boards/:boardId/columns/reorder',
    {
      preHandler: [authMiddleware, createOwnershipVerifier('board')],
    },
    async (request, reply) => {
      try {
        const { boardId } = request.params as { boardId: string };
        const { columnIds } = request.body as { columnIds: string[] };

        if (!Array.isArray(columnIds)) {
          reply.status(400);
          return { success: false, error: 'columnIds必须是数组' };
        }

        const reorderedColumns = await columnService.reorderColumns(boardId, columnIds);

        // 广播列重排序事件
        const io = fastify.io;
        if (io) {
          io.emit('columns_reordered', { boardId, columns: reorderedColumns });
        }

        return { success: true, data: reorderedColumns };
      } catch (error) {
        console.error('重新排序列失败:', error);
        reply.status(400);
        return {
          success: false,
          error: error instanceof Error ? error.message : '重新排序列失败',
        };
      }
    },
  );

  // 兼容性端点：重新排序列（用于单看板模式）
  fastify.post('/columns/reorder', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { columnIds } = request.body as { columnIds: string[] };

      if (!Array.isArray(columnIds)) {
        reply.status(400);
        return { success: false, error: 'columnIds必须是数组' };
      }

      // 获取用户默认看板ID
      const { workspaceService } = await import('../services/workspaceService');
      const { boardService } = await import('../services/boardService');

      const defaultWorkspace = await workspaceService.getDefaultWorkspaceForUser(userId);
      if (!defaultWorkspace) {
        reply.status(404);
        return { success: false, error: '未找到默认工作区' };
      }

      const boards = await boardService.getBoardsByWorkspace(defaultWorkspace.id);
      if (boards.length === 0) {
        reply.status(404);
        return { success: false, error: '未找到看板' };
      }

      const reorderedColumns = await columnService.reorderColumns(boards[0].id, columnIds);

      // 广播列重排序事件
      const io = fastify.io;
      if (io) {
        io.emit('columns_reordered', { boardId: boards[0].id, columns: reorderedColumns });
      }

      return { success: true, data: reorderedColumns };
    } catch (error) {
      console.error('重新排序列失败:', error);
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : '重新排序列失败',
      };
    }
  });

  // 初始化默认列
  fastify.post('/columns/initialize', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const columns = await columnService.initializeDefaultColumnsForUser(userId);

      // 广播列初始化事件
      const io = fastify.io;
      if (io) {
        io.emit('columns_initialized', columns);
      }

      return { success: true, data: columns };
    } catch (error) {
      console.error('初始化默认列失败:', error);
      reply.status(500);
      return { success: false, error: '初始化默认列失败' };
    }
  });
}
