import { FastifyInstance } from 'fastify';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import apiKeyRoutes from './apiKeyRoutes';
import columnRoutes from './columnRoutes';
import workspaceRoutes from './workspaceRoutes';
import projectRoutes from './projectRoutes';
import boardRoutes from './boardRoutes';
import taskRoutes from './taskRoutes';
import teamRoutes from './teamRoutes';
import invitationRoutes from './invitationRoutes';
import permissionRoutes from './permissionRoutes';
import { PrismaClient } from '@prisma/client';

// 初始化Prisma客户端
const prisma = new PrismaClient();

export async function setupRoutes(fastify: FastifyInstance): Promise<void> {
  // 注册健康检查路由
  fastify.register(healthRoutes, { prefix: '/health' });

  // 注册认证路由
  fastify.register(authRoutes, { prefix: '/api' });

  // 注册API密钥管理路由
  fastify.register(apiKeyRoutes, { prefix: '/api' });

  // 注册多看板系统路由
  fastify.register(workspaceRoutes, { prefix: '/api' });
  fastify.register(projectRoutes, { prefix: '/api' });
  fastify.register(boardRoutes, { prefix: '/api' });
  fastify.register(taskRoutes, { prefix: '/api' });

  // 注册列管理路由（包含兼容性端点）
  fastify.register(columnRoutes, { prefix: '/api' });

  // 注册团队协作路由
  fastify.register(teamRoutes, { prefix: '/api' });
  fastify.register(invitationRoutes, { prefix: '/api' });
  fastify.register(permissionRoutes, { prefix: '/api' });

  // 添加根路径响应
  fastify.get('/', async () => {
    return { status: 'ok', message: 'XItools MCP服务正在运行' };
  });

  // 添加任务排序API端点
  fastify.post('/api/tasks/sort', async (request, reply) => {
    try {
      // 设置响应头
      reply.header('Content-Type', 'application/json');

      const { taskId, targetId, columnId, insertPosition = 'before' } = request.body as any;

      if (!taskId || !targetId || !columnId) {
        reply.status(400);
        return {
          success: false,
          error: '缺少必要参数: taskId, targetId, columnId',
        };
      }

      console.log(
        `接收到任务排序请求: 任务 ${taskId} 移动到 ${targetId} ${insertPosition}，列 ${columnId}`,
      );

      // 获取当前被拖拽的任务
      const draggedTask = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!draggedTask) {
        reply.status(404);
        return { success: false, error: '未找到拖拽的任务' };
      }

      // 查询目标任务
      const targetTask = await prisma.task.findUnique({
        where: { id: targetId },
      });

      if (!targetTask) {
        reply.status(404);
        return { success: false, error: '未找到目标任务' };
      }

      // 增加排序操作的日志
      console.log(
        `执行排序: 任务 ${taskId}(${draggedTask.title}) 排序到 ${targetId}(${targetTask.title}) ${insertPosition}，在列 ${columnId} 中`,
      );

      // 查找该列中的所有任务，以更新排序
      const columnTasks = await prisma.task.findMany({
        where: { status: columnId },
        orderBy: { sortOrder: 'asc' },
      });

      console.log(`列 ${columnId} 中有 ${columnTasks.length} 个任务`);

      // 获取任务在列中的当前顺序
      const allTaskIds = columnTasks.map((task) => task.id);
      const sourceIndex = allTaskIds.indexOf(taskId);
      const targetIndex = allTaskIds.indexOf(targetId);

      console.log(`任务当前索引: ${sourceIndex}, 目标索引: ${targetIndex}`);

      // 从列中移除源任务
      if (sourceIndex !== -1) {
        allTaskIds.splice(sourceIndex, 1);
      }

      // 根据insertPosition确定插入位置
      const targetTaskIndex = allTaskIds.indexOf(targetId);
      let insertIndex: number;

      if (targetTaskIndex !== -1) {
        if (insertPosition === 'after') {
          insertIndex = targetTaskIndex + 1;
        } else {
          insertIndex = targetTaskIndex;
        }

        // 确保插入位置不超出数组范围
        insertIndex = Math.max(0, Math.min(insertIndex, allTaskIds.length));
        allTaskIds.splice(insertIndex, 0, taskId);

        console.log(
          `插入任务 ${taskId} 到位置 ${insertIndex}，目标任务 ${targetId} 在位置 ${targetTaskIndex}`,
        );
      } else {
        // 如果找不到目标任务，就添加到末尾
        allTaskIds.push(taskId);
        console.log(`目标任务 ${targetId} 未找到，将任务 ${taskId} 添加到末尾`);
      }

      console.log(`最终任务顺序: ${allTaskIds.join(' -> ')}`);

      // 验证任务ID的唯一性
      const uniqueTaskIds = [...new Set(allTaskIds)];
      if (uniqueTaskIds.length !== allTaskIds.length) {
        console.error('任务ID重复，修复中...');
        allTaskIds.splice(0, allTaskIds.length, ...uniqueTaskIds);
      }

      console.log(`重新排序后的任务顺序: ${allTaskIds.join(', ')}`);

      // 使用事务确保数据一致性
      const updatedTask = await prisma.$transaction(async (tx) => {
        // 当用户拖拽任务时，清除相关列的排序状态，回到手动排序
        await tx.boardColumn.update({
          where: { id: columnId },
          data: {
            sortOption: 'manual',
            updatedAt: new Date(),
          },
        });

        // 如果是跨列拖拽，也清除原列的排序状态
        if (draggedTask.status !== columnId) {
          await tx.boardColumn.update({
            where: { id: draggedTask.status },
            data: {
              sortOption: 'manual',
              updatedAt: new Date(),
            },
          });
        }

        // 为所有任务分配新的排序值，确保顺序正确
        // 使用较大的增量值，便于将来插入新任务
        const SORT_INCREMENT = 1000;

        // 批量更新所有任务的排序值
        for (let i = 0; i < allTaskIds.length; i++) {
          const id = allTaskIds[i];
          const newSortOrder = i * SORT_INCREMENT;

          // 更新任务的排序值和状态
          await tx.task.update({
            where: { id },
            data: {
              sortOrder: newSortOrder,
              status: id === taskId ? columnId : undefined, // 只更新被拖拽任务的状态
              updatedAt: new Date(),
            },
          });

          console.log(
            `更新任务 ${id} 的排序值为 ${newSortOrder}${
              id === taskId ? ` 并更新状态为 ${columnId}` : ''
            }`,
          );
        }

        // 返回更新后的被拖拽任务
        return await tx.task.findUnique({
          where: { id: taskId },
          include: { tags: true },
        });
      });

      if (!updatedTask) {
        reply.status(404);
        return { success: false, error: '更新后未找到任务' };
      }

      // 发送WebSocket事件（前端会忽略，但保持多用户同步）
      const io = fastify.io;
      if (io) {
        io.emit('task_updated', updatedTask);
        console.log('任务拖拽完成，已广播更新事件');
      }

      console.log(`任务 ${taskId} 成功移动到任务 ${targetId} ${insertPosition}`);
      return { success: true, data: updatedTask };
    } catch (error) {
      console.error('任务排序失败:', error);
      reply.status(500);
      return { success: false, error: '任务排序失败' };
    }
  });

  // 添加列任务排序API端点
  fastify.post('/api/columns/:columnId/sort', async (request, reply) => {
    try {
      reply.header('Content-Type', 'application/json');

      const { columnId } = request.params as { columnId: string };
      const { sortOption } = request.body as { sortOption: string };

      if (!columnId || !sortOption) {
        reply.status(400);
        return {
          success: false,
          error: '缺少必要参数: columnId, sortOption',
        };
      }

      console.log(`接收到列排序请求: 列 ${columnId}, 排序方式 ${sortOption}`);

      // 获取该列的所有任务
      const columnTasks = await prisma.task.findMany({
        where: { status: columnId },
        include: { tags: true },
      });

      if (columnTasks.length === 0) {
        return { success: true, data: [], message: '该列暂无任务' };
      }

      // 根据排序选项对任务进行排序
      let sortedTasks = [...columnTasks];

      switch (sortOption) {
        case 'priority':
          // 按优先级排序：High > Medium > Low > null
          sortedTasks.sort((a, b) => {
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
            const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
            return bPriority - aPriority;
          });
          break;

        case 'created_asc':
          // 按创建时间升序
          sortedTasks.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          break;

        case 'created_desc':
          // 按创建时间降序
          sortedTasks.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;

        case 'title_asc':
          // 按标题升序
          sortedTasks.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
          break;

        case 'title_desc':
          // 按标题降序
          sortedTasks.sort((a, b) => b.title.localeCompare(a.title, 'zh-CN'));
          break;

        case 'due_date':
          // 按截止日期排序，无截止日期的排在最后
          sortedTasks.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          });
          break;

        default:
          // manual 或其他情况，保持原有顺序
          sortedTasks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          break;
      }

      // 使用事务更新所有任务的sortOrder
      const updatedTasks = await prisma.$transaction(async (tx) => {
        const SORT_INCREMENT = 1000;
        const results = [];

        for (let i = 0; i < sortedTasks.length; i++) {
          const task = sortedTasks[i];
          const newSortOrder = i * SORT_INCREMENT;

          const updatedTask = await tx.task.update({
            where: { id: task.id },
            data: {
              sortOrder: newSortOrder,
              updatedAt: new Date(),
            },
            include: { tags: true },
          });

          results.push(updatedTask);
        }

        return results;
      });

      // 更新列的排序选项
      await prisma.boardColumn.update({
        where: { id: columnId },
        data: {
          sortOption,
          updatedAt: new Date(),
        },
      });

      // 广播更新事件
      const io = fastify.io;
      if (io) {
        io.emit('column_tasks_sorted', {
          columnId,
          sortOption,
          tasks: updatedTasks,
        });
      }

      console.log(`列 ${columnId} 的 ${columnTasks.length} 个任务已按 ${sortOption} 排序`);
      return { success: true, data: updatedTasks, sortOption };
    } catch (error) {
      console.error('列任务排序失败:', error);
      reply.status(500);
      return { success: false, error: '列任务排序失败' };
    }
  });
}
