/**
 * 任务评论相关类型定义
 *
 * 注意：前端类型中的 Date 字段均为 string 类型（JSON 序列化后的格式）
 */

// ================================
// 基础类型
// ================================

/**
 * 任务评论
 */
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

// ================================
// 请求参数类型
// ================================

/**
 * 创建评论的输入数据
 */
export interface CreateCommentInput {
  content: string;
}

/**
 * 评论列表查询参数
 */
export interface GetCommentsQuery {
  taskId: string;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

// ================================
// API 响应类型
// ================================

/**
 * API 通用响应
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 评论列表响应
 */
export interface CommentsListResponse {
  comments: TaskComment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 创建评论响应
 */
export interface CreateCommentResponse extends ApiResponse<TaskComment> {}

/**
 * 获取评论列表响应
 */
export interface GetCommentsResponse extends ApiResponse<TaskComment[]> {}

/**
 * 删除评论响应
 */
export interface DeleteCommentResponse extends ApiResponse {}

// ================================
// WebSocket 事件类型
// ================================

/**
 * 评论创建事件数据
 */
export interface CommentCreatedEvent {
  comment: TaskComment;
  taskId: string;
}

/**
 * 评论删除事件数据
 */
export interface CommentDeletedEvent {
  commentId: string;
  taskId: string;
}
