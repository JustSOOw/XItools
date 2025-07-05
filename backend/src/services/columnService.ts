import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 列数据验证Schema - 更新为支持多看板
export const columnSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, '列名不能为空').max(50, '列名不能超过50个字符'),
  order: z.number().min(0, '排序值不能为负数').transform(val => Math.round(val)),
  color: z.string().optional(),
  sortOption: z.string().optional().default('manual'),
  isDefault: z.boolean().optional().default(false),
  boardId: z.string().uuid('无效的看板ID'),
});

export const columnUpdateSchema = columnSchema.partial().omit({ id: true, boardId: true });

/**
 * 列管理服务类 - 更新为支持多看板
 */
export class ColumnService {
  /**
   * 获取指定看板的所有列，按order排序
   */
  async getColumnsByBoard(boardId: string) {
    return await prisma.boardColumn.findMany({
      where: { boardId },
      orderBy: { order: 'asc' }
    });
  }

  /**
   * 获取所有列，按看板分组
   * @deprecated 建议使用 getColumnsByBoard
   */
  async getAllColumns() {
    return await prisma.boardColumn.findMany({
      include: {
        board: true
      },
      orderBy: [
        { boardId: 'asc' },
        { order: 'asc' }
      ]
    });
  }

  /**
   * 根据ID获取单个列
   */
  async getColumnById(id: string) {
    return await prisma.boardColumn.findUnique({
      where: { id }
    });
  }

  /**
   * 创建新列
   */
  async createColumn(data: z.infer<typeof columnSchema>, userId?: string) {
    // 验证数据
    const validatedData = columnSchema.parse(data);

    // 检查看板是否存在且用户有权限（如果提供了userId）
    const whereClause = userId
      ? { id: validatedData.boardId, ownerId: userId }
      : { id: validatedData.boardId };

    const board = await prisma.board.findFirst({
      where: whereClause
    });

    if (!board) {
      throw new Error(userId ? '看板不存在或无权限访问' : '看板不存在');
    }

    // 检查在同一看板内order是否已存在
    const existingColumn = await prisma.boardColumn.findFirst({
      where: {
        boardId: validatedData.boardId,
        order: validatedData.order
      }
    });

    if (existingColumn) {
      // 如果order已存在，将同一看板内所有大于等于该order的列向后移动
      await prisma.boardColumn.updateMany({
        where: {
          boardId: validatedData.boardId,
          order: { gte: validatedData.order }
        },
        data: { order: { increment: 1 } }
      });
    }

    return await prisma.boardColumn.create({
      data: validatedData,
      include: {
        board: true
      }
    });
  }

  /**
   * 更新列信息
   */
  async updateColumn(id: string, data: z.infer<typeof columnUpdateSchema>) {
    // 验证数据
    const validatedData = columnUpdateSchema.parse(data);
    
    // 如果更新order，需要处理排序冲突
    if (validatedData.order !== undefined) {
      const currentColumn = await prisma.boardColumn.findUnique({
        where: { id }
      });
      
      if (!currentColumn) {
        throw new Error('列不存在');
      }
      
      const newOrder = validatedData.order;
      const oldOrder = currentColumn.order;
      
      if (newOrder !== oldOrder) {
        // 使用事务处理order更新
        await prisma.$transaction(async (tx) => {
          if (newOrder > oldOrder) {
            // 向后移动：将中间的列向前移动
            await tx.boardColumn.updateMany({
              where: {
                order: { gt: oldOrder, lte: newOrder },
                id: { not: id }
              },
              data: { order: { decrement: 1 } }
            });
          } else {
            // 向前移动：将中间的列向后移动
            await tx.boardColumn.updateMany({
              where: {
                order: { gte: newOrder, lt: oldOrder },
                id: { not: id }
              },
              data: { order: { increment: 1 } }
            });
          }
          
          // 更新目标列
          await tx.boardColumn.update({
            where: { id },
            data: validatedData
          });
        });
        
        return await this.getColumnById(id);
      }
    }
    
    return await prisma.boardColumn.update({
      where: { id },
      data: validatedData
    });
  }

