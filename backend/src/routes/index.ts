import { FastifyInstance } from 'fastify';
import healthRoutes from './healthRoutes';
import columnRoutes from './columnRoutes';
import { PrismaClient } from '../generated/prisma';

// 初始化Prisma客户端
const prisma = new PrismaClient();

export async function setupRoutes(fastify: FastifyInstance): Promise<void> {
  // 注册健康检查路由
  fastify.register(healthRoutes, { prefix: '/health' });

  // 注册列管理路由
  fastify.register(columnRoutes, { prefix: '/api' });

  // 未来可在此处添加其他路由
  
  // 添加根路径响应
  fastify.get('/', async () => {
    return { status: 'ok', message: 'XItools MCP服务正在运行' };
  });

  // 添加直接API端点来处理任务列表请求
  fastify.post('/api/tasks/list', async (request, reply) => {
    try {
      // 设置响应头
      reply.header('Content-Type', 'application/json');
      
      console.log('接收到直接API任务列表请求:', request.body);
      
      // 获取过滤选项
      const filterOptions = request.body ? (request.body as any).filter_options || {} : {};
      
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

      // 查询数据库 - 优先按sortOrder排序，再按创建时间排序
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
      
      console.log(`直接API返回 ${tasks.length} 个任务`);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('获取任务列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取任务列表失败' };
    }
  });

  // 添加任务排序API端点
  fastify.post('/api/tasks/sort', async (request, reply) => {
    try {
      // 设置响应头
      reply.header('Content-Type', 'application/json');
      
      const { taskId, targetId, columnId } = request.body as any;
      
      if (!taskId || !targetId || !columnId) {
        reply.status(400);
        return { 
          success: false, 
          error: '缺少必要参数: taskId, targetId, columnId' 
        };
      }
      
      console.log(`接收到任务排序请求: 任务 ${taskId} 移动到 ${targetId} 之前，列 ${columnId}`);
      
      // 获取当前被拖拽的任务
      const draggedTask = await prisma.task.findUnique({
        where: { id: taskId }
      });
      
      if (!draggedTask) {
        reply.status(404);
        return { success: false, error: '未找到拖拽的任务' };
      }
      
      // 查询目标任务
      const targetTask = await prisma.task.findUnique({
        where: { id: targetId }
      });
      
      if (!targetTask) {
        reply.status(404);
        return { success: false, error: '未找到目标任务' };
      }
      
      // 增加排序操作的日志
      console.log(`执行排序: 任务 ${taskId} 排序到 ${targetId} 之前，在列 ${columnId} 中`);
      
      // 查找该列中的所有任务，以更新排序
      const columnTasks = await prisma.task.findMany({
        where: { status: columnId },
        orderBy: { sortOrder: 'asc' }
      });
      
      console.log(`列 ${columnId} 中有 ${columnTasks.length} 个任务`);
      
      // 获取任务在列中的当前顺序
      const allTaskIds = columnTasks.map(task => task.id);
      const sourceIndex = allTaskIds.indexOf(taskId);
      const targetIndex = allTaskIds.indexOf(targetId);
      
      console.log(`任务当前索引: ${sourceIndex}, 目标索引: ${targetIndex}`);
      
      // 从列中移除源任务
      if (sourceIndex !== -1) {
        allTaskIds.splice(sourceIndex, 1);
      }
      
      // 在目标位置前插入任务
      const insertIndex = allTaskIds.indexOf(targetId);
      if (insertIndex !== -1) {
        allTaskIds.splice(insertIndex, 0, taskId);
      } else {
        // 如果找不到目标任务，就添加到末尾
        allTaskIds.push(taskId);
      }
      
      console.log(`重新排序后的任务顺序: ${allTaskIds.join(', ')}`);
      
      // 为所有任务分配新的排序值，确保顺序正确
      // 使用较大的增量值，便于将来插入新任务
      const SORT_INCREMENT = 1000;
      
      // 批量更新所有任务的排序值
      for (let i = 0; i < allTaskIds.length; i++) {
        const id = allTaskIds[i];
        const newSortOrder = i * SORT_INCREMENT;
        
        // 跳过被拖拽的任务，因为我们会单独更新它
        if (id === taskId) {
          continue;
        }
        
        // 更新其他任务的排序值
        await prisma.task.update({
          where: { id },
          data: { sortOrder: newSortOrder }
        });
        
        console.log(`更新任务 ${id} 的排序值为 ${newSortOrder}`);
      }
      
      // 计算被拖拽任务的新排序值
      const draggedTaskIndex = allTaskIds.indexOf(taskId);
      const newSortOrder = draggedTaskIndex * SORT_INCREMENT;
      console.log(`被拖拽任务的新排序值: ${newSortOrder}`);
      
      
      // 更新任务状态和顺序
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: columnId,
          sortOrder: newSortOrder,
          updatedAt: new Date()
        },
        include: {
          tags: true
        }
      });
      
      // 发送WebSocket事件通知前端更新
      const io = fastify.io;
      if (io) {
        io.emit('task_updated', updatedTask);
      }
      
      console.log(`任务 ${taskId} 成功移动到任务 ${targetId} 之前`);
      return { success: true, data: updatedTask };
      
    } catch (error) {
      console.error('任务排序失败:', error);
      reply.status(500);
      return { success: false, error: '任务排序失败' };
    }
  });
} 