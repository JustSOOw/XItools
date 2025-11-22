/**
 * permissionMiddleware 单元测试
 *
 * 测试导出的权限验证中间件
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ProjectPermissionType } from '../../types/teamTypes';

// 创建 mock prisma
const mockPrisma = {
  project: {
    findUnique: vi.fn(),
  },
  board: {
    findUnique: vi.fn(),
  },
  task: {
    findUnique: vi.fn(),
  },
};

// Mock permissionService
const mockPermissionService = {
  checkProjectPermission: vi.fn(),
  isTeamOwner: vi.fn(),
};

// Mock ../lib/prisma
vi.mock('../../lib/prisma', () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));

// Mock permissionService
vi.mock('../../services/permissionService', () => ({
  permissionService: mockPermissionService,
}));

describe('PermissionMiddleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let statusSpy: ReturnType<typeof vi.fn>;
  let sendSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // 重置 mocks
    vi.clearAllMocks();

    statusSpy = vi.fn().mockReturnThis();
    sendSpy = vi.fn().mockResolvedValue(undefined);

    mockReply = {
      status: statusSpy,
      send: sendSpy,
    };

    mockRequest = {
      user: {
        userId: 'user-123',
      },
      params: {},
      body: {},
    };
  });

  describe('requireProjectEdit', () => {
    it('应该允许有编辑权限的用户通过', async () => {
      mockPermissionService.checkProjectPermission.mockResolvedValue(true);
      mockRequest.params = { id: 'project-123' };

      const { requireProjectEdit } = await import('../../middleware/permissionMiddleware');
      await requireProjectEdit(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockPermissionService.checkProjectPermission).toHaveBeenCalledWith(
        'user-123',
        'project-123',
        ProjectPermissionType.EDIT
      );
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('应该拒绝没有权限的用户', async () => {
      mockPermissionService.checkProjectPermission.mockResolvedValue(false);
      mockRequest.params = { id: 'project-123' };

      const { requireProjectEdit } = await import('../../middleware/permissionMiddleware');
      await requireProjectEdit(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).toHaveBeenCalledWith(403);
    });

    it('应该拒绝未认证的用户', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: 'project-123' };

      const { requireProjectEdit } = await import('../../middleware/permissionMiddleware');
      await requireProjectEdit(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).toHaveBeenCalledWith(401);
    });
  });

  describe('requireProjectView', () => {
    it('应该允许有查看权限的用户通过', async () => {
      mockPermissionService.checkProjectPermission.mockResolvedValue(true);
      mockRequest.params = { id: 'project-123' };

      const { requireProjectView } = await import('../../middleware/permissionMiddleware');
      await requireProjectView(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockPermissionService.checkProjectPermission).toHaveBeenCalledWith(
        'user-123',
        'project-123',
        ProjectPermissionType.VIEW
      );
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('应该拒绝没有权限的用户', async () => {
      mockPermissionService.checkProjectPermission.mockResolvedValue(false);
      mockRequest.params = { id: 'project-123' };

      const { requireProjectView } = await import('../../middleware/permissionMiddleware');
      await requireProjectView(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).toHaveBeenCalledWith(403);
    });
  });

  describe('requireProjectPermission', () => {
    it('应该创建具有指定权限的中间件', async () => {
      mockPermissionService.checkProjectPermission.mockResolvedValue(true);
      mockRequest.params = { id: 'project-123' };

      const { requireProjectPermission } = await import('../../middleware/permissionMiddleware');
      const middleware = requireProjectPermission(ProjectPermissionType.EDIT);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockPermissionService.checkProjectPermission).toHaveBeenCalledWith(
        'user-123',
        'project-123',
        ProjectPermissionType.EDIT
      );
    });
  });

  describe('createOwnershipOrPermissionVerifier', () => {
    it('应该允许项目所有者访问', async () => {
      mockRequest.params = { id: 'project-123' };
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-123',
        ownerId: 'user-123',
      });

      const { createOwnershipOrPermissionVerifier } = await import('../../middleware/permissionMiddleware');
      const verifier = createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW);
      await verifier(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('应该允许有权限的团队成员访问', async () => {
      mockRequest.params = { id: 'project-123' };
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-123',
        ownerId: 'other-user',
      });
      mockPermissionService.checkProjectPermission.mockResolvedValue(true);

      const { createOwnershipOrPermissionVerifier } = await import('../../middleware/permissionMiddleware');
      const verifier = createOwnershipOrPermissionVerifier(ProjectPermissionType.EDIT);
      await verifier(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockPermissionService.checkProjectPermission).toHaveBeenCalled();
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('应该拒绝没有权限的用户', async () => {
      mockRequest.params = { id: 'project-123' };
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-123',
        ownerId: 'other-user',
      });
      mockPermissionService.checkProjectPermission.mockResolvedValue(false);

      const { createOwnershipOrPermissionVerifier } = await import('../../middleware/permissionMiddleware');
      const verifier = createOwnershipOrPermissionVerifier(ProjectPermissionType.EDIT);
      await verifier(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).toHaveBeenCalledWith(403);
    });
  });

  describe('requireProjectAdmin', () => {
    it('应该允许项目所有者访问', async () => {
      mockRequest.params = { id: 'project-123' };
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-123',
        ownerId: 'user-123',
        workspace: {},
      });

      const { requireProjectAdmin } = await import('../../middleware/permissionMiddleware');
      await requireProjectAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('应该允许团队所有者访问', async () => {
      mockRequest.params = { id: 'project-123' };
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-123',
        ownerId: 'other-user',
        workspace: {
          team: {
            ownerId: 'user-123',
          },
        },
      });

      const { requireProjectAdmin } = await import('../../middleware/permissionMiddleware');
      await requireProjectAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('应该拒绝非管理员用户', async () => {
      mockRequest.params = { id: 'project-123' };
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-123',
        ownerId: 'other-user',
        workspace: {
          team: {
            ownerId: 'team-owner',
          },
        },
      });

      const { requireProjectAdmin } = await import('../../middleware/permissionMiddleware');
      await requireProjectAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).toHaveBeenCalledWith(403);
    });

    it('应该拒绝未认证的用户', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: 'project-123' };

      const { requireProjectAdmin } = await import('../../middleware/permissionMiddleware');
      await requireProjectAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).toHaveBeenCalledWith(401);
    });
  });

  describe('错误处理', () => {
    it('应该处理缺少projectId的情况', async () => {
      mockRequest.params = {};

      const { requireProjectEdit } = await import('../../middleware/permissionMiddleware');
      await requireProjectEdit(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: '无法确定项目ID',
      });
    });

    it('应该处理权限检查错误', async () => {
      mockPermissionService.checkProjectPermission.mockRejectedValue(new Error('Database error'));
      mockRequest.params = { id: 'project-123' };

      const { requireProjectEdit } = await import('../../middleware/permissionMiddleware');
      await requireProjectEdit(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith({
        success: false,
        error: '权限验证失败',
      });
    });
  });
});
