import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { columnService, columnSchema, columnUpdateSchema } from '../services/columnService';

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
  // 获取所有列
  fastify.get('/columns', async (request, reply) => {
    try {
      const columns = await columnService.getAllColumns();
      return { success: true, data: columns };
    } catch (error) {
      console.error('获取列列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取列列表失败' };
    }
  });

  // 获取单个列
  fastify.get('/columns/:id', async (request, reply) => {
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
  });

  // 创建新列
  fastify.post('/columns', async (request, reply) => {
    try {
      const columnData = request.body as any;
      const newColumn = await columnService.createColumn(columnData);
      
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
        error: error instanceof Error ? error.message : '创建列失败' 
      };
    }
  });

  // 更新列
  fastify.put('/columns/:id', async (request, reply) => {
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
        error: error instanceof Error ? error.message : '更新列失败' 
      };
    }
  });

  // 删除列
  fastify.delete('/columns/:id', async (request, reply) => {
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
        error: error instanceof Error ? error.message : '删除列失败' 
      };
    }
  });

  // 重新排序列
  fastify.post('/columns/reorder', async (request, reply) => {
    try {
      const { columnIds } = request.body as { columnIds: string[] };
      
      if (!Array.isArray(columnIds)) {
        reply.status(400);
        return { success: false, error: 'columnIds必须是数组' };
      }
      
      const reorderedColumns = await columnService.reorderColumns(columnIds);
      
      // 广播列重排序事件
      const io = fastify.io;
      if (io) {
        io.emit('columns_reordered', reorderedColumns);
      }
      
      return { success: true, data: reorderedColumns };
    } catch (error) {
      console.error('重新排序列失败:', error);
      reply.status(400);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '重新排序列失败' 
      };
    }
  });

  // 初始化默认列
  fastify.post('/columns/initialize', async (request, reply) => {
    try {
      const columns = await columnService.initializeDefaultColumns();
      
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
