/**
 * 看板管理服务
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { boardSchema, boardUpdateSchema, type BoardInput, type BoardUpdate } from '../types/multiBoardSchema';

const prisma = new PrismaClient();

export class BoardService {
  /**
   * 获取工作区下的所有看板
   */
  async getBoardsByWorkspace(workspaceId: string) {
    return await prisma.board.findMany({
      where: { workspaceId },
      include: {
        columns: {
          orderBy: { order: 'asc' }
        },
        tasks: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
  }

  /**
   * 获取项目下的所有看板
   */
  async getBoardsByProject(projectId: string) {
    return await prisma.board.findMany({
      where: { projectId },
      include: {
        columns: {
          orderBy: { order: 'asc' }
        },
        tasks: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
  }

  /**
   * 根据ID获取看板
   */
  async getBoardById(id: string) {
    return await prisma.board.findUnique({
      where: { id },
      include: {
        workspace: true,
        project: {
          include: {
            workspace: true
          }
        },
        columns: {
          orderBy: { order: 'asc' }
        },
        tasks: {
          orderBy: { sortOrder: 'asc' },
          include: {
            tags: true
          }
        }
      }
    });
  }

  /**
   * 创建看板
   */
  async createBoard(data: BoardInput, userId: string) {
    // 验证数据
    const validatedData = boardSchema.parse(data);
    
    // 检查父级容器是否存在
    if (validatedData.workspaceId) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: validatedData.workspaceId }
      });
      if (!workspace) {
        throw new Error('工作区不存在');
      }
    }

    if (validatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId }
      });
      if (!project) {
        throw new Error('项目不存在');
      }
    }

    // 如果没有指定order，设置为最大值+1
    if (validatedData.order === undefined || validatedData.order === 0) {
      const whereClause = validatedData.workspaceId 
        ? { workspaceId: validatedData.workspaceId }
        : { projectId: validatedData.projectId };

      const maxOrder = await prisma.board.aggregate({
        where: whereClause,
        _max: { order: true }
      });
      validatedData.order = (maxOrder._max.order || 0) + 1;
    }

    const newBoard = await prisma.board.create({
      data: {
        ...validatedData,
        ownerId: userId
      },
      include: {
        workspace: true,
        project: true
      }
    });

    // 创建默认列
    await this.createDefaultColumns(newBoard.id);

    return await this.getBoardById(newBoard.id);
  }

  /**
   * 更新看板
   */
  async updateBoard(id: string, data: BoardUpdate) {
    // 验证数据
    const validatedData = boardUpdateSchema.parse(data);

    return await prisma.board.update({
      where: { id },
      data: validatedData,
      include: {
        workspace: true,
        project: true,
        columns: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  /**
   * 删除看板
   */
  async deleteBoard(id: string) {
    // 检查是否有任务
    const taskCount = await prisma.task.count({
      where: { boardId: id }
    });

    if (taskCount > 0) {
      throw new Error('看板中还有任务，无法删除');
    }

    return await prisma.board.delete({
      where: { id }
    });
  }

  /**
   * 移动看板
   */
  async moveBoard(id: string, targetWorkspaceId?: string, targetProjectId?: string, userId?: string) {
    // 验证目标容器
    if (targetWorkspaceId && targetProjectId) {
      throw new Error('看板不能同时属于工作区和项目');
    }

    if (!targetWorkspaceId && !targetProjectId) {
      throw new Error('必须指定目标工作区或项目');
    }

    if (targetWorkspaceId) {
      const whereClause = userId
        ? { id: targetWorkspaceId, ownerId: userId }
        : { id: targetWorkspaceId };

      const workspace = await prisma.workspace.findFirst({
        where: whereClause
      });
      if (!workspace) {
        throw new Error(userId ? '目标工作区不存在或无权限访问' : '目标工作区不存在');
      }
    }

    if (targetProjectId) {
      const whereClause = userId
        ? { id: targetProjectId, ownerId: userId }
        : { id: targetProjectId };

      const project = await prisma.project.findFirst({
        where: whereClause
      });
      if (!project) {
        throw new Error(userId ? '目标项目不存在或无权限访问' : '目标项目不存在');
      }
    }

    // 获取目标容器中的最大order值
    const whereClause = targetWorkspaceId 
      ? { workspaceId: targetWorkspaceId }
      : { projectId: targetProjectId };

    const maxOrder = await prisma.board.aggregate({
      where: whereClause,
      _max: { order: true }
    });

    return await prisma.board.update({
      where: { id },
      data: {
        workspaceId: targetWorkspaceId || null,
        projectId: targetProjectId || null,
        order: (maxOrder._max.order || 0) + 1
      },
      include: {
        workspace: true,
        project: true
      }
    });
  }

  /**
   * 重新排序看板
   */
  async reorderBoards(containerId: string, boardIds: string[], containerType: 'workspace' | 'project') {
    // 验证所有看板都属于指定容器
    const whereClause = containerType === 'workspace' 
      ? { workspaceId: containerId }
      : { projectId: containerId };

    const boards = await prisma.board.findMany({
      where: {
        id: { in: boardIds },
        ...whereClause
      }
    });

    if (boards.length !== boardIds.length) {
      throw new Error('部分看板不属于指定容器');
    }

    // 批量更新排序
    const updatePromises = boardIds.map((boardId, index) =>
      prisma.board.update({
        where: { id: boardId },
        data: { order: index }
      })
    );

    await Promise.all(updatePromises);

    return containerType === 'workspace' 
      ? await this.getBoardsByWorkspace(containerId)
      : await this.getBoardsByProject(containerId);
  }

  /**
   * 复制看板
   */
  async duplicateBoard(id: string, userId: string, newName?: string, targetWorkspaceId?: string, targetProjectId?: string) {
    const originalBoard = await this.getBoardById(id);
    
    if (!originalBoard) {
      throw new Error('看板不存在');
    }

    // 如果没有指定目标，使用原看板的位置
    const finalWorkspaceId = targetWorkspaceId || originalBoard.workspaceId;
    const finalProjectId = targetProjectId || originalBoard.projectId;

    // 创建新看板
    const newBoard = await this.createBoard({
      name: newName || `${originalBoard.name} (副本)`,
      description: originalBoard.description,
      color: originalBoard.color,
      icon: originalBoard.icon,
      workspaceId: finalWorkspaceId,
      projectId: finalProjectId
    }, userId);

    // 复制列
    for (const column of originalBoard.columns) {
      await prisma.boardColumn.create({
        data: {
          name: column.name,
          order: column.order,
          color: column.color,
          sortOption: column.sortOption,
          isDefault: column.isDefault,
          boardId: newBoard.id
        }
      });
    }

    return await this.getBoardById(newBoard.id);
  }

  /**
   * 创建默认列
   */
  private async createDefaultColumns(boardId: string) {
    const defaultColumns = [
      { name: '待办', order: 0, isDefault: true },
      { name: '进行中', order: 1, isDefault: true },
      { name: '已完成', order: 2, isDefault: true }
    ];

    for (const column of defaultColumns) {
      await prisma.boardColumn.create({
        data: {
          ...column,
          boardId
        }
      });
    }
  }

  /**
   * 获取看板统计信息
   */
  async getBoardStats(id: string) {
    const [columnCount, taskCount, completedTaskCount] = await Promise.all([
      prisma.boardColumn.count({
        where: { boardId: id }
      }),
      prisma.task.count({
        where: { boardId: id }
      }),
      prisma.task.count({
        where: {
          boardId: id,
          status: {
            in: await this.getCompletedStatusIds(id)
          }
        }
      })
    ]);

    return {
      columns: columnCount,
      tasks: taskCount,
      completedTasks: completedTaskCount,
      progress: taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0
    };
  }

  /**
   * 获取看板中已完成状态的列ID
   */
  private async getCompletedStatusIds(boardId: string): Promise<string[]> {
    const completedColumns = await prisma.boardColumn.findMany({
      where: {
        boardId,
        OR: [
          { name: { contains: '完成', mode: 'insensitive' } },
          { name: { contains: 'done', mode: 'insensitive' } },
          { name: { contains: 'completed', mode: 'insensitive' } }
        ]
      },
      select: { id: true }
    });

    return completedColumns.map(col => col.id);
  }
}

export const boardService = new BoardService();
