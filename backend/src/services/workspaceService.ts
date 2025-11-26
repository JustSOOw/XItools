/**
 * 工作区管理服务
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  workspaceSchema,
  workspaceUpdateSchema,
  type WorkspaceInput,
  type WorkspaceUpdate,
} from '../types/multiBoardSchema';

const prisma = new PrismaClient();

export class WorkspaceService {
  /**
   * 获取所有工作区
   */
  async getAllWorkspaces() {
    return await prisma.workspace.findMany({
      include: {
        projects: {
          orderBy: { order: 'asc' },
          include: {
            boards: {
              orderBy: { order: 'asc' },
            },
          },
        },
        boards: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { isDefault: 'desc' }, // 默认工作区排在前面
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * 获取指定用户的所有工作区（包括个人工作区和团队工作区）
   */
  async getWorkspacesByUser(userId: string) {
    return await prisma.workspace.findMany({
      where: {
        OR: [
          // 个人工作区：用户拥有的非团队工作区
          {
            ownerId: userId,
            teamId: null,
          },
          // 团队工作区：用户是团队成员的工作区
          {
            team: {
              members: {
                some: {
                  userId: userId,
                },
              },
            },
          },
        ],
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true,
          },
        },
        projects: {
          orderBy: { order: 'asc' },
          include: {
            boards: {
              orderBy: { order: 'asc' },
            },
          },
        },
        boards: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { isDefault: 'desc' }, // 默认工作区排在前面
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * 根据ID获取工作区
   */
  async getWorkspaceById(id: string) {
    return await prisma.workspace.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { order: 'asc' },
          include: {
            boards: {
              orderBy: { order: 'asc' },
            },
          },
        },
        boards: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * 获取默认工作区
   */
  async getDefaultWorkspace() {
    return await prisma.workspace.findFirst({
      where: { isDefault: true },
      include: {
        projects: {
          orderBy: { order: 'asc' },
          include: {
            boards: {
              orderBy: { order: 'asc' },
            },
          },
        },
        boards: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * 获取指定用户的默认工作区
   */
  async getDefaultWorkspaceForUser(userId: string) {
    return await prisma.workspace.findFirst({
      where: {
        ownerId: userId,
        isDefault: true,
      },
      include: {
        projects: {
          orderBy: { order: 'asc' },
          include: {
            boards: {
              orderBy: { order: 'asc' },
            },
          },
        },
        boards: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * 创建工作区
   */
  async createWorkspace(data: WorkspaceInput, userId: string) {
    // 验证数据
    const validatedData = workspaceSchema.parse(data);

    // 从请求数据中获取 teamId（如果有）
    const teamId = validatedData.teamId;

    // 检查名称是否重复（区分个人工作区和团队工作区）
    await this.checkWorkspaceNameDuplicate(validatedData.name, userId, teamId);

    // 如果设置为默认工作区，先取消该用户其他工作区的默认状态
    if (validatedData.isDefault) {
      await prisma.workspace.updateMany({
        where: {
          ownerId: userId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return await prisma.workspace.create({
      data: {
        ...validatedData,
        ownerId: userId,
      },
      include: {
        projects: true,
        boards: true,
      },
    });
  }

  /**
   * 更新工作区
   */
  async updateWorkspace(id: string, data: WorkspaceUpdate) {
    // 验证数据
    const validatedData = workspaceUpdateSchema.parse(data);

    // 如果更新名称，检查是否重复
    if (validatedData.name) {
      const workspace = await prisma.workspace.findUnique({
        where: { id },
      });
      if (workspace) {
        await this.checkWorkspaceNameDuplicate(
          validatedData.name,
          workspace.ownerId,
          workspace.teamId || undefined,
          id,
        );
      }
    }

    // 如果设置为默认工作区，先取消其他工作区的默认状态
    if (validatedData.isDefault) {
      await prisma.workspace.updateMany({
        where: {
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    return await prisma.workspace.update({
      where: { id },
      data: validatedData,
      include: {
        projects: {
          orderBy: { order: 'asc' },
        },
        boards: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * 删除工作区
   */
  async deleteWorkspace(id: string) {
    // 检查是否为默认工作区
    const workspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new Error('工作区不存在');
    }

    if (workspace.isDefault) {
      throw new Error('不能删除默认工作区');
    }

    // 检查是否有项目或看板
    const projectCount = await prisma.project.count({
      where: { workspaceId: id },
    });

    const boardCount = await prisma.board.count({
      where: { workspaceId: id },
    });

    if (projectCount > 0 || boardCount > 0) {
      throw new Error('工作区中还有项目或看板，无法删除');
    }

    return await prisma.workspace.delete({
      where: { id },
    });
  }

  /**
   * 获取工作区统计信息
   */
  async getWorkspaceStats(id: string) {
    const [projectCount, boardCount, taskCount] = await Promise.all([
      prisma.project.count({
        where: { workspaceId: id },
      }),
      prisma.board.count({
        where: { workspaceId: id },
      }),
      prisma.task.count({
        where: {
          board: {
            workspaceId: id,
          },
        },
      }),
    ]);

    return {
      projects: projectCount,
      boards: boardCount,
      tasks: taskCount,
    };
  }

  /**
   * 确保存在默认工作区
   */
  async ensureDefaultWorkspace(userId?: string) {
    if (userId) {
      // 为指定用户确保默认工作区
      let defaultWorkspace = await prisma.workspace.findFirst({
        where: {
          ownerId: userId,
          isDefault: true,
        },
      });

      if (!defaultWorkspace) {
        defaultWorkspace = await prisma.workspace.create({
          data: {
            name: '我的工作区',
            description: '默认工作区',
            isDefault: true,
            ownerId: userId,
          },
        });
      }

      return defaultWorkspace;
    } else {
      // 系统级默认工作区需要一个默认用户ID
      // 首先尝试获取系统中的第一个用户作为默认所有者
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' },
      });

      if (!firstUser) {
        throw new Error('系统中没有用户，无法创建默认工作区');
      }

      let defaultWorkspace = await prisma.workspace.findFirst({
        where: { isDefault: true },
      });

      if (!defaultWorkspace) {
        defaultWorkspace = await prisma.workspace.create({
          data: {
            name: '默认工作区',
            description: '系统默认工作区',
            isDefault: true,
            ownerId: firstUser.id,
          },
        });
      }

      return defaultWorkspace;
    }
  }

  /**
   * 初始化默认数据
   */
  async initializeDefaultData(userId: string) {
    const defaultWorkspace = await this.ensureDefaultWorkspace(userId);

    // 检查是否需要创建默认看板
    const boardCount = await prisma.board.count({
      where: { workspaceId: defaultWorkspace.id },
    });

    if (boardCount === 0) {
      // 创建默认看板
      const defaultBoard = await prisma.board.create({
        data: {
          name: '我的看板',
          description: '默认看板',
          workspaceId: defaultWorkspace.id,
          ownerId: userId,
          order: 0,
        },
      });

      // 创建默认列
      const defaultColumns = [
        { name: '待办', order: 0, isDefault: true },
        { name: '进行中', order: 1, isDefault: true },
        { name: '已完成', order: 2, isDefault: true },
      ];

      for (const column of defaultColumns) {
        await prisma.boardColumn.create({
          data: {
            ...column,
            boardId: defaultBoard.id,
          },
        });
      }

      console.log('✅ 初始化默认数据完成');
    }

    return defaultWorkspace;
  }

  /**
   * 检查工作区名称是否重复
   * @param name 工作区名称
   * @param userId 用户ID
   * @param teamId 团队ID（可选，用于区分个人/团队工作区）
   * @param excludeId 排除的工作区ID（用于更新时排除自身）
   */
  private async checkWorkspaceNameDuplicate(
    name: string,
    userId: string,
    teamId?: string,
    excludeId?: string,
  ) {
    const whereClause: {
      name: string;
      id?: { not: string };
      ownerId?: string;
      teamId?: string | null;
    } = {
      name,
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    if (teamId) {
      // 团队工作区：检查同一团队内是否有同名工作区
      whereClause.teamId = teamId;
    } else {
      // 个人工作区：检查同一用户的个人工作区内是否有同名
      whereClause.ownerId = userId;
      whereClause.teamId = null;
    }

    const existingWorkspace = await prisma.workspace.findFirst({
      where: whereClause,
    });

    if (existingWorkspace) {
      const scopeDesc = teamId ? '该团队' : '您的个人工作区';
      throw new Error(`${scopeDesc}中已存在名为"${name}"的工作区`);
    }
  }
}

export const workspaceService = new WorkspaceService();
