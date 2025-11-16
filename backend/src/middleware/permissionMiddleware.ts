/**
 * 权限认证中间件
 *
 * 提供项目权限验证功能
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { permissionService } from '../services/permissionService';
import { ProjectPermissionType } from '../types/teamTypes';
import { prisma } from '../lib/prisma';

/**
 * 中间件参数类型定义
 */
interface ProjectPermissionParams {
  Params: {
    id?: string;
    projectId?: string;
    boardId?: string;
    taskId?: string;
  };
}

/**
 * 从请求中获取项目ID
 * 支持从 id, projectId, boardId, taskId 等参数推导
 */
async function getProjectIdFromRequest(
  request: FastifyRequest<ProjectPermissionParams>
): Promise<string | null> {
  const { id, projectId, boardId, taskId } = request.params;

  // 直接从 id 或 projectId 获取
  if (id) {
    return id;
  }

  if (projectId) {
    return projectId;
  }

  // 从 boardId 推导
  if (boardId) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { projectId: true },
    });
    return board?.projectId || null;
  }

  // 从 taskId 推导
  if (taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: {
          select: { projectId: true },
        },
      },
    });
    return task?.board.projectId || null;
  }

  return null;
}

/**
 * 创建权限检查中间件
 * @param requiredPermission 所需权限类型
 */
function createPermissionMiddleware(requiredPermission: ProjectPermissionType) {
  return async (
    request: FastifyRequest<ProjectPermissionParams>,
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: '未认证',
        });
      }

      // 获取项目ID
      const projectId = await getProjectIdFromRequest(request);

      if (!projectId) {
        return reply.status(400).send({
          success: false,
          error: '无法确定项目ID',
        });
      }

      // 检查权限
      const hasPermission = await permissionService.checkProjectPermission(
        userId,
        projectId,
        requiredPermission
      );

      if (!hasPermission) {
        const permissionName = requiredPermission === ProjectPermissionType.VIEW
          ? '查看'
          : '编辑';

        return reply.status(403).send({
          success: false,
          error: `您没有${permissionName}该项目的权限`,
        });
      }

      // 将项目ID添加到请求上下文中，方便后续使用
      (request as any).projectId = projectId;

      // 通过验证，继续处理请求
    } catch (error) {
      console.error('权限验证错误:', error);
      return reply.status(500).send({
        success: false,
        error: '权限验证失败',
      });
    }
  };
}

/**
 * 要求编辑权限
 * 使用方法: preHandler: [authMiddleware, requireProjectEdit]
 */
export const requireProjectEdit = createPermissionMiddleware(ProjectPermissionType.EDIT);

/**
 * 要求查看权限
 * 使用方法: preHandler: [authMiddleware, requireProjectView]
 */
export const requireProjectView = createPermissionMiddleware(ProjectPermissionType.VIEW);

/**
 * 要求特定项目权限(通用版本)
 * @param permission 权限类型
 */
export function requireProjectPermission(permission: ProjectPermissionType) {
  return createPermissionMiddleware(permission);
}

/**
 * 检查用户是否为团队所有者(通过项目ID)
 * 使用方法: preHandler: [authMiddleware, requireTeamOwnerByProject]
 */
export async function requireTeamOwnerByProject(
  request: FastifyRequest<ProjectPermissionParams>,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: '未认证',
      });
    }

    // 获取项目ID
    const projectId = await getProjectIdFromRequest(request);

    if (!projectId) {
      return reply.status(400).send({
        success: false,
        error: '无法确定项目ID',
      });
    }

    // 检查是否为团队所有者
    const isOwner = await permissionService.isTeamOwner(userId, projectId);

    if (!isOwner) {
      return reply.status(403).send({
        success: false,
        error: '只有团队所有者可以执行此操作',
      });
    }

    // 将项目ID添加到请求上下文中
    (request as any).projectId = projectId;

    // 通过验证，继续处理请求
  } catch (error) {
    console.error('团队所有者验证错误:', error);
    return reply.status(500).send({
      success: false,
      error: '权限验证失败',
    });
  }
}

/**
 * 创建所有权或权限验证的组合中间件
 * 先检查个人所有权，如果不是则检查团队权限
 * @param requiredPermission 所需权限类型
 */
export function createOwnershipOrPermissionVerifier(requiredPermission: ProjectPermissionType) {
  return async (
    request: FastifyRequest<ProjectPermissionParams>,
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user?.userId;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: '未认证',
        });
      }

      // 获取项目ID
      const projectId = await getProjectIdFromRequest(request);

      if (!projectId) {
        return reply.status(400).send({
          success: false,
          error: '无法确定项目ID',
        });
      }

      // 首先检查是否为项目所有者
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });

      if (project?.ownerId === userId) {
        // 是项目所有者，直接通过
        (request as any).projectId = projectId;
        return;
      }

      // 不是项目所有者，检查团队权限
      const hasPermission = await permissionService.checkProjectPermission(
        userId,
        projectId,
        requiredPermission
      );

      if (!hasPermission) {
        const permissionName = requiredPermission === ProjectPermissionType.VIEW
          ? '查看'
          : '编辑';

        return reply.status(403).send({
          success: false,
          error: `您没有${permissionName}该项目的权限`,
        });
      }

      // 将项目ID添加到请求上下文中
      (request as any).projectId = projectId;

      // 通过验证，继续处理请求
    } catch (error) {
      console.error('所有权或权限验证错误:', error);
      return reply.status(500).send({
        success: false,
        error: '权限验证失败',
      });
    }
  };
}

/**
 * 要求项目管理员权限（项目所有者或团队所有者）
 * 使用方法: preHandler: [authMiddleware, requireProjectAdmin]
 */
export async function requireProjectAdmin(
  request: FastifyRequest<ProjectPermissionParams>,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: '未认证',
      });
    }

    // 获取项目ID
    const projectId = await getProjectIdFromRequest(request);

    if (!projectId) {
      return reply.status(400).send({
        success: false,
        error: '无法确定项目ID',
      });
    }

    // 检查是否为项目所有者或团队所有者
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({
        success: false,
        error: '项目不存在',
      });
    }

    // 检查是否为项目所有者
    if (project.ownerId === userId) {
      (request as any).projectId = projectId;
      return;
    }

    // 检查是否为团队所有者
    if (project.workspace?.team?.ownerId === userId) {
      (request as any).projectId = projectId;
      return;
    }

    return reply.status(403).send({
      success: false,
      error: '只有项目管理员可以执行此操作',
    });
  } catch (error) {
    console.error('项目管理员验证错误:', error);
    return reply.status(500).send({
      success: false,
      error: '权限验证失败',
    });
  }
}
