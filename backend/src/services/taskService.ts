/**
 * 任务管理服务 - 支持多看板
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  extendedTaskSchema,
  extendedTaskUpdateSchema,
  type ExtendedTaskInput,
  type ExtendedTaskUpdate,
} from '../types/multiBoardSchema';

const prisma = new PrismaClient();

export class TaskService {
  /**
   * 获取指定看板的所有任务
   */
  async getTasksByBoard(boardId: string) {
    return await prisma.task.findMany({
      where: { boardId },
      include: {
        tags: true,
        parent: true,
        subTasks: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 获取指定项目的所有任务
   */
  async getTasksByProject(projectId: string) {
    return await prisma.task.findMany({
      where: {
        board: {
          projectId,
        },
      },
      include: {
        tags: true,
        parent: true,
        subTasks: true,
        board: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 获取指定工作区的所有任务
   */
  async getTasksByWorkspace(workspaceId: string) {
    return await prisma.task.findMany({
      where: {
        board: {
          workspaceId,
        },
      },
      include: {
        tags: true,
        parent: true,
        subTasks: true,
        board: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 根据ID获取任务
   */
  async getTaskById(id: string) {
    return await prisma.task.findUnique({
      where: { id },
      include: {
        tags: true,
        parent: true,
        subTasks: true,
        board: {
          include: {
            workspace: true,
            project: {
              include: {
                workspace: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 创建任务
   */
  async createTask(data: ExtendedTaskInput, userId: string) {
    // 验证数据
    const validatedData = extendedTaskSchema.parse(data);

    // 检查看板是否存在
    const board = await prisma.board.findUnique({
      where: { id: validatedData.boardId },
    });

    if (!board) {
      throw new Error('看板不存在');
    }

    // 检查状态列是否属于该看板
    const column = await prisma.boardColumn.findFirst({
      where: {
        id: validatedData.status,
        boardId: validatedData.boardId,
      },
    });

    if (!column) {
      throw new Error('状态列不属于指定看板');
    }

    // 处理标签
    let tagsConnect = undefined;
    if (validatedData.tags && validatedData.tags.length > 0) {
      tagsConnect = {
        connectOrCreate: validatedData.tags.map((tagName: string) => ({
          where: {
            ownerId_name: {
              ownerId: userId,
              name: tagName,
            },
          },
          create: {
            name: tagName,
            ownerId: userId,
          },
        })),
      };
    }

    // 如果没有指定sortOrder，设置为该列的最大值+1
    if (validatedData.sortOrder === undefined || validatedData.sortOrder === 0) {
      const maxSortOrder = await prisma.task.aggregate({
        where: {
          boardId: validatedData.boardId,
          status: validatedData.status,
        },
        _max: { sortOrder: true },
      });
      validatedData.sortOrder = (maxSortOrder._max.sortOrder || 0) + 1;
    }

    const { tags, ...taskData } = validatedData;

    return await prisma.task.create({
      data: {
        ...taskData,
        ownerId: userId,
        tags: tagsConnect,
      },
      include: {
        tags: true,
        parent: true,
        subTasks: true,
        board: true,
      },
    });
  }

  /**
   * 批量创建任务
   */
  async createTasks(tasks: ExtendedTaskInput[], userId: string) {
    const createdTasks: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const taskData of tasks) {
        // 验证数据
        const validatedData = extendedTaskSchema.parse(taskData);

        // 检查看板是否存在
        const board = await tx.board.findUnique({
          where: { id: validatedData.boardId },
        });

        if (!board) {
          throw new Error(`看板 ${validatedData.boardId} 不存在`);
        }

        // 检查状态列是否属于该看板
        const column = await tx.boardColumn.findFirst({
          where: {
            id: validatedData.status,
            boardId: validatedData.boardId,
          },
        });

        if (!column) {
          throw new Error(`状态列 ${validatedData.status} 不属于看板 ${validatedData.boardId}`);
        }

        // 处理标签
        let tagsConnect = undefined;
        if (validatedData.tags && validatedData.tags.length > 0) {
          tagsConnect = {
            connectOrCreate: validatedData.tags.map((tagName: string) => ({
              where: {
                ownerId_name: {
                  ownerId: userId,
                  name: tagName,
                },
              },
              create: {
                name: tagName,
                ownerId: userId,
              },
            })),
          };
        }

        // 设置sortOrder
        if (validatedData.sortOrder === undefined || validatedData.sortOrder === 0) {
          const maxSortOrder = await tx.task.aggregate({
            where: {
              boardId: validatedData.boardId,
              status: validatedData.status,
            },
            _max: { sortOrder: true },
          });
          validatedData.sortOrder = (maxSortOrder._max.sortOrder || 0) + 1;
        }

        const { tags, ...taskCreateData } = validatedData;

        const task = await tx.task.create({
          data: {
            ...taskCreateData,
            ownerId: userId,
            tags: tagsConnect,
          },
          include: {
            tags: true,
          },
        });

        createdTasks.push(task);
      }
    });

    return createdTasks;
  }

  /**
   * 更新任务
   */
  async updateTask(id: string, data: ExtendedTaskUpdate, userId: string) {
    // 验证数据
    const validatedData = extendedTaskUpdateSchema.parse(data);

    // 如果更新了boardId，需要验证新看板
    if (validatedData.boardId) {
      const board = await prisma.board.findUnique({
        where: { id: validatedData.boardId },
      });

      if (!board) {
        throw new Error('目标看板不存在');
      }
    }

    // 如果更新了status，需要验证状态列
    if (validatedData.status) {
      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        throw new Error('任务不存在');
      }

      const targetBoardId = validatedData.boardId || task.boardId;

      const column = await prisma.boardColumn.findFirst({
        where: {
          id: validatedData.status,
          boardId: targetBoardId,
        },
      });

      if (!column) {
        throw new Error('状态列不属于目标看板');
      }
    }

    // 处理标签更新
    let tagsUpdate = undefined;
    if (validatedData.tags && Array.isArray(validatedData.tags)) {
      tagsUpdate = {
        set: [], // 先清空现有标签
        connectOrCreate: validatedData.tags.map((tagName: string) => ({
          where: {
            ownerId_name: {
              ownerId: userId,
              name: tagName,
            },
          },
          create: {
            name: tagName,
            ownerId: userId,
          },
        })),
      };
    }

    const { tags, ...otherUpdates } = validatedData;

    return await prisma.task.update({
      where: { id },
      data: {
        ...otherUpdates,
        updatedAt: new Date(),
        tags: tagsUpdate,
      },
      include: {
        tags: true,
        parent: true,
        subTasks: true,
        board: true,
      },
    });
  }

  /**
   * 删除任务
   */
  async deleteTask(id: string) {
    // 检查是否有子任务
    const subTaskCount = await prisma.task.count({
      where: { parentId: id },
    });

    if (subTaskCount > 0) {
      throw new Error('该任务有子任务，请先删除子任务');
    }

    return await prisma.task.delete({
      where: { id },
    });
  }

  /**
   * 分配任务给用户（添加负责人）
   * @param taskId 任务ID
   * @param userIds 要添加的用户ID数组
   * @returns 更新后的任务
   */
  async assignTask(taskId: string, userIds: string[]) {
    // 获取当前任务
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { assignees: true },
    });

    if (!task) {
      throw new Error('任务不存在');
    }

    // 合并现有负责人和新负责人，去重
    const currentAssignees = task.assignees || [];
    const newAssignees = [...new Set([...currentAssignees, ...userIds])];

    // 更新任务
    return await prisma.task.update({
      where: { id: taskId },
      data: {
        assignees: newAssignees,
        updatedAt: new Date(),
      },
      include: {
        tags: true,
        parent: true,
        subTasks: true,
        board: true,
      },
    });
  }

  /**
   * 取消任务分配（移除负责人）
   * @param taskId 任务ID
   * @param userIds 要移除的用户ID数组
   * @returns 更新后的任务
   */
  async unassignTask(taskId: string, userIds: string[]) {
    // 获取当前任务
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { assignees: true },
    });

    if (!task) {
      throw new Error('任务不存在');
    }

    // 从现有负责人中移除指定用户
    const currentAssignees = task.assignees || [];
    const newAssignees = currentAssignees.filter((id) => !userIds.includes(id));

    // 更新任务
    return await prisma.task.update({
      where: { id: taskId },
      data: {
        assignees: newAssignees,
        updatedAt: new Date(),
      },
      include: {
        tags: true,
        parent: true,
        subTasks: true,
        board: true,
      },
    });
  }

  /**
   * 验证用户是否为团队成员
   * @param userIds 用户ID数组
   * @param boardId 看板ID
   * @returns 验证结果
   */
  async validateTeamMembers(userIds: string[], boardId: string): Promise<boolean> {
    // 获取看板所属的团队
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new Error('看板不存在');
    }

    // 如果看板不属于团队（个人工作区），返回 true（不需要验证）
    if (!board.workspace?.team) {
      return true;
    }

    // 获取团队成员ID列表
    const teamMemberIds = board.workspace.team.members.map((member) => member.userId);

    // 检查所有用户是否都是团队成员
    return userIds.every((userId) => teamMemberIds.includes(userId));
  }

  // 移除跨看板移动功能 - 任务只能在同一看板内的列之间移动
  // 这保持了看板的独立性和数据安全性
}

export const taskService = new TaskService();
