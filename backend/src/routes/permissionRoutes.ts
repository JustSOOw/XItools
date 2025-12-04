/**
 * 权限管理路由
 *
 * 提供项目权限设置、查询、更新和删除等API端点
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { permissionService } from '../services/permissionService';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireTeamOwnerByProject } from '../middleware/permissionMiddleware';
import {
  setProjectPermissionSchema,
  updateProjectPermissionSchema,
  SetProjectPermissionInput,
  UpdateProjectPermissionInput,
  ProjectPermissionType,
} from '../types/teamTypes';

/**
 * 注册权限相关路由
 */
export default async function permissionRoutes(fastify: FastifyInstance) {
  /**
   * 设置项目权限
   * POST /api/projects/:projectId/permissions
   */
  fastify.post<{
    Params: { projectId: string };
    Body: SetProjectPermissionInput;
  }>(
    '/projects/:projectId/permissions',
    {
      preHandler: [authMiddleware, requireTeamOwnerByProject],
      schema: {
        description: '设置项目权限(仅团队所有者)',
        tags: ['权限'],
        params: {
          type: 'object',
          required: ['projectId'],
          properties: {
            projectId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['memberId', 'permission'],
          properties: {
            memberId: { type: 'string', format: 'uuid', description: '成员ID(TeamMember.id)' },
            permission: { type: 'string', enum: ['view', 'edit'], description: '权限类型' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  permission: { type: 'string' },
                  projectId: { type: 'string' },
                  memberId: { type: 'string' },
                  grantedBy: { type: 'string' },
                  grantedAt: { type: 'string' },
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
        const { projectId } = request.params;

        // 验证输入
        const validatedData = setProjectPermissionSchema.parse(request.body);

        const permission = await permissionService.setProjectPermission(
          projectId,
          validatedData.memberId,
          validatedData.permission,
          userId
        );

        // 获取成员信息和项目信息，用于发送通知
        const member = await prisma.teamMember.findUnique({
          where: { id: validatedData.memberId },
          include: { user: true },
        });

        const project = await prisma.project.findUnique({
          where: { id: projectId },
        });

        if (member && project) {
          // 发送权限变更通知给成员
          const { NotificationService } = await import('../services/notificationService');
          const notificationService = new NotificationService();

          const permissionText = validatedData.permission === 'VIEW' ? '查看' : '编辑';
          await notificationService.createNotification({
            userId: member.userId,
            type: 'permission_changed' as any,
            title: '项目权限变更',
            content: `您在项目"${project.name}"中的权限已更新为：${permissionText}权限`,
            resourceType: 'project' as any,
            resourceId: projectId,
          });

          // WebSocket 推送通知
          const io = fastify.io;
          if (io) {
            io.to(`user:${member.userId}`).emit('notification_received', {
              type: 'permission_changed',
              title: '项目权限变更',
              content: `您在项目"${project.name}"中的权限已更新为：${permissionText}权限`,
            });
          }
        }

        // WebSocket 广播权限授予事件
        const io = fastify.io;
        if (io) {
          io.emit('project_permission_granted', {
            projectId,
            permission,
          });
        }

        reply.send({
          success: true,
          data: permission,
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
   * 更新项目权限
   * PUT /api/projects/:projectId/permissions/:permissionId
   */
  fastify.put<{
    Params: { projectId: string; permissionId: string };
    Body: UpdateProjectPermissionInput;
  }>(
    '/projects/:projectId/permissions/:permissionId',
    {
      preHandler: [authMiddleware, requireTeamOwnerByProject],
      schema: {
        description: '更新项目权限(仅团队所有者)',
        tags: ['权限'],
        params: {
          type: 'object',
          required: ['projectId', 'permissionId'],
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            permissionId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['permission'],
          properties: {
            permission: { type: 'string', enum: ['view', 'edit'] },
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
        const { permissionId } = request.params;

        // 验证输入
        const validatedData = updateProjectPermissionSchema.parse(request.body);

        const permission = await permissionService.updateProjectPermission(
          permissionId,
          validatedData.permission
        );

        // 获取权限详情，用于发送通知
        const permissionWithDetails = await prisma.projectPermission.findUnique({
          where: { id: permissionId },
          include: {
            member: {
              include: { user: true },
            },
            project: true,
          },
        });

        if (permissionWithDetails) {
          // 发送权限变更通知给成员
          const { NotificationService } = await import('../services/notificationService');
          const notificationService = new NotificationService();

          const permissionText = validatedData.permission === 'VIEW' ? '查看' : '编辑';
          await notificationService.createNotification({
            userId: permissionWithDetails.member.userId,
            type: 'permission_changed' as any,
            title: '项目权限变更',
            content: `您在项目"${permissionWithDetails.project.name}"中的权限已更新为：${permissionText}权限`,
            resourceType: 'project' as any,
            resourceId: permissionWithDetails.projectId,
          });

          // WebSocket 推送通知
          const io = fastify.io;
          if (io) {
            io.to(`user:${permissionWithDetails.member.userId}`).emit('notification_received', {
              type: 'permission_changed',
              title: '项目权限变更',
              content: `您在项目"${permissionWithDetails.project.name}"中的权限已更新为：${permissionText}权限`,
            });
          }
        }

        // WebSocket 广播权限更新事件
        const io = fastify.io;
        if (io) {
          io.emit('project_permission_updated', {
            permissionId,
            permission,
          });
        }

        reply.send({
          success: true,
          data: permission,
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
   * 移除项目权限
   * DELETE /api/projects/:projectId/permissions/:permissionId
   */
  fastify.delete<{
    Params: { projectId: string; permissionId: string };
  }>(
    '/projects/:projectId/permissions/:permissionId',
    {
      preHandler: [authMiddleware, requireTeamOwnerByProject],
      schema: {
        description: '移除项目权限(仅团队所有者)',
        tags: ['权限'],
        params: {
          type: 'object',
          required: ['projectId', 'permissionId'],
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            permissionId: { type: 'string', format: 'uuid' },
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
        const { projectId, permissionId } = request.params;

        // 在删除前获取权限详情，用于发送通知
        const permissionWithDetails = await prisma.projectPermission.findUnique({
          where: { id: permissionId },
          include: {
            member: {
              include: { user: true },
            },
            project: true,
          },
        });

        await permissionService.removeProjectPermission(permissionId);

        if (permissionWithDetails) {
          // 发送权限撤销通知给成员
          const { NotificationService } = await import('../services/notificationService');
          const notificationService = new NotificationService();

          await notificationService.createNotification({
            userId: permissionWithDetails.member.userId,
            type: 'permission_changed' as any,
            title: '项目权限变更',
            content: `您在项目"${permissionWithDetails.project.name}"中的权限已被撤销`,
            resourceType: 'project' as any,
            resourceId: permissionWithDetails.projectId,
          });

          // WebSocket 推送通知
          const io = fastify.io;
          if (io) {
            io.to(`user:${permissionWithDetails.member.userId}`).emit('notification_received', {
              type: 'permission_changed',
              title: '项目权限变更',
              content: `您在项目"${permissionWithDetails.project.name}"中的权限已被撤销`,
            });
          }
        }

        // WebSocket 广播权限移除事件
        const io = fastify.io;
        if (io) {
          io.emit('project_permission_revoked', {
            projectId,
            permissionId,
          });
        }

        reply.send({
          success: true,
          message: '权限已移除',
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
   * 获取项目的所有权限
   * GET /api/projects/:projectId/permissions
   */
  fastify.get<{
    Params: { projectId: string };
  }>(
    '/projects/:projectId/permissions',
    {
      preHandler: [authMiddleware, requireTeamOwnerByProject],
      schema: {
        description: '获取项目的所有权限(仅团队所有者)',
        tags: ['权限'],
        params: {
          type: 'object',
          required: ['projectId'],
          properties: {
            projectId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    permission: { type: 'string' },
                    projectId: { type: 'string' },
                    memberId: { type: 'string' },
                    grantedBy: { type: 'string' },
                    grantedAt: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { projectId } = request.params;

        const permissions = await permissionService.getProjectPermissions(projectId);

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

  /**
   * 获取成员的所有项目权限
   * GET /api/members/:memberId/permissions
   */
  fastify.get<{
    Params: { memberId: string };
  }>(
    '/members/:memberId/permissions',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '获取成员的所有项目权限',
        tags: ['权限'],
        params: {
          type: 'object',
          required: ['memberId'],
          properties: {
            memberId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: { type: 'object' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { memberId } = request.params;

        const permissions = await permissionService.getMemberProjectPermissions(memberId);

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
