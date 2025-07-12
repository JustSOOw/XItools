/**
 * 项目管理服务
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  projectSchema,
  projectUpdateSchema,
  type ProjectInput,
  type ProjectUpdate,
} from '../types/multiBoardSchema';

const prisma = new PrismaClient();

export class ProjectService {
  /**
   * 获取工作区下的所有项目
   */
  async getProjectsByWorkspace(workspaceId: string) {
    return await prisma.project.findMany({
      where: { workspaceId },
      include: {
        boards: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * 根据ID获取项目
   */
  async getProjectById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        workspace: true,
        boards: {
          orderBy: { order: 'asc' },
          include: {
            columns: {
              orderBy: { order: 'asc' },
            },
            tasks: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  /**
   * 创建项目
   */
  async createProject(data: ProjectInput, userId: string) {
    // 验证数据
    const validatedData = projectSchema.parse(data);

    // 检查工作区是否存在且用户有权限
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: validatedData.workspaceId,
        ownerId: userId,
      },
    });

    if (!workspace) {
      throw new Error('工作区不存在或无权限访问');
    }

    // 如果没有指定order，设置为最大值+1
    if (validatedData.order === undefined || validatedData.order === 0) {
      const maxOrder = await prisma.project.aggregate({
        where: { workspaceId: validatedData.workspaceId },
        _max: { order: true },
      });
      validatedData.order = (maxOrder._max.order || 0) + 1;
    }

    return await prisma.project.create({
      data: {
        ...validatedData,
        ownerId: userId,
      },
      include: {
        workspace: true,
        boards: true,
      },
    });
  }

  /**
   * 更新项目
   */
  async updateProject(id: string, data: ProjectUpdate) {
    // 验证数据
    const validatedData = projectUpdateSchema.parse(data);

    return await prisma.project.update({
      where: { id },
      data: validatedData,
      include: {
        workspace: true,
        boards: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * 删除项目
   */
  async deleteProject(id: string) {
    // 检查是否有看板
    const boardCount = await prisma.board.count({
      where: { projectId: id },
    });

    if (boardCount > 0) {
      throw new Error('项目中还有看板，无法删除');
    }

    return await prisma.project.delete({
      where: { id },
    });
  }

  /**
   * 重新排序项目
   */
  async reorderProjects(workspaceId: string, projectIds: string[]) {
    // 验证所有项目都属于指定工作区
    const projects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        workspaceId,
      },
    });

    if (projects.length !== projectIds.length) {
      throw new Error('部分项目不属于指定工作区');
    }

    // 批量更新排序
    const updatePromises = projectIds.map((projectId, index) =>
      prisma.project.update({
        where: { id: projectId },
        data: { order: index },
      }),
    );

    await Promise.all(updatePromises);

    return await this.getProjectsByWorkspace(workspaceId);
  }

  /**
   * 移动项目到其他工作区
   */
  async moveProject(id: string, targetWorkspaceId: string, userId: string) {
    // 检查目标工作区是否存在且用户有权限
    const targetWorkspace = await prisma.workspace.findFirst({
      where: {
        id: targetWorkspaceId,
        ownerId: userId,
      },
    });

    if (!targetWorkspace) {
      throw new Error('目标工作区不存在或无权限访问');
    }

    // 获取目标工作区中的最大order值
    const maxOrder = await prisma.project.aggregate({
      where: { workspaceId: targetWorkspaceId },
      _max: { order: true },
    });

    return await prisma.project.update({
      where: { id },
      data: {
        workspaceId: targetWorkspaceId,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        workspace: true,
        boards: true,
      },
    });
  }

  /**
   * 获取项目统计信息
   */
  async getProjectStats(id: string) {
    const [boardCount, taskCount, completedTaskCount] = await Promise.all([
      prisma.board.count({
        where: { projectId: id },
      }),
      prisma.task.count({
        where: {
          board: {
            projectId: id,
          },
        },
      }),
      prisma.task.count({
        where: {
          board: {
            projectId: id,
          },
          status: {
            in: await this.getCompletedStatusIds(id),
          },
        },
      }),
    ]);

    return {
      boards: boardCount,
      tasks: taskCount,
      completedTasks: completedTaskCount,
      progress: taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0,
    };
  }

  /**
   * 获取项目中已完成状态的列ID
   */
  private async getCompletedStatusIds(projectId: string): Promise<string[]> {
    const completedColumns = await prisma.boardColumn.findMany({
      where: {
        board: {
          projectId,
        },
        OR: [
          { name: { contains: '完成', mode: 'insensitive' } },
          { name: { contains: 'done', mode: 'insensitive' } },
          { name: { contains: 'completed', mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });

    return completedColumns.map((col) => col.id);
  }

  /**
   * 复制项目
   */
  async duplicateProject(id: string, newName?: string, userId?: string) {
    const originalProject = await this.getProjectById(id);

    if (!originalProject) {
      throw new Error('项目不存在');
    }

    // 创建新项目
    const newProject = await this.createProject(
      {
        name: newName || `${originalProject.name} (副本)`,
        description: originalProject.description,
        color: originalProject.color,
        icon: originalProject.icon,
        workspaceId: originalProject.workspaceId,
      },
      userId!,
    );

    // 复制看板
    for (const board of originalProject.boards) {
      const newBoard = await prisma.board.create({
        data: {
          name: board.name,
          description: board.description,
          color: board.color,
          icon: board.icon,
          projectId: newProject.id,
          ownerId: userId!,
          order: board.order,
        },
      });

      // 复制列
      for (const column of board.columns) {
        await prisma.boardColumn.create({
          data: {
            name: column.name,
            order: column.order,
            color: column.color,
            sortOption: column.sortOption,
            isDefault: column.isDefault,
            boardId: newBoard.id,
          },
        });
      }
    }

    return await this.getProjectById(newProject.id);
  }
}

export const projectService = new ProjectService();
