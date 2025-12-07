import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { notificationService } from '../services/notificationService.js';
import {
  getNotificationsQuerySchema,
  markAsReadSchema,
  batchMarkAsReadSchema,
  deleteNotificationSchema,
  GetNotificationsOptions,
} from '../types/notificationTypes.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

/**
 * 通知路由
 */
export async function notificationRoutes(server: FastifyInstance) {
  /**
   * GET /api/notifications
   * 获取当前用户的通知列表
   */
  server.get(
    '/api/notifications',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '获取通知列表',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            pageSize: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            isRead: { type: 'string', enum: ['true', 'false'] },
            type: { type: 'string' },
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
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        type: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        resourceType: { type: 'string', nullable: true },
                        resourceId: { type: 'string', nullable: true },
                        isRead: { type: 'boolean' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                      },
                    },
                  },
                  total: { type: 'number' },
                  page: { type: 'number' },
                  pageSize: { type: 'number' },
                  totalPages: { type: 'number' },
                  unreadCount: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request,
      reply: FastifyReply
    ) => {
      const userId = request.user!.userId;

      // 验证查询参数
      const validatedQuery = getNotificationsQuerySchema.parse(request.query);

      const options: GetNotificationsOptions = {
        page: validatedQuery.page,
        pageSize: validatedQuery.pageSize,
        isRead: validatedQuery.isRead,
        type: validatedQuery.type,
      };

      const result = await notificationService.getUserNotifications(userId, options);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /api/notifications/unread-count
   * 获取未读通知数量
   */
  server.get(
    '/api/notifications/unread-count',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '获取未读通知数量',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  count: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      const count = await notificationService.getUnreadCount(userId);

      return reply.status(200).send({
        success: true,
        data: { count },
      });
    }
  );

  /**
   * PUT /api/notifications/:notificationId/read
   * 标记单个通知为已读
   */
  server.put(
    '/api/notifications/:notificationId/read',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '标记通知为已读',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['notificationId'],
          properties: {
            notificationId: { type: 'string', format: 'uuid' },
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
                  userId: { type: 'string' },
                  type: { type: 'string' },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  resourceType: { type: 'string', nullable: true },
                  resourceId: { type: 'string', nullable: true },
                  isRead: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request,
      reply: FastifyReply
    ) => {
      const userId = request.user!.userId;
      const { notificationId } = request.params as { notificationId: string };

      // 验证参数
      markAsReadSchema.parse({ notificationId });

      try {
        const notification = await notificationService.markAsRead(notificationId, userId);
        return reply.status(200).send({
          success: true,
          data: notification,
        });
      } catch (error: any) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * POST /api/notifications/mark-read
   * 批量标记通知为已读（可选提供 notificationIds，否则标记所有未读）
   */
  server.post(
    '/api/notifications/mark-read',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '批量标记通知为已读',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            notificationIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
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
                  count: { type: 'number' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request,
      reply: FastifyReply
    ) => {
      const userId = request.user!.userId;
      const { notificationIds } = request.body as { notificationIds?: string[] };

      // 验证参数
      batchMarkAsReadSchema.parse({ notificationIds });

      const result = notificationIds
        ? await notificationService.batchMarkAsRead(userId, notificationIds)
        : await notificationService.markAllAsRead(userId);

      return reply.status(200).send({
        success: true,
        data: {
          count: result.count,
          message: `成功标记 ${result.count} 条通知为已读`,
        },
      });
    }
  );

  /**
   * DELETE /api/notifications/:notificationId
   * 删除单个通知
   */
  server.delete(
    '/api/notifications/:notificationId',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '删除通知',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['notificationId'],
          properties: {
            notificationId: { type: 'string', format: 'uuid' },
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
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request,
      reply: FastifyReply
    ) => {
      const userId = request.user!.userId;
      const { notificationId } = request.params as { notificationId: string };

      // 验证参数
      deleteNotificationSchema.parse({ notificationId });

      try {
        await notificationService.deleteNotification(notificationId, userId);
        return reply.status(200).send({
          success: true,
          data: {
            message: '通知已删除',
          },
        });
      } catch (error: any) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * DELETE /api/notifications/read
   * 删除所有已读通知
   */
  server.delete(
    '/api/notifications/read',
    {
      preHandler: [authMiddleware],
      schema: {
        description: '删除所有已读通知',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  count: { type: 'number' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      const result = await notificationService.deleteReadNotifications(userId);

      return reply.status(200).send({
        success: true,
        data: {
          count: result.count,
          message: `成功删除 ${result.count} 条已读通知`,
        },
      });
    }
  );
}
