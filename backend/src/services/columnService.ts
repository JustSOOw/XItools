import { PrismaClient } from '../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// 列数据验证Schema
export const columnSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, '列名不能为空').max(50, '列名不能超过50个字符'),
  order: z.number().int().min(0, '排序值不能为负数'),
  color: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const columnUpdateSchema = columnSchema.partial().omit({ id: true });

/**
 * 列管理服务类
 */
export class ColumnService {
  /**
   * 获取所有列，按order排序
   */
  async getAllColumns() {
    return await prisma.boardColumn.findMany({
      orderBy: { order: 'asc' }
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
  async createColumn(data: z.infer<typeof columnSchema>) {
    // 验证数据
    const validatedData = columnSchema.parse(data);
    
    // 检查order是否已存在
    const existingColumn = await prisma.boardColumn.findFirst({
      where: { order: validatedData.order }
    });
    
    if (existingColumn) {
      // 如果order已存在，将所有大于等于该order的列向后移动
      await prisma.boardColumn.updateMany({
        where: { order: { gte: validatedData.order } },
        data: { order: { increment: 1 } }
      });
    }

    return await prisma.boardColumn.create({
      data: validatedData
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
  async reorderColumns(columnIds: string[]) {
    // 验证所有列ID是否存在
    const existingColumns = await prisma.boardColumn.findMany({
      where: { id: { in: columnIds } }
    });

    if (existingColumns.length !== columnIds.length) {
      throw new Error('部分列ID不存在');
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

    return await this.getAllColumns();
  }

  /**
   * 初始化默认列（如果数据库为空）
   */
  async initializeDefaultColumns() {
    const existingColumns = await prisma.boardColumn.count();
    
    if (existingColumns === 0) {
      const defaultColumns = [
        { name: '待办', order: 0, isDefault: true },
        { name: '进行中', order: 1, isDefault: true },
        { name: '已完成', order: 2, isDefault: true },
      ];
      
      for (const column of defaultColumns) {
        await prisma.boardColumn.create({ data: column });
      }
      
      console.log('已初始化默认看板列');
    }
    
    return await this.getAllColumns();
  }
}

export const columnService = new ColumnService();
