import { z } from 'zod';

/**
 * 评论创建 DTO
 */
export const createCommentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, '评论内容不能为空')
    .max(2000, '评论内容不能超过2000个字符')
    .transform(content => content.replace(/<[^>]*>/g, '')), // 移除所有 HTML 标签（XSS 防护）
});

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;

/**
 * 评论响应 DTO
 */
export interface CommentResponseDTO {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

/**
 * 评论列表查询参数
 */
export const getCommentsQuerySchema = z.object({
  taskId: z.string().uuid('任务ID格式无效'),
  includeDeleted: z.boolean().optional().default(false),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(50),
});

export type GetCommentsQueryDTO = z.infer<typeof getCommentsQuerySchema>;

/**
 * 评论列表响应 DTO
 */
export interface CommentsListResponseDTO {
  comments: CommentResponseDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 删除评论权限检查结果
 */
export interface DeleteCommentPermissionResult {
  canDelete: boolean;
  reason?: string;
}
