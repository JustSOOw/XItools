/**
 * 评论管理路由
 */

import { FastifyInstance } from 'fastify';
import { commentService } from '../services/commentService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createOwnershipOrPermissionVerifier } from '../middleware/permissionMiddleware.js';
import { ProjectPermissionType } from '../types/teamTypes.js';
import {
  createCommentSchema,
  getCommentsQuerySchema,
} from '../types/commentTypes.js';

export default async function commentRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/tasks/:taskId/comments
   * 添加评论
   * 权限要求：需要对任务所在项目有查看权限
   */
  fastify.post(
    '/tasks/:taskId/comments',
    {
      preHandler: [
        authMiddleware,
        createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW),
      ],
    },
    async (request, reply) => {
      try {
        const { taskId } = request.params as { taskId: string };
        const userId = request.user?.userId;
        const body = request.body as any;

        // 验证请求体
        const validatedData = createCommentSchema.parse(body);

        // 创建评论
        const comment = await commentService.createComment(
          taskId,
          userId,
          validatedData.content
        );

        // WebSocket 广播评论创建事件
        const io = fastify.io;
        if (io) {
          // 广播到任务所在的看板房间
          io.emit('comment_created', {
            comment,
            taskId,
          });
        }

        reply.status(201);
        return {
          success: true,
          data: comment,
        };
      } catch (error: any) {
        console.error('创建评论失败:', error);

        if (error.name === 'ZodError') {
          reply.status(400);
          return {
            success: false,
            error: '请求参数验证失败',
            details: error.errors,
          };
        }

        reply.status(500);
        return {
          success: false,
          error: error.message || '创建评论失败',
        };
      }
    }
  );

  /**
   * GET /api/tasks/:taskId/comments
   * 获取任务的评论列表
   * 权限要求：需要对任务所在项目有查看权限
   */
  fastify.get(
    '/tasks/:taskId/comments',
    {
      preHandler: [
        authMiddleware,
        createOwnershipOrPermissionVerifier(ProjectPermissionType.VIEW),
      ],
    },
    async (request, reply) => {
      try {
        const { taskId } = request.params as { taskId: string };
        const query = request.query as any;

        // 构建查询参数
        const queryParams = {
          taskId,
          includeDeleted: query.includeDeleted === 'true',
          page: query.page ? parseInt(query.page, 10) : 1,
          pageSize: query.pageSize ? parseInt(query.pageSize, 10) : 50,
        };

        // 验证查询参数
        const validatedQuery = getCommentsQuerySchema.parse(queryParams);

        // 获取评论列表
        const result = await commentService.getTaskComments(taskId, {
          includeDeleted: validatedQuery.includeDeleted,
          page: validatedQuery.page,
          pageSize: validatedQuery.pageSize,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        console.error('获取评论列表失败:', error);

        if (error.name === 'ZodError') {
          reply.status(400);
          return {
            success: false,
            error: '请求参数验证失败',
            details: error.errors,
          };
        }

        reply.status(500);
        return {
          success: false,
          error: error.message || '获取评论列表失败',
        };
      }
    }
  );

  /**
   * DELETE /api/comments/:commentId
   * 删除评论（软删除）
   * 权限要求：评论作者或团队管理员
   */
  fastify.delete(
    '/comments/:commentId',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { commentId } = request.params as { commentId: string };
        const userId = request.user!.userId;

        // 获取评论详情（用于 WebSocket 广播）
        const comment = await commentService.getCommentById(commentId);
        if (!comment) {
          reply.status(404);
          return {
            success: false,
            error: '评论不存在',
          };
        }

        // 删除评论（会在内部进行权限检查）
        await commentService.deleteComment(commentId, userId);

        // WebSocket 广播评论删除事件
        const io = fastify.io;
        if (io) {
          io.emit('comment_deleted', {
            commentId,
            taskId: comment.taskId,
          });
        }

        return {
          success: true,
          message: '评论已删除',
        };
      } catch (error: any) {
        console.error('删除评论失败:', error);

        // 权限错误
        if (error.message.includes('权限')) {
          reply.status(403);
          return {
            success: false,
            error: error.message,
          };
        }

        reply.status(500);
        return {
          success: false,
          error: error.message || '删除评论失败',
        };
      }
    }
  );
}
