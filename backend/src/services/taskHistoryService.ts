import { PrismaClient, TaskHistory } from '@prisma/client';
import {
  TaskHistoryDTO,
  RecordTaskChangeInput,
  GetTaskHistoryOptions,
  TaskHistoryResponse,
  TaskHistoryAction,
} from '../types/taskHistoryTypes.js';

const prisma = new PrismaClient();

export class TaskHistoryService {
  /**
   * 记录任务变更
   */
  async recordTaskChange(input: RecordTaskChangeInput): Promise<TaskHistoryDTO> {
    // 将复杂值转换为JSON字符串
    const oldValueStr = input.oldValue !== undefined
      ? (typeof input.oldValue === 'object' ? JSON.stringify(input.oldValue) : String(input.oldValue))
      : undefined;

    const newValueStr = input.newValue !== undefined
      ? (typeof input.newValue === 'object' ? JSON.stringify(input.newValue) : String(input.newValue))
      : undefined;

    const history = await prisma.taskHistory.create({
      data: {
        taskId: input.taskId,
        userId: input.userId,
        action: input.action,
        field: input.field,
        oldValue: oldValueStr,
        newValue: newValueStr,
        changes: input.changes,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return this.mapToDTO(history);
  }

  /**
   * 批量记录任务变更
   */
  async recordTaskChanges(inputs: RecordTaskChangeInput[]): Promise<void> {
    const data = inputs.map(input => ({
      taskId: input.taskId,
      userId: input.userId,
      action: input.action,
      field: input.field,
      oldValue: input.oldValue !== undefined
        ? (typeof input.oldValue === 'object' ? JSON.stringify(input.oldValue) : String(input.oldValue))
        : undefined,
      newValue: input.newValue !== undefined
        ? (typeof input.newValue === 'object' ? JSON.stringify(input.newValue) : String(input.newValue))
        : undefined,
      changes: input.changes,
    }));

    await prisma.taskHistory.createMany({
      data,
    });
  }

  /**
   * 获取任务历史记录
   */
  async getTaskHistory(
    taskId: string,
    options: GetTaskHistoryOptions = {}
  ): Promise<TaskHistoryResponse> {
    const {
      page = 1,
      pageSize = 20,
      action,
    } = options;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = { taskId };
    if (action) {
      where.action = action;
    }

    // 并行查询历史列表和总数
    const [historyRecords, total] = await Promise.all([
      prisma.taskHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      prisma.taskHistory.count({ where }),
    ]);

    return {
      data: historyRecords.map(this.mapToDTO),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取用户的所有任务历史操作
   */
  async getUserTaskHistory(
    userId: string,
    options: GetTaskHistoryOptions = {}
  ): Promise<TaskHistoryResponse> {
    const {
      page = 1,
      pageSize = 20,
      action,
    } = options;

    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (action) {
      where.action = action;
    }

    const [historyRecords, total] = await Promise.all([
      prisma.taskHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.taskHistory.count({ where }),
    ]);

    return {
      data: historyRecords.map(this.mapToDTO),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 删除任务的所有历史记录
   * （通常在任务被永久删除时调用，但由于 onDelete: Cascade，数据库会自动处理）
   */
  async deleteTaskHistory(taskId: string): Promise<{ count: number }> {
    const result = await prisma.taskHistory.deleteMany({
      where: { taskId },
    });

    return { count: result.count };
  }

  /**
   * 清理过期的历史记录（超过90天的记录）
   */
  async cleanupOldHistory(): Promise<{ count: number }> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.taskHistory.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    return { count: result.count };
  }

  /**
   * 辅助方法：计算任务字段变更
   * 用于对比新旧值，记录具体变更字段
   */
  detectChanges(
    oldTask: Record<string, any>,
    newTask: Record<string, any>
  ): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    // 需要追踪的字段列表
    const trackedFields = [
      'title',
      'description',
      'status',
      'priority',
      'dueDate',
      'assignees',
      'color',
      'parentId',
      'acceptanceCriteria',
      'estimatedEffort',
      'loggedTime',
      'boardId',
    ];

    for (const field of trackedFields) {
      const oldValue = oldTask[field];
      const newValue = newTask[field];

      // 简单的值比较（数组和对象需要特殊处理）
      let isChanged = false;

      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        // 数组比较（如 assignees）
        isChanged = JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort());
      } else if (oldValue instanceof Date && newValue instanceof Date) {
        // 日期比较
        isChanged = oldValue.getTime() !== newValue.getTime();
      } else {
        // 普通值比较
        isChanged = oldValue !== newValue;
      }

      if (isChanged) {
        changes.push({
          field,
          oldValue,
          newValue,
        });
      }
    }

    return changes;
  }

  /**
   * 辅助方法：将 Prisma 模型转换为 DTO
   */
  private mapToDTO(history: TaskHistory & { user?: { id: string; username: string } }): TaskHistoryDTO {
    return {
      id: history.id,
      taskId: history.taskId,
      userId: history.userId,
      userName: history.user?.username,
      action: history.action as TaskHistoryAction,
      field: history.field || undefined,
      oldValue: history.oldValue || undefined,
      newValue: history.newValue || undefined,
      changes: history.changes ? (history.changes as Record<string, any>) : undefined,
      createdAt: history.createdAt,
    };
  }
}

// 导出单例
export const taskHistoryService = new TaskHistoryService();
