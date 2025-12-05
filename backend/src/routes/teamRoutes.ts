/**
 * 团队管理路由
 *
 * 提供团队创建、更新、成员管理等API端点
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { teamService } from '../services/teamService';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireTeamOwner, requireTeamMember } from '../middleware/teamMiddleware';
import { prisma } from '../lib/prisma';
import {
  createTeamSchema,
  updateTeamSchema,
  inviteMembersSchema,
  updateMemberRoleSchema,
  CreateTeamInput,
  UpdateTeamInput,
  InviteMembersInput,
  UpdateMemberRoleInput,
} from '../types/teamTypes';

/**
 * 注册团队相关路由
 */
export default async function teamRoutes(fastify: FastifyInstance) {
  /**
   * 创建团队
   * POST /api/teams
   */
  fastify.post<{
    Body: CreateTeamInput;
  }>(
    '/teams',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '创建团队',
        tags: ['团队'],
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            avatar: { type: 'string', format: 'uri' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  avatar: { type: 'string' },
                  ownerId: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.user!.userId;

        // 验证输入
        const validatedData = createTeamSchema.parse(request.body);

        const team = await teamService.createTeam(userId, validatedData);

        reply.status(201).send({
          success: true,
          data: team,
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
   * 获取我的团队
   * GET /api/teams/my
   */
  fastify.get(
    '/teams/my',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '获取我的团队',
        tags: ['团队'],
        // 移除response schema，允许返回null
      },
    },
    async (request, reply) => {
      try {
        const userId = request.user!.userId;
        const team = await teamService.getMyTeam(userId);

        reply.send({
          success: true,
          data: team, // 可以是 Team 对象或 null
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
   * 获取团队详情
   * GET /api/teams/:teamId
   */
  fastify.get<{
    Params: { teamId: string };
  }>(
    '/teams/:teamId',
    {
      preHandler: [authMiddleware, requireTeamMember],
      schema: {
        description: '获取团队详情',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId } = request.params;
        const team = await teamService.getTeamById(teamId);

        if (!team) {
          return reply.status(404).send({
            success: false,
            error: '团队不存在',
          });
        }

        reply.send({
          success: true,
          data: team,
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
   * 更新团队信息
   * PUT /api/teams/:teamId
   */
  fastify.put<{
    Params: { teamId: string };
    Body: UpdateTeamInput;
  }>(
    '/teams/:teamId',
    {
      preHandler: [authMiddleware, requireTeamOwner],
      schema: {
        description: '更新团队信息',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            avatar: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId } = request.params;
        const userId = request.user!.userId;

        // 验证输入
        const validatedData = updateTeamSchema.parse(request.body);

        const team = await teamService.updateTeam(teamId, userId, validatedData);

        // WebSocket 广播团队信息更新事件
        const io = fastify.io;
        if (io) {
          io.emit('team_updated', {
            teamId,
            team,
          });
        }

        reply.send({
          success: true,
          data: team,
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
   * 解散团队
   * DELETE /api/teams/:teamId
   */
  fastify.delete<{
    Params: { teamId: string };
  }>(
    '/teams/:teamId',
    {
      preHandler: [authMiddleware, requireTeamOwner],
      schema: {
        description: '解散团队',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId } = request.params;
        const userId = request.user!.userId;

        await teamService.dissolveTeam(teamId, userId);

        // WebSocket 广播团队解散事件
        const io = fastify.io;
        if (io) {
          io.emit('team_dissolved', {
            teamId,
          });
        }

        reply.send({
          success: true,
          message: '团队已解散',
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
   * 退出团队
   * POST /api/teams/:teamId/leave
   */
  fastify.post<{
    Params: { teamId: string };
  }>(
    '/teams/:teamId/leave',
    {
      preHandler: [authMiddleware, requireTeamMember],
      schema: {
        description: '退出团队',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId } = request.params;
        const userId = request.user!.userId;

        await teamService.leaveTeam(teamId, userId);

        reply.send({
          success: true,
          message: '已退出团队',
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
   * 获取团队成员列表
   * GET /api/teams/:teamId/members
   */
  fastify.get<{
    Params: { teamId: string };
  }>(
    '/teams/:teamId/members',
    {
      preHandler: [authMiddleware, requireTeamMember],
      schema: {
        description: '获取团队成员列表',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId } = request.params;
        const members = await teamService.getTeamMembers(teamId);

        reply.send({
          success: true,
          data: members,
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
   * 移除团队成员
   * DELETE /api/teams/:teamId/members/:memberId
   */
  fastify.delete<{
    Params: { teamId: string; memberId: string };
  }>(
    '/teams/:teamId/members/:memberId',
    {
      preHandler: [authMiddleware, requireTeamOwner],
      schema: {
        description: '移除团队成员',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            memberId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId, memberId } = request.params;
        const userId = request.user!.userId;

        // 在移除前获取成员信息和团队信息，用于发送通知
        const member = await prisma.teamMember.findUnique({
          where: { id: memberId },
          include: {
            user: true,
            team: true,
          },
        });

        await teamService.removeMember(teamId, memberId, userId);

        if (member) {
          // 发送成员移除通知
          const { NotificationService } = await import('../services/notificationService');
          const notificationService = new NotificationService();

          await notificationService.createNotification({
            userId: member.userId,
            type: 'member_left' as any,
            title: '已从团队移除',
            content: `您已被从团队"${member.team.name}"中移除`,
            resourceType: 'team' as any,
            resourceId: teamId,
          });

          // WebSocket 推送通知
          const io = fastify.io;
          if (io) {
            io.to(`user:${member.userId}`).emit('notification_received', {
              type: 'member_left',
              title: '已从团队移除',
              content: `您已被从团队"${member.team.name}"中移除`,
            });
          }
        }

        // WebSocket 广播成员移除事件
        const io = fastify.io;
        if (io) {
          io.emit('team_member_removed', {
            teamId,
            memberId,
          });
        }

        reply.send({
          success: true,
          message: '成员已移除',
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
   * 更新成员角色
   * PUT /api/teams/:teamId/members/:memberId/role
   */
  fastify.put<{
    Params: { teamId: string; memberId: string };
    Body: UpdateMemberRoleInput;
  }>(
    '/teams/:teamId/members/:memberId/role',
    {
      preHandler: [authMiddleware, requireTeamOwner],
      schema: {
        description: '更新成员角色',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            memberId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['role'],
          properties: {
            role: {
              type: 'string',
              enum: ['admin', 'member', 'guest'],
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId, memberId } = request.params;
        const userId = request.user!.userId;

        // 验证输入
        const validatedData = updateMemberRoleSchema.parse(request.body);

        const updatedMember = await teamService.updateMemberRole(
          teamId,
          memberId,
          userId,
          validatedData
        );

        // 获取团队信息和成员信息，用于发送通知
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const memberWithDetails = await prisma.teamMember.findUnique({
          where: { id: memberId },
          include: {
            user: true,
            team: true,
          },
        });
        await prisma.$disconnect();

        // 发送角色变更通知
        if (memberWithDetails) {
          const { NotificationService } = await import('../services/notificationService');
          const notificationService = new NotificationService();

          const roleText = validatedData.role === 'admin' ? '管理员' : validatedData.role === 'member' ? '成员' : '访客';
          await notificationService.createNotification({
            userId: memberWithDetails.userId,
            type: 'role_changed' as any,
            title: '团队角色变更',
            content: `您在团队"${memberWithDetails.team.name}"的角色已变更为${roleText}`,
            resourceType: 'team' as any,
            resourceId: teamId,
          });

          // WebSocket 推送通知
          const io = fastify.io;
          if (io) {
            io.to(`user:${memberWithDetails.userId}`).emit('notification_received', {
              type: 'role_changed',
              title: '团队角色变更',
              content: `您在团队"${memberWithDetails.team.name}"的角色已变更为${roleText}`,
            });

            // 广播成员角色变更事件
            io.emit('team_member_role_changed', {
              teamId,
              memberId,
              role: validatedData.role,
              member: updatedMember,
            });
          }
        }

        reply.send({
          success: true,
          data: updatedMember,
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
   * 邀请成员
   * POST /api/teams/:teamId/invitations
   */
  fastify.post<{
    Params: { teamId: string };
    Body: InviteMembersInput;
  }>(
    '/teams/:teamId/invitations',
    {
      preHandler: [authMiddleware, requireTeamOwner],
      schema: {
        description: '邀请成员加入团队',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['emails'],
          properties: {
            emails: {
              type: 'array',
              items: { type: 'string', format: 'email' },
              minItems: 1,
              maxItems: 50,
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId } = request.params;
        const userId = request.user!.userId;

        // 验证输入
        const validatedData = inviteMembersSchema.parse(request.body);

        const invitations = await teamService.inviteMembers(
          teamId,
          userId,
          validatedData
        );

        // 获取团队信息
        const team = await prisma.team.findUnique({
          where: { id: teamId },
        });

        // 为每个被邀请的已注册用户发送WebSocket通知
        const io = fastify.io;
        if (io && team) {
          for (const invitation of invitations) {
            if (invitation.invitedUserId) {
              // 发送WebSocket通知
              io.to(`user:${invitation.invitedUserId}`).emit('notification_received', {
                type: 'team_invitation',
                title: '团队邀请',
                content: `您收到了加入团队"${team.name}"的邀请`,
                resourceType: 'invitation',
                resourceId: invitation.id,
              });
            }
          }
        }

        // WebSocket 广播邀请发送事件
        if (io) {
          io.emit('team_invitations_sent', {
            teamId,
            invitations,
            count: invitations.length,
          });
        }

        reply.status(201).send({
          success: true,
          data: {
            invitations,
            count: invitations.length,
          },
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
   * 获取团队的邀请列表
   * GET /api/teams/:teamId/invitations
   */
  fastify.get<{
    Params: { teamId: string };
  }>(
    '/teams/:teamId/invitations',
    {
      preHandler: [authMiddleware, requireTeamOwner],
      schema: {
        description: '获取团队的邀请列表',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { teamId } = request.params;
        const userId = request.user!.userId;

        const invitations = await teamService.getTeamInvitations(teamId, userId);

        reply.send({
          success: true,
          data: invitations,
        });
      } catch (error: any) {
        reply.status(error.statusCode || 500).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * 获取成员的项目权限列表
   * GET /api/teams/:teamId/members/:memberId/permissions
   */
  fastify.get<{
    Params: { teamId: string; memberId: string };
  }>(
    '/teams/:teamId/members/:memberId/permissions',
    {
      preHandler: [authMiddleware, requireTeamMember],
      schema: {
        description: '获取成员的项目权限列表',
        tags: ['团队'],
        params: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            memberId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { memberId } = request.params;

        const permissions = await teamService.getMemberPermissions(memberId);

        reply.send({
          success: true,
          data: permissions,
        });
      } catch (error: any) {
        reply.status(error.statusCode || 500).send({
          success: false,
          error: error.message,
        });
      }
    }
  );
}
