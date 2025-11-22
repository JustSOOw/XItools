/**
 * 权限服务
 *
 * 处理项目权限的设置、查询、更新和删除等核心业务逻辑
 */

import { prisma } from '../lib/prisma';
import {
  ProjectPermissionDTO,
  ProjectPermissionType,
  SetProjectPermissionInput,
  UpdateProjectPermissionInput,
  PermissionError,
  PermissionErrorCode,
} from '../types/teamTypes';

/**
 * 权限服务类
 */
export class PermissionService {
  /**
   * 设置项目权限
   * @param projectId 项目ID
   * @param memberId 成员ID (TeamMember.id)
   * @param permission 权限类型
   * @param grantedBy 授权者ID (User.id)
   */
  async setProjectPermission(
    projectId: string,
    memberId: string,
    permission: ProjectPermissionType,
    grantedBy: string
  ): Promise<ProjectPermissionDTO> {
    // 验证项目是否存在
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
      throw new PermissionError(
        PermissionErrorCode.PERMISSION_DENIED,
        '项目不存在',
        404
      );
    }

    // 验证项目是否属于团队
    if (!project.workspace?.team) {
      throw new PermissionError(
        PermissionErrorCode.PERMISSION_DENIED,
        '该项目不属于任何团队，无需设置权限',
        400
      );
    }

    const teamId = project.workspace.team.id;

