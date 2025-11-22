/**
 * permissionService 单元测试
 *
 * 测试范围：
 * - 权限设置和更新
 * - 权限检查逻辑（各种场景）
 * - 编辑权限的功能边界
 * - 查看权限的功能边界
 * - 新成员默认权限
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectPermissionType } from '../../types/teamTypes';

// 创建 mock prisma
const mockPrisma = {
  project: {
    findUnique: vi.fn(),
  },
  projectPermission: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    createMany: vi.fn(),
  },
  team: {
    findUnique: vi.fn(),
  },
  teamMember: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  workspace: {
    findFirst: vi.fn(),
  },
};

// Mock ../lib/prisma
vi.mock('../../lib/prisma', () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));

describe('PermissionService', () => {
  let permissionService: any;

  const testUserId = 'user-123';
  const testProjectId = 'project-456';
  const testMemberId = 'member-789';
  const testTeamId = 'team-abc';
  const testWorkspaceId = 'workspace-xyz';

  beforeEach(async () => {
    // 清除所有 mock
    vi.clearAllMocks();

    // 导入 permissionService（在 mock 之后）
    const module = await import('../../services/permissionService');
    permissionService = module.permissionService;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('setProjectPermission - 权限设置', () => {
    it('应该成功创建新的项目权限', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: testUserId,
        workspace: {
          id: testWorkspaceId,
          team: {
            id: testTeamId,
            ownerId: testUserId,
          },
        },
      };

      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        teamId: testTeamId,
        team: {
          id: testTeamId,
        },
      };

      const mockTeam = {
        id: testTeamId,
        ownerId: testUserId,
      };

      const mockPermission = {
        id: 'perm-1',
        permission: ProjectPermissionType.EDIT,
        projectId: testProjectId,
        memberId: testMemberId,
        grantedBy: testUserId,
        grantedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.teamMember.findUnique.mockResolvedValue(mockMember);
      mockPrisma.team.findUnique.mockResolvedValue(mockTeam);
      mockPrisma.projectPermission.findUnique.mockResolvedValue(null);
      mockPrisma.projectPermission.create.mockResolvedValue(mockPermission);

      const result = await permissionService.setProjectPermission(
        testProjectId,
        testMemberId,
        ProjectPermissionType.EDIT,
        testUserId
      );

      expect(result).toEqual(mockPermission);
      expect(mockPrisma.projectPermission.create).toHaveBeenCalled();
    });

    it('应该更新已存在的权限', async () => {
      const mockProject = {
        id: testProjectId,
        workspace: {
          team: { id: testTeamId, ownerId: testUserId },
        },
      };

      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        teamId: testTeamId,
      };

      const mockTeam = {
        id: testTeamId,
        ownerId: testUserId,
      };

      const existingPermission = {
        id: 'perm-1',
        permission: ProjectPermissionType.VIEW,
      };

      const updatedPermission = {
        ...existingPermission,
        permission: ProjectPermissionType.EDIT,
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.teamMember.findUnique.mockResolvedValue(mockMember);
      mockPrisma.team.findUnique.mockResolvedValue(mockTeam);
      mockPrisma.projectPermission.findUnique.mockResolvedValue(existingPermission);
      mockPrisma.projectPermission.update.mockResolvedValue(updatedPermission);

      const result = await permissionService.setProjectPermission(
        testProjectId,
        testMemberId,
        ProjectPermissionType.EDIT,
        testUserId
      );

      expect(result.permission).toBe(ProjectPermissionType.EDIT);
      expect(mockPrisma.projectPermission.update).toHaveBeenCalled();
    });
  });

  describe('updateProjectPermission - 权限更新', () => {
    it('应该成功更新权限', async () => {
      const mockPermission = {
        id: 'perm-1',
        permission: ProjectPermissionType.EDIT,
      };

      mockPrisma.projectPermission.findUnique.mockResolvedValue({
        id: 'perm-1',
        permission: ProjectPermissionType.VIEW,
      });
      mockPrisma.projectPermission.update.mockResolvedValue(mockPermission);

      const result = await permissionService.updateProjectPermission(
        'perm-1',
        ProjectPermissionType.EDIT
      );

      expect(result.permission).toBe(ProjectPermissionType.EDIT);
    });
  });

  describe('removeProjectPermission - 权限移除', () => {
    it('应该成功移除权限', async () => {
      mockPrisma.projectPermission.findUnique.mockResolvedValue({
        id: 'perm-1',
      });
      mockPrisma.projectPermission.delete.mockResolvedValue({});

      await permissionService.removeProjectPermission('perm-1');

      expect(mockPrisma.projectPermission.delete).toHaveBeenCalled();
    });
  });

  describe('checkProjectPermission - 权限检查逻辑', () => {
    it('应该允许项目所有者访问（个人项目）', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: testUserId,
        workspace: {
          id: testWorkspaceId,
          teamId: null,
        },
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await permissionService.checkProjectPermission(
        testUserId,
        testProjectId,
        ProjectPermissionType.EDIT
      );

      expect(result).toBe(true);
    });

    it('应该允许团队所有者访问团队项目', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: 'other-user',
        workspace: {
          id: testWorkspaceId,
          team: {
            id: testTeamId,
            ownerId: testUserId,
          },
        },
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await permissionService.checkProjectPermission(
        testUserId,
        testProjectId,
        ProjectPermissionType.EDIT
      );

      expect(result).toBe(true);
    });

    it('应该根据成员权限允许访问', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: 'other-user',
        workspace: {
          id: testWorkspaceId,
          team: {
            id: testTeamId,
            ownerId: 'team-owner',
          },
        },
      };

      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        teamId: testTeamId,
        status: 'active',
      };

      const mockPermission = {
        id: 'perm-1',
        permission: ProjectPermissionType.EDIT,
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.teamMember.findFirst.mockResolvedValue(mockMember);
      mockPrisma.projectPermission.findUnique.mockResolvedValue(mockPermission);

      const result = await permissionService.checkProjectPermission(
        testUserId,
        testProjectId,
        ProjectPermissionType.EDIT
      );

      expect(result).toBe(true);
    });

    it('应该拒绝无权限的用户访问', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: 'other-user',
        workspace: {
          id: testWorkspaceId,
          team: {
            id: testTeamId,
            ownerId: 'team-owner',
          },
        },
      };

      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        status: 'active',
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.teamMember.findFirst.mockResolvedValue(mockMember);
      mockPrisma.projectPermission.findUnique.mockResolvedValue(null);

      const result = await permissionService.checkProjectPermission(
        testUserId,
        testProjectId,
        ProjectPermissionType.EDIT
      );

      expect(result).toBe(false);
    });
  });

  describe('编辑权限的功能边界测试', () => {
    it('EDIT权限应该允许创建和修改资源', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: 'other-user',
        workspace: {
          id: testWorkspaceId,
          team: {
            id: testTeamId,
            ownerId: 'team-owner',
          },
        },
      };

      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        status: 'active',
      };

      const mockPermission = {
        permission: ProjectPermissionType.EDIT,
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.teamMember.findFirst.mockResolvedValue(mockMember);
      mockPrisma.projectPermission.findUnique.mockResolvedValue(mockPermission);

      const hasEditPermission = await permissionService.checkProjectPermission(
        testUserId,
        testProjectId,
        ProjectPermissionType.EDIT
      );

      expect(hasEditPermission).toBe(true);
    });

    it('EDIT权限不应该允许删除项目（需要管理员权限）', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: 'other-user',
        workspace: {
          id: testWorkspaceId,
          team: {
            id: testTeamId,
            ownerId: 'team-owner',
          },
        },
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const isProjectOwner = mockProject.ownerId === testUserId;
      const isTeamOwner = await permissionService.isTeamOwner(testUserId, testProjectId);

      expect(isProjectOwner).toBe(false);
      expect(isTeamOwner).toBe(false);
    });
  });

  describe('查看权限的功能边界测试', () => {
    it('VIEW权限应该允许读取资源', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: 'other-user',
        workspace: {
          id: testWorkspaceId,
          team: {
            id: testTeamId,
            ownerId: 'team-owner',
          },
        },
      };

      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        status: 'active',
      };

      const mockPermission = {
        permission: ProjectPermissionType.VIEW,
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.teamMember.findFirst.mockResolvedValue(mockMember);
      mockPrisma.projectPermission.findUnique.mockResolvedValue(mockPermission);

      const hasViewPermission = await permissionService.checkProjectPermission(
        testUserId,
        testProjectId,
        ProjectPermissionType.VIEW
      );

      expect(hasViewPermission).toBe(true);
    });

    it('VIEW权限不应该允许修改资源', async () => {
      const mockProject = {
        id: testProjectId,
        ownerId: 'other-user',
        workspace: {
          id: testWorkspaceId,
          team: {
            id: testTeamId,
            ownerId: 'team-owner',
          },
        },
      };

      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        status: 'active',
      };

      const mockPermission = {
        permission: ProjectPermissionType.VIEW,
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.teamMember.findFirst.mockResolvedValue(mockMember);
      mockPrisma.projectPermission.findUnique.mockResolvedValue(mockPermission);

      const hasEditPermission = await permissionService.checkProjectPermission(
        testUserId,
        testProjectId,
        ProjectPermissionType.EDIT
      );

      expect(hasEditPermission).toBe(false);
    });
  });

  describe('setDefaultPermissions - 新成员默认权限', () => {
    it('应该为新成员设置所有项目的VIEW权限', async () => {
      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        teamId: testTeamId,
        team: {
          id: testTeamId,
          ownerId: testUserId,
          workspaces: [
            {
              id: testWorkspaceId,
              projects: [
                { id: 'project-1' },
                { id: 'project-2' },
                { id: 'project-3' },
              ],
            },
          ],
        },
      };

      mockPrisma.teamMember.findUnique.mockResolvedValue(mockMember);
      mockPrisma.projectPermission.createMany.mockResolvedValue({ count: 3 });

      await permissionService.setDefaultPermissions(testMemberId);

      expect(mockPrisma.projectPermission.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            projectId: 'project-1',
            memberId: testMemberId,
            permission: ProjectPermissionType.VIEW,
          }),
        ]),
        skipDuplicates: true,
      });
    });

    it('应该允许自定义默认权限级别', async () => {
      const mockMember = {
        id: testMemberId,
        userId: testUserId,
        teamId: testTeamId,
        team: {
          id: testTeamId,
          ownerId: testUserId,
          workspaces: [
            {
              id: testWorkspaceId,
              projects: [{ id: 'project-1' }],
            },
          ],
        },
      };

      mockPrisma.teamMember.findUnique.mockResolvedValue(mockMember);
      mockPrisma.projectPermission.createMany.mockResolvedValue({ count: 1 });

      await permissionService.setDefaultPermissions(testMemberId, ProjectPermissionType.EDIT);

      expect(mockPrisma.projectPermission.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            permission: ProjectPermissionType.EDIT,
          }),
        ]),
        skipDuplicates: true,
      });
    });

    it('新成员不存在时应该抛出错误', async () => {
      mockPrisma.teamMember.findUnique.mockResolvedValue(null);

      await expect(
        permissionService.setDefaultPermissions('non-existent-member')
      ).rejects.toThrow();
    });
  });

  describe('getProjectPermissions - 获取项目权限列表', () => {
    it('应该返回项目的所有权限', async () => {
      const mockPermissions = [
        {
          id: 'perm-1',
          permission: ProjectPermissionType.EDIT,
          projectId: testProjectId,
          memberId: testMemberId,
          grantedBy: testUserId,
          grantedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          member: {
            user: {
              id: testUserId,
              username: 'testuser',
              email: 'test@example.com',
              avatar: null,
            },
          },
        },
        {
          id: 'perm-2',
          permission: ProjectPermissionType.VIEW,
          projectId: testProjectId,
          memberId: 'member-2',
          grantedBy: testUserId,
          grantedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          member: {
            user: {
              id: 'user-2',
              username: 'user2',
              email: 'user2@example.com',
              avatar: null,
            },
          },
        },
      ];

      mockPrisma.projectPermission.findMany.mockResolvedValue(mockPermissions);

      const result = await permissionService.getProjectPermissions(testProjectId);

      expect(result).toHaveLength(2);
      expect(result[0].permission).toBe(ProjectPermissionType.EDIT);
      expect(result[1].permission).toBe(ProjectPermissionType.VIEW);
    });
  });

  describe('getMemberProjectPermissions - 获取成员的项目权限', () => {
    it('应该返回成员的所有项目权限', async () => {
      const mockPermissions = [
        {
          id: 'perm-1',
          permission: ProjectPermissionType.EDIT,
          projectId: 'project-1',
          memberId: testMemberId,
          grantedBy: testUserId,
          grantedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          project: {
            id: 'project-1',
            name: 'Project 1',
          },
        },
        {
          id: 'perm-2',
          permission: ProjectPermissionType.VIEW,
          projectId: 'project-2',
          memberId: testMemberId,
          grantedBy: testUserId,
          grantedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          project: {
            id: 'project-2',
            name: 'Project 2',
          },
        },
      ];

      mockPrisma.projectPermission.findMany.mockResolvedValue(mockPermissions);

      const result = await permissionService.getMemberProjectPermissions(testMemberId);

      expect(result).toHaveLength(2);
      expect(result[0].permission).toBe(ProjectPermissionType.EDIT);
      expect(result[1].permission).toBe(ProjectPermissionType.VIEW);
    });
  });
});
