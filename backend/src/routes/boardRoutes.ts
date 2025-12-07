/**
 * 看板管理路由
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { boardService } from '../services/boardService';
import { boardSchema, boardUpdateSchema, reorderSchema } from '../types/multiBoardSchema';
import { authMiddleware, requireAuth, createOwnershipVerifier } from '../middleware/authMiddleware';
import {
  createOwnershipOrPermissionVerifier,
  requireProjectEdit,
  createWorkspaceAccessVerifier
} from '../middleware/permissionMiddleware';
import { ProjectPermissionType } from '../types/teamTypes';

const prisma = new PrismaClient();

export default async function boardRoutes(fastify: FastifyInstance) {
  // 获取工作区下的所有看板（需要验证工作区访问权限，支持团队成员）
  fastify.get(
    '/workspaces/:workspaceId/boards',
    {
      preHandler: [authMiddleware, createWorkspaceAccessVerifier(ProjectPermissionType.VIEW)],
    },
    async (request, reply) => {
      try {
        const { workspaceId } = request.params as { workspaceId: string };
        const boards = await boardService.getBoardsByWorkspace(workspaceId);
        return { success: true, data: boards };
      } catch (error) {
        console.error('获取工作区看板列表失败:', error);
        reply.status(500);
        return { success: false, error: '获取工作区看板列表失败' };
      }
    },
  );

  // 获取项目下的所有看板（需要查看权限）
  fastify.get(
    '/projects/:projectId/boards',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW)],
    },
    async (request, reply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const boards = await boardService.getBoardsByProject(projectId);
        return { success: true, data: boards };
      } catch (error) {
        console.error('获取项目看板列表失败:', error);
        reply.status(500);
        return { success: false, error: '获取项目看板列表失败' };
      }
    },
  );

  // 根据ID获取看板（需要查看权限）
  fastify.get(
    '/boards/:id',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW)],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const board = await boardService.getBoardById(id);

        if (!board) {
          reply.status(404);
          return { success: false, error: '看板不存在' };
        }

        return { success: true, data: board };
      } catch (error) {
        console.error('获取看板失败:', error);
        reply.status(500);
        return { success: false, error: '获取看板失败' };
      }
    },
  );

  // 创建看板（需要编辑权限）
  fastify.post('/boards', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const boardData = boardSchema.parse(request.body);

      // 检查用户是否对项目有编辑权限
      if (boardData.projectId) {
        const { permissionService } = await import('../services/permissionService');
        const hasPermission = await permissionService.checkProjectPermission(
          userId,
          boardData.projectId,
          ProjectPermissionType.EDIT
        );

        if (!hasPermission) {
          reply.status(403);
          return { success: false, error: '您没有在该项目中创建看板的权限' };
        }
      }
      // 检查用户是否对工作区有编辑权限（工作区直属看板）
      else if (boardData.workspaceId) {
        const { permissionService } = await import('../services/permissionService');
        const hasPermission = await permissionService.checkWorkspacePermission(
          userId,
          boardData.workspaceId,
          ProjectPermissionType.EDIT
        );

        if (!hasPermission) {
          reply.status(403);
          return { success: false, error: '您没有在该工作区中创建看板的权限' };
        }
      }

      const board = await boardService.createBoard(boardData, userId);

      // 广播看板创建事件
      const io = fastify.io;
      if (io) {
        io.emit('board_created', board);
      }

      return { success: true, data: board };
    } catch (error) {
      console.error('创建看板失败:', error);
      // 业务逻辑错误返回 400，服务器错误返回 500
      const statusCode = error instanceof Error && error.message.includes('已存在') ? 400 : 500;
      reply.status(statusCode);
      return { success: false, error: error instanceof Error ? error.message : '创建看板失败' };
    }
  });

  // 更新看板（需要编辑权限）
  fastify.put(
    '/boards/:id',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.EDIT)],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const updateData = boardUpdateSchema.parse(request.body);
        const board = await boardService.updateBoard(id, updateData);

        // 广播看板更新事件
        const io = fastify.io;
        if (io) {
          io.emit('board_updated', board);
        }

        return { success: true, data: board };
      } catch (error) {
        console.error('更新看板失败:', error);
        // 业务逻辑错误返回 400，服务器错误返回 500
        const statusCode = error instanceof Error && error.message.includes('已存在') ? 400 : 500;
        reply.status(statusCode);
        return { success: false, error: error instanceof Error ? error.message : '更新看板失败' };
      }
    },
  );

  // 删除看板（需要编辑权限）
  fastify.delete(
    '/boards/:id',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.EDIT)],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        await boardService.deleteBoard(id);

        // 广播看板删除事件
        const io = fastify.io;
        if (io) {
          io.emit('board_deleted', { boardId: id });
        }

        return { success: true, message: '看板删除成功' };
      } catch (error) {
        console.error('删除看板失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '删除看板失败' };
      }
    },
  );

  // 移动看板（需要编辑权限，支持团队管理员）
  fastify.post(
    '/boards/:id/move',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.EDIT)],
    },
    async (request, reply) => {
      try {
        const userId = requireAuth(request);
        const { id } = request.params as { id: string };
        const { targetWorkspaceId, targetProjectId } = request.body as {
          targetWorkspaceId?: string;
          targetProjectId?: string;
        };

        const board = await boardService.moveBoard(id, targetWorkspaceId, targetProjectId, userId);

        // 广播看板移动事件
        const io = fastify.io;
        if (io) {
          io.emit('board_moved', { board, targetWorkspaceId, targetProjectId });
        }

        return { success: true, data: board };
      } catch (error) {
        console.error('移动看板失败:', error);
        reply.status(500);
        return { success: false, error: error instanceof Error ? error.message : '移动看板失败' };
      }
    },
  );

  // 重新排序看板（工作区下，需要编辑权限，支持团队管理员）
  fastify.post(
    '/workspaces/:workspaceId/boards/reorder',
    {
      preHandler: [authMiddleware, createWorkspaceAccessVerifier(ProjectPermissionType.EDIT)],
    },
    async (request, reply) => {
      try {
        const { workspaceId } = request.params as { workspaceId: string };
        const { itemIds } = reorderSchema.parse(request.body);
        const boards = await boardService.reorderBoards(workspaceId, itemIds, 'workspace');

        // 广播看板重排序事件
        const io = fastify.io;
        if (io) {
          io.emit('boards_reordered', { workspaceId, boards, type: 'workspace' });
        }

        return { success: true, data: boards };
      } catch (error) {
        console.error('工作区看板重排序失败:', error);
        reply.status(500);
        return {
          success: false,
          error: error instanceof Error ? error.message : '工作区看板重排序失败',
        };
      }
    },
  );

  // 重新排序看板（项目下，需要编辑权限，支持团队管理员）
  fastify.post(
    '/projects/:projectId/boards/reorder',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.EDIT)],
    },
    async (request, reply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const { itemIds } = reorderSchema.parse(request.body);
        const boards = await boardService.reorderBoards(projectId, itemIds, 'project');

        // 广播看板重排序事件
        const io = fastify.io;
        if (io) {
          io.emit('boards_reordered', { projectId, boards, type: 'project' });
        }

        return { success: true, data: boards };
      } catch (error) {
        console.error('项目看板重排序失败:', error);
        reply.status(500);
        return {
          success: false,
          error: error instanceof Error ? error.message : '项目看板重排序失败',
        };
      }
    },
  );

  // 复制看板
  fastify.post('/boards/:id/duplicate', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { id } = request.params as { id: string };
      const { newName, targetWorkspaceId, targetProjectId } = request.body as {
        newName?: string;
        targetWorkspaceId?: string;
        targetProjectId?: string;
      };

      const board = await boardService.duplicateBoard(
        id,
        userId,
        newName,
        targetWorkspaceId,
        targetProjectId,
      );

      // 广播看板复制事件
      const io = fastify.io;
      if (io) {
        io.emit('board_duplicated', { originalId: id, newBoard: board });
      }

      return { success: true, data: board };
    } catch (error) {
      console.error('复制看板失败:', error);
      reply.status(500);
      return { success: false, error: error instanceof Error ? error.message : '复制看板失败' };
    }
  });

  // 获取看板统计信息（需要查看权限，支持团队成员）
  fastify.get(
    '/boards/:id/stats',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW)],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const stats = await boardService.getBoardStats(id);
        return { success: true, data: stats };
      } catch (error) {
        console.error('获取看板统计失败:', error);
        reply.status(500);
        return { success: false, error: '获取看板统计失败' };
      }
    },
  );

  // 兼容性端点：获取所有看板（用于单看板模式）
  fastify.get('/boards', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      // 获取用户默认工作区的所有看板，保持向后兼容
      const { workspaceService } = await import('../services/workspaceService');
      const defaultWorkspace = await workspaceService.getDefaultWorkspaceForUser(userId);

      if (!defaultWorkspace) {
        return { success: true, data: [] };
      }

      const boards = await boardService.getBoardsByWorkspace(defaultWorkspace.id);
      return { success: true, data: boards };
    } catch (error) {
      console.error('获取看板列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取看板列表失败' };
    }
  });

  // 兼容性端点：获取当前看板（用于单看板模式）
  fastify.get('/board/current', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const userId = requireAuth(request);
      // 返回用户默认工作区的第一个看板，保持向后兼容
      const { workspaceService } = await import('../services/workspaceService');
      const defaultWorkspace = await workspaceService.getDefaultWorkspaceForUser(userId);

      if (!defaultWorkspace) {
        reply.status(404);
        return { success: false, error: '未找到默认工作区' };
      }

      const boards = await boardService.getBoardsByWorkspace(defaultWorkspace.id);
      if (boards.length === 0) {
        reply.status(404);
        return { success: false, error: '未找到看板' };
      }

      return { success: true, data: boards[0] };
    } catch (error) {
      console.error('获取当前看板失败:', error);
      reply.status(500);
      return { success: false, error: '获取当前看板失败' };
    }
  });

  // 获取看板的可选负责人列表
  // 个人看板：只返回当前用户
  // 团队看板：返回团队成员列表
  fastify.get(
    '/boards/:boardId/assignees',
    {
      preHandler: [authMiddleware, createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW)],
    },
    async (request, reply) => {
      try {
        const { boardId } = request.params as { boardId: string };
        const userId = request.user?.userId;

        if (!userId) {
          reply.status(401);
          return { success: false, error: '未认证' };
        }

        // 获取看板信息
        const board = await prisma.board.findUnique({
          where: { id: boardId },
          include: {
            workspace: {
              include: {
                team: {
                  include: {
                    members: {
                      where: { status: 'active' },
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
                },
              },
            },
          },
        });

        if (!board) {
          reply.status(404);
          return { success: false, error: '看板不存在' };
        }

        // 如果是团队工作区，返回团队成员
        if (board.workspace?.team) {
          const members = board.workspace.team.members.map((member) => ({
            id: member.user.id,
            username: member.user.username,
            email: member.user.email,
            avatar: member.user.avatar,
            role: member.role,
          }));

          // 确保团队所有者也在列表中
          const ownerInMembers = members.some(m => m.id === board.workspace!.team!.ownerId);
          if (!ownerInMembers) {
            const owner = await prisma.user.findUnique({
              where: { id: board.workspace.team.ownerId },
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            });
            if (owner) {
              members.unshift({
                id: owner.id,
                username: owner.username,
                email: owner.email,
                avatar: owner.avatar,
                role: 'owner',
              });
            }
          }

          return { success: true, data: members };
        }

        // 如果是个人工作区，只返回当前用户
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        });

        if (!currentUser) {
          reply.status(404);
          return { success: false, error: '用户不存在' };
        }

        return {
          success: true,
          data: [
            {
              id: currentUser.id,
              username: currentUser.username,
              email: currentUser.email,
              avatar: currentUser.avatar,
              role: 'owner',
            },
          ],
        };
      } catch (error) {
        console.error('获取可选负责人失败:', error);
        reply.status(500);
        return { success: false, error: '获取可选负责人失败' };
      }
    }
  );
}