    // 验证成员是否存在且属于该团队
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        team: true,
      },
    });

    if (!member || member.teamId !== teamId) {
      throw new PermissionError(
        PermissionErrorCode.PERMISSION_DENIED,
        '成员不存在或不属于该团队',
        400
      );
    }

    // 验证授权者是否为团队所有者
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.ownerId !== grantedBy) {
      throw new PermissionError(
        PermissionErrorCode.PERMISSION_DENIED,
        '只有团队所有者可以设置权限',
        403
      );
    }

    // 检查权限是否已存在
    const existingPermission = await prisma.projectPermission.findUnique({
      where: {
        projectId_memberId: {
          projectId,
          memberId,
        },
      },
    });

    // 如果已存在，则更新
    if (existingPermission) {
      const updatedPermission = await prisma.projectPermission.update({
        where: { id: existingPermission.id },
        data: {
          permission,
          grantedBy,
          grantedAt: new Date(),
        },
      });

      return updatedPermission;
    }

    // 创建新权限
    const newPermission = await prisma.projectPermission.create({
      data: {
        projectId,
        memberId,
        permission,
        grantedBy,
        grantedAt: new Date(),
      },
    });

    return newPermission;
  }

  /**
   * 更新项目权限
   * @param permissionId 权限ID
   * @param permission 新权限类型
   */
  async updateProjectPermission(
    permissionId: string,
    permission: ProjectPermissionType
  ): Promise<ProjectPermissionDTO> {
    // 验证权限是否存在
    const existingPermission = await prisma.projectPermission.findUnique({
      where: { id: permissionId },
    });

    if (!existingPermission) {
      throw new PermissionError(
        PermissionErrorCode.PERMISSION_DENIED,
        '权限不存在',
        404
      );
    }

    // 更新权限
    const updatedPermission = await prisma.projectPermission.update({
      where: { id: permissionId },
      data: {
        permission,
        grantedAt: new Date(),
      },
    });

    return updatedPermission;
  }

  /**
   * 移除项目权限
   * @param permissionId 权限ID
   */
  async removeProjectPermission(permissionId: string): Promise<void> {
    // 验证权限是否存在
    const existingPermission = await prisma.projectPermission.findUnique({
      where: { id: permissionId },
    });

    if (!existingPermission) {
      throw new PermissionError(
        PermissionErrorCode.PERMISSION_DENIED,
        '权限不存在',
        404
      );
    }

    // 删除权限
    await prisma.projectPermission.delete({
      where: { id: permissionId },
    });
  }

  /**
   * 获取项目的所有权限
   * @param projectId 项目ID
   */
  async getProjectPermissions(projectId: string): Promise<ProjectPermissionDTO[]> {
    const permissions = await prisma.projectPermission.findMany({
      where: { projectId },
      include: {
        member: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return permissions.map(p => ({
      id: p.id,
      permission: p.permission as ProjectPermissionType,
      projectId: p.projectId,
      memberId: p.memberId,
      grantedBy: p.grantedBy,
      grantedAt: p.grantedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * 获取成员在所有项目中的权限
   * @param memberId 成员ID (TeamMember.id)
   */
  async getMemberProjectPermissions(memberId: string): Promise<ProjectPermissionDTO[]> {
    const permissions = await prisma.projectPermission.findMany({
      where: { memberId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return permissions.map(p => ({
      id: p.id,
      permission: p.permission as ProjectPermissionType,
      projectId: p.projectId,
      memberId: p.memberId,
      grantedBy: p.grantedBy,
      grantedAt: p.grantedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * 检查用户是否对项目有指定权限
   * @param userId 用户ID
   * @param projectId 项目ID
   * @param requiredPermission 所需权限类型
   * @returns 是否有权限
   */
  async checkProjectPermission(
    userId: string,
    projectId: string,
    requiredPermission: ProjectPermissionType
  ): Promise<boolean> {
    // 获取项目信息
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
      return false;
    }

    // 如果项目属于个人工作区 (ownerId 匹配)
    if (project.ownerId === userId) {
      return true;
    }

    // 如果项目属于团队
    if (project.workspace?.team) {
      const team = project.workspace.team;

      // 如果是团队所有者，拥有所有权限
      if (team.ownerId === userId) {
        return true;
      }

      // 检查用户是否为团队成员
      const member = await prisma.teamMember.findFirst({
        where: {
          userId,
          teamId: team.id,
          status: 'active',
        },
      });

      if (!member) {
        return false;
      }

      // 获取成员对该项目的权限
      const permission = await prisma.projectPermission.findUnique({
        where: {
          projectId_memberId: {
            projectId,
            memberId: member.id,
          },
        },
      });

      if (!permission) {
        return false;
      }

      // 检查权限级别
      if (requiredPermission === ProjectPermissionType.VIEW) {
        // VIEW 权限：拥有 VIEW 或 EDIT 都可以
        return (
          permission.permission === ProjectPermissionType.VIEW ||
          permission.permission === ProjectPermissionType.EDIT
        );
      } else if (requiredPermission === ProjectPermissionType.EDIT) {
        // EDIT 权限：必须拥有 EDIT
        return permission.permission === ProjectPermissionType.EDIT;
      }
    }

    return false;
  }

  /**
   * 为新成员设置默认权限(所有项目的查看权限)
   * @param memberId 成员ID (TeamMember.id)
   * @param permission 默认权限类型
   */
  async setDefaultPermissions(
    memberId: string,
    permission: ProjectPermissionType = ProjectPermissionType.VIEW
  ): Promise<void> {
    // 获取成员信息
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        team: {
          include: {
            workspaces: {
              include: {
                projects: true,
              },
            },
          },
        },
      },
    });

    if (!member || !member.team) {
      throw new PermissionError(
        PermissionErrorCode.PERMISSION_DENIED,
        '成员或团队不存在',
        404
      );
    }

    // 获取团队所有工作区下的所有项目
    const projects = member.team.workspaces.flatMap(workspace => workspace.projects);

    // 为每个项目设置默认权限
    const permissionsToCreate = projects.map(project => ({
      projectId: project.id,
      memberId: member.id,
      permission,
      grantedBy: member.team!.ownerId,
      grantedAt: new Date(),
    }));

    // 批量创建权限
    if (permissionsToCreate.length > 0) {
      await prisma.projectPermission.createMany({
        data: permissionsToCreate,
        skipDuplicates: true, // 跳过已存在的权限
      });
    }
  }

  /**
   * 检查用户是否为团队所有者
   * @param userId 用户ID
   * @param projectId 项目ID
   */
  async isTeamOwner(userId: string, projectId: string): Promise<boolean> {
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

    if (!project?.workspace?.team) {
      return false;
    }

    return project.workspace.team.ownerId === userId;
  }
}

// 导出服务实例
export const permissionService = new PermissionService();
