/**
 * 团队认证中间件
 *
 * 提供团队权限验证功能
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { teamService } from '../services/teamService';

/**
 * 要求用户为团队所有者(管理员)
 * 使用方法: preHandler: [authMiddleware, requireTeamOwner]
 */
export async function requireTeamOwner(
  request: FastifyRequest<{ Params: { teamId: string } }>,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;
    const teamId = request.params.teamId;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: '未认证',
      });
    }

    if (!teamId) {
      return reply.status(400).send({
        success: false,
        error: '缺少团队ID',
      });
    }

    // 检查是否为团队所有者
    const isOwner = await teamService.checkTeamOwnership(teamId, userId);

    if (!isOwner) {
      return reply.status(403).send({
        success: false,
        error: '只有团队创建者可以执行此操作',
      });
    }

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
 * 要求用户为团队成员(包括所有者)
 * 使用方法: preHandler: [authMiddleware, requireTeamMember]
 */
export async function requireTeamMember(
  request: FastifyRequest<{ Params: { teamId: string } }>,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;
    const teamId = request.params.teamId;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: '未认证',
      });
    }

    if (!teamId) {
      return reply.status(400).send({
        success: false,
        error: '缺少团队ID',
      });
    }

    // 检查是否为团队成员
    const isMember = await teamService.checkTeamMembership(teamId, userId);

    if (!isMember) {
      return reply.status(403).send({
        success: false,
        error: '您不是该团队的成员',
      });
    }

    // 通过验证，继续处理请求
  } catch (error) {
    console.error('团队成员验证错误:', error);
    return reply.status(500).send({
      success: false,
      error: '权限验证失败',
    });
  }
}

/**
 * 将团队信息附加到请求上下文
 * 使用方法: preHandler: [authMiddleware, attachTeamContext]
 */
export async function attachTeamContext(
  request: FastifyRequest<{ Params: { teamId: string } }>,
  reply: FastifyReply
) {
  try {
    const teamId = request.params.teamId;

    if (!teamId) {
      return reply.status(400).send({
        success: false,
        error: '缺少团队ID',
      });
    }

    // 获取团队详情
    const team = await teamService.getTeamById(teamId);

    if (!team) {
      return reply.status(404).send({
        success: false,
        error: '团队不存在',
      });
    }

    // 将团队信息添加到请求上下文
    (request as any).team = team;

    // 通过验证，继续处理请求
  } catch (error) {
    console.error('团队上下文附加错误:', error);
    return reply.status(500).send({
      success: false,
      error: '获取团队信息失败',
    });
  }
}
