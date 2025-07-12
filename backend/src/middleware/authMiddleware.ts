/**
 * 认证中间件
 *
 * 提供JWT token验证和用户身份验证功能
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { extractBearerToken, verifyJWT } from '../utils/jwtUtils';
import { authService } from '../services/authService';

/**
 * 认证中间件 - 验证JWT token并设置用户上下文
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      return reply.status(401).send({
        success: false,
        error: '缺少认证token',
      });
    }

    // 验证token并获取用户信息
    const user = await authService.verifyToken(token);

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'Token无效或已过期',
      });
    }

    // 将用户信息添加到请求上下文
    request.user = {
      userId: user.id,
      username: user.username,
      email: user.email,
      sessionId: '', // 可以从token中获取或生成
      permissions: [], // 可以根据需要添加权限系统
      isActive: user.isActive,
    };
  } catch (error) {
    console.error('认证中间件错误:', error);
    return reply.status(401).send({
      success: false,
      error: '认证失败',
    });
  }
}

/**
 * 可选认证中间件 - 如果有token则验证，没有则跳过
 */
export async function optionalAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = extractBearerToken(request.headers.authorization);

    if (token) {
      const user = await authService.verifyToken(token);

      if (user) {
        request.user = {
          userId: user.id,
          username: user.username,
          email: user.email,
          sessionId: '',
          permissions: [],
          isActive: user.isActive,
        };
      }
    }

    // 无论是否有token都继续执行
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    // 忽略错误，继续执行
  }
}

/**
 * 获取当前用户ID的辅助函数
 */
export function getCurrentUserId(request: FastifyRequest): string | null {
  return request.user?.userId || null;
}

/**
 * 确保用户已认证的辅助函数
 */
export function requireAuth(request: FastifyRequest): string {
  const userId = getCurrentUserId(request);
  if (!userId) {
    throw new Error('用户未认证');
  }
  return userId;
}

/**
 * 数据所有权验证中间件
 * 验证用户是否有权访问指定的资源
 */
export async function verifyOwnership(
  request: FastifyRequest,
  reply: FastifyReply,
  resourceType: 'workspace' | 'project' | 'board' | 'task' | 'column',
  resourceId: string,
) {
  try {
    const userId = requireAuth(request);
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    let isOwner = false;

    switch (resourceType) {
      case 'workspace':
        const workspace = await prisma.workspace.findFirst({
          where: { id: resourceId, ownerId: userId },
        });
        isOwner = !!workspace;
        break;

      case 'project':
        const project = await prisma.project.findFirst({
          where: { id: resourceId, ownerId: userId },
        });
        isOwner = !!project;
        break;

      case 'board':
        const board = await prisma.board.findFirst({
          where: { id: resourceId, ownerId: userId },
        });
        isOwner = !!board;
        break;

      case 'task':
        const task = await prisma.task.findFirst({
          where: { id: resourceId, ownerId: userId },
        });
        isOwner = !!task;
        break;

      case 'column':
        // 列通过看板间接关联用户
        const column = await prisma.boardColumn.findFirst({
          where: {
            id: resourceId,
            board: { ownerId: userId },
          },
        });
        isOwner = !!column;
        break;

      default:
        throw new Error(`不支持的资源类型: ${resourceType}`);
    }

    if (!isOwner) {
      return reply.status(403).send({
        success: false,
        error: '无权访问此资源',
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('所有权验证失败:', error);
    return reply.status(500).send({
      success: false,
      error: '权限验证失败',
    });
  }
}

/**
 * 创建资源所有权验证的辅助函数
 */
export function createOwnershipVerifier(
  resourceType: 'workspace' | 'project' | 'board' | 'task' | 'column',
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const resourceId =
      (request.params as any).id ||
      (request.params as any).boardId ||
      (request.params as any).workspaceId ||
      (request.params as any).projectId;
    if (resourceId) {
      await verifyOwnership(request, reply, resourceType, resourceId);
    }
  };
}
