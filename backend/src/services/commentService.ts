import { PrismaClient, TaskComment } from '@prisma/client';
import type {
  CreateCommentDTO,
  CommentResponseDTO,
  CommentsListResponseDTO,
  DeleteCommentPermissionResult,
} from '../types/commentTypes.js';

const prisma = new PrismaClient();

/**
 * 评论服务
 * 负责处理任务评论的 CRUD 操作
 */
export class CommentService {
  /**
   * 创建评论
   * @param params 参数对象或 taskId
   * @param userId 用户ID（可选，当第一个参数是对象时）
   * @param content 评论内容（可选，当第一个参数是对象时）
   * @returns 创建的评论
   */
  async createComment(
    paramsOrTaskId: string | { taskId: string; userId: string; content: string },
    userId?: string,
    content?: string
  ): Promise<CommentResponseDTO> {
    // 支持两种调用方式
    let taskId: string;
    let actualUserId: string;
    let actualContent: string;

    if (typeof paramsOrTaskId === 'object') {
      taskId = paramsOrTaskId.taskId;
      actualUserId = paramsOrTaskId.userId;
      actualContent = paramsOrTaskId.content;
    } else {
      taskId = paramsOrTaskId;
      actualUserId = userId!;
      actualContent = content!;
    }

    // 验证评论内容
    if (!actualContent || actualContent.trim() === '') {
      throw new Error('评论内容不能为空');
    }

    if (actualContent.length > 10000) {
      throw new Error('评论内容不能超过10000个字符');
    }

    // 1. 验证任务是否存在
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('任务不存在');
    }

    // 2. 创建评论
    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: actualUserId,
        content: actualContent,
      },
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
    });

    // 3. 更新任务的 updatedAt 时间
    await prisma.task.update({
      where: { id: taskId },
      data: { updatedAt: new Date() },
    });

    return this.toCommentResponse(comment);
  }

  /**
   * 获取任务的评论列表
   * @param taskId 任务ID
   * @param options 查询选项
   * @returns 评论列表
   */
  async getTaskComments(
    taskId: string,
    options: {
      includeDeleted?: boolean;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<CommentsListResponseDTO> {
    const {
      includeDeleted = false,
      page = 1,
      pageSize = 50,
    } = options;

    const where = {
      taskId,
      ...(includeDeleted ? {} : { isDeleted: false }),
    };

    // 并行查询评论列表和总数
    const [comments, total] = await Promise.all([
      prisma.taskComment.findMany({
        where,
        orderBy: { createdAt: 'asc' }, // 评论按时间顺序升序排列
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.taskComment.count({ where }),
    ]);

    return {
      comments: comments.map(comment => this.toCommentResponse(comment)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 删除评论（软删除）
   * @param commentId 评论ID
   * @param userId 操作用户ID
   * @returns 是否成功删除
   */
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    // 1. 获取评论信息
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          include: {
            board: {
              include: {
                workspace: {
                  include: {
                    team: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new Error('评论不存在');
    }

    // 2. 检查删除权限
    const permissionResult = await this.checkCanDeleteComment(commentId, userId);
    if (!permissionResult.canDelete) {
      throw new Error(permissionResult.reason || '没有权限删除此评论');
    }

    // 3. 软删除评论（标记为已删除）
    await prisma.taskComment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    return true;
  }

  /**
   * 检查用户是否有权删除评论
   * @param commentId 评论ID
   * @param userId 用户ID
   * @returns 权限检查结果
   */
  async checkCanDeleteComment(
    commentId: string,
    userId: string
  ): Promise<DeleteCommentPermissionResult> {
    // 1. 获取评论详情
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          include: {
            board: {
              include: {
                workspace: {
                  include: {
                    team: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return {
        canDelete: false,
        reason: '评论不存在',
      };
    }

    // 2. 评论作者可以删除自己的评论
    if (comment.userId === userId) {
      return { canDelete: true };
    }

    // 3. 团队管理员可以删除任何评论
    const workspace = comment.task.board.workspace;
    if (workspace.teamId) {
      const team = workspace.team;
      if (team && team.ownerId === userId) {
        return { canDelete: true };
      }
    }

    // 4. 其他情况：无权限
    return {
      canDelete: false,
      reason: '只有评论作者或团队管理员可以删除评论',
    };
  }

  /**
   * 获取评论详情
   * @param commentId 评论ID
   * @returns 评论详情
   */
  async getCommentById(commentId: string): Promise<CommentResponseDTO | null> {
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
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
    });

    if (!comment) {
      return null;
    }

    return this.toCommentResponse(comment);
  }

  /**
   * 将 Prisma 评论对象转换为 DTO
   * @param comment Prisma 评论对象
   * @returns 评论 DTO
   */
  private toCommentResponse(comment: any): CommentResponseDTO {
    return {
      id: comment.id,
      taskId: comment.taskId,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isDeleted: comment.isDeleted,
      user: comment.user ? {
        id: comment.user.id,
        username: comment.user.username,
        email: comment.user.email,
        avatar: comment.user.avatar,
      } : undefined,
    };
  }
}

// 导出单例
export const commentService = new CommentService();
