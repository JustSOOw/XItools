/**
 * 团队邀请路由
 *
 * 提供邀请接受、拒绝、撤销等API端点
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { teamService } from '../services/teamService';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  acceptInvitationSchema,
  rejectInvitationSchema,
  AcceptInvitationInput,
  RejectInvitationInput,
} from '../types/teamTypes';

/**
 * 注册邀请相关路由
 */
export default async function invitationRoutes(fastify: FastifyInstance) {
  /**
   * 获取我的待处理邀请
   * GET /api/invitations/pending
   */
  fastify.get(
    '/invitations/pending',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '获取我的待处理邀请',
        tags: ['邀请'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.user!.userId;
        const invitations = await teamService.getPendingInvitations(userId);

        reply.send({
          success: true,
          data: invitations,
        });
      } catch (error: any) {
        reply.status(500).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * 通过邀请码验证邀请
   * GET /api/invitations/verify/:inviteCode
   */
  fastify.get<{
    Params: { inviteCode: string };
  }>(
    '/invitations/verify/:inviteCode',
    {
      schema: {
        description: '验证邀请码',
        tags: ['邀请'],
        params: {
          type: 'object',
          properties: {
            inviteCode: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { inviteCode } = request.params;
        const invitation = await teamService.getInvitationByCode(inviteCode);

        if (!invitation) {
          return reply.status(404).send({
            success: false,
            error: '邀请不存在或已失效',
          });
        }

        // 检查邀请是否过期
        if (invitation.expiresAt < new Date()) {
          return reply.status(400).send({
            success: false,
            error: '邀请已过期',
          });
        }

        // 检查邀请状态
        if (invitation.status !== 'pending') {
          return reply.status(400).send({
            success: false,
            error: '邀请已被处理',
          });
        }

        reply.send({
          success: true,
          data: invitation,
        });
      } catch (error: any) {
        reply.status(500).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * 接受邀请
   * POST /api/invitations/:invitationId/accept
   */
  fastify.post<{
    Params: { invitationId: string };
  }>(
    '/invitations/:invitationId/accept',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '接受团队邀请',
        tags: ['邀请'],
        params: {
          type: 'object',
          properties: {
            invitationId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { invitationId } = request.params;
        const userId = request.user!.userId;

        const result = await teamService.acceptInvitation(invitationId, userId);

        // WebSocket 广播邀请接受事件
        const io = fastify.io;
        if (io) {
          io.emit('team_invitation_accepted', {
            invitationId,
            teamId: result.teamId,
            userId,
          });
        }

        reply.send({
          success: true,
          message: '已成功加入团队',
        });
      } catch (error: any) {
        reply.status(error.statusCode || 400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * 拒绝邀请
   * POST /api/invitations/:invitationId/reject
   */
  fastify.post<{
    Params: { invitationId: string };
  }>(
    '/invitations/:invitationId/reject',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '拒绝团队邀请',
        tags: ['邀请'],
        params: {
          type: 'object',
          properties: {
            invitationId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { invitationId } = request.params;
        const userId = request.user!.userId;

        const result = await teamService.rejectInvitation(invitationId, userId);

        // WebSocket 广播邀请拒绝事件
        const io = fastify.io;
        if (io) {
          io.emit('team_invitation_rejected', {
            invitationId,
            teamId: result.teamId,
          });
        }

        reply.send({
          success: true,
          message: '已拒绝邀请',
        });
      } catch (error: any) {
        reply.status(error.statusCode || 400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * 撤销邀请
   * DELETE /api/invitations/:invitationId
   */
  fastify.delete<{
    Params: { invitationId: string };
  }>(
    '/invitations/:invitationId',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '撤销团队邀请',
        tags: ['邀请'],
        params: {
          type: 'object',
          properties: {
            invitationId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { invitationId } = request.params;
        const userId = request.user!.userId;

        const result = await teamService.cancelInvitation(invitationId, userId);

        // WebSocket 广播邀请撤销事件
        const io = fastify.io;
        if (io) {
          io.emit('team_invitation_cancelled', {
            invitationId,
            teamId: result.teamId,
          });
        }

        reply.send({
          success: true,
          message: '已撤销邀请',
        });
      } catch (error: any) {
        reply.status(error.statusCode || 400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );
}