  /**
   * 删除列
   */
  async deleteColumn(id: string) {
    // 检查列是否存在
    const column = await prisma.boardColumn.findUnique({
      where: { id }
    });
    
    if (!column) {
      throw new Error('列不存在');
    }
    
    // 检查是否为默认列
    if (column.isDefault) {
      throw new Error('不能删除默认列');
    }
    
    // 检查列中是否有任务
    const tasksInColumn = await prisma.task.count({
      where: { status: id }
    });
    
    if (tasksInColumn > 0) {
      throw new Error(`该列中还有 ${tasksInColumn} 个任务，请先移动或删除这些任务`);
    }
    
    // 使用事务删除列并调整其他列的order
    await prisma.$transaction(async (tx) => {
      // 删除列
      await tx.boardColumn.delete({
        where: { id }
      });
      
      // 将后面的列向前移动
      await tx.boardColumn.updateMany({
        where: { order: { gt: column.order } },
        data: { order: { decrement: 1 } }
      });
    });
    
    return { success: true, message: '列删除成功' };
  }

  /**
   * 重新排序列
   */
  async reorderColumns(boardId: string, columnIds: string[]) {
    // 验证所有列ID是否存在且属于同一看板
    const existingColumns = await prisma.boardColumn.findMany({
      where: {
        id: { in: columnIds },
        boardId
      }
    });

    if (existingColumns.length !== columnIds.length) {
      throw new Error('部分列ID不存在或不属于指定看板');
    }

    // 使用两阶段更新策略避免唯一约束冲突
    await prisma.$transaction(async (tx) => {
      // 第一阶段：将所有列的order设置为负值（临时值）
      for (let i = 0; i < columnIds.length; i++) {
        await tx.boardColumn.update({
          where: { id: columnIds[i] },
          data: { order: -(i + 1000) } // 使用负值避免与现有正值冲突
        });
      }

      // 第二阶段：设置最终的order值
      for (let i = 0; i < columnIds.length; i++) {
        await tx.boardColumn.update({
          where: { id: columnIds[i] },
          data: { order: i }
        });
      }
    });

    return await this.getColumnsByBoard(boardId);
  }

  /**
   * 为指定看板初始化默认列
   */
  async initializeDefaultColumns(boardId: string) {
    // 检查看板是否存在
    const board = await prisma.board.findUnique({
      where: { id: boardId }
    });

    if (!board) {
      throw new Error('看板不存在');
    }

    // 检查看板是否已有列
    const existingColumns = await prisma.boardColumn.count({
      where: { boardId }
    });

    if (existingColumns === 0) {
      const defaultColumns = [
        { name: '待办', order: 0, isDefault: true, boardId },
        { name: '进行中', order: 1, isDefault: true, boardId },
        { name: '已完成', order: 2, isDefault: true, boardId },
      ];

      for (const column of defaultColumns) {
        await prisma.boardColumn.create({ data: column });
      }

      console.log(`已为看板 ${boardId} 初始化默认列`);
    }

    return await this.getColumnsByBoard(boardId);
  }

  /**
   * 初始化默认列（兼容旧版本）
   * @deprecated 建议使用 initializeDefaultColumns(boardId)
   */
  async initializeDefaultColumnsLegacy() {
    const existingColumns = await prisma.boardColumn.count();

    if (existingColumns === 0) {
      console.log('检测到旧版本数据结构，请先运行数据迁移');
    }

    return await this.getAllColumns();
  }

  /**
   * 为用户初始化默认列（用于兼容性端点）
   */
  async initializeDefaultColumnsForUser(userId: string) {
    // 获取用户的默认工作区和看板
    const { workspaceService } = await import('./workspaceService');
    const { boardService } = await import('./boardService');

    const defaultWorkspace = await workspaceService.getDefaultWorkspaceForUser(userId);
    if (!defaultWorkspace) {
      throw new Error('未找到默认工作区');
    }

    const boards = await boardService.getBoardsByWorkspace(defaultWorkspace.id);
    if (boards.length === 0) {
      throw new Error('未找到看板');
    }

    // 为第一个看板初始化默认列
    return await this.initializeDefaultColumns(boards[0].id);
  }
}

export const columnService = new ColumnService();
