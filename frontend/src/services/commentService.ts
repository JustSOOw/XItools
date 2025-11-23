/**
 * 任务评论服务
 *
 * 提供评论创建、查询、删除等API调用
 */

import { apiService } from '../utils/apiClient';
import { log } from '../utils/env';
import { BaseApiService } from './BaseApiService';
import {
  TaskComment,
  CreateCommentInput,
  GetCommentsQuery,
  CreateCommentResponse,
  GetCommentsResponse,
  DeleteCommentResponse,
} from '../types/commentTypes';

/**
 * 评论服务类
 */
class CommentService extends BaseApiService {
  /**
   * 创建评论
   * POST /api/tasks/:taskId/comments
   */
  async createComment(taskId: string, content: string): Promise<TaskComment> {
    try {
      log.debug('创建评论:', { taskId, content });

      const data: CreateCommentInput = { content };
      const response = await apiService.post<CreateCommentResponse>(
        `/tasks/${taskId}/comments`,
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || '创建评论失败');
      }

      log.debug('创建评论成功');
      return response.data;
    } catch (error) {
      log.error('创建评论失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务的评论列表
   * GET /api/tasks/:taskId/comments
   */
  async getCommentsByTask(taskId: string, query?: GetCommentsQuery): Promise<TaskComment[]> {
    try {
      log.debug('获取任务评论列表:', { taskId, query });

      const response = await apiService.get<GetCommentsResponse>(`/tasks/${taskId}/comments`, {
        params: query || {},
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || '获取评论列表失败');
      }

      log.debug('获取评论列表成功:', response.data.length);
      return response.data;
    } catch (error) {
      log.error('获取任务评论列表失败:', error);

      // 如果服务器不可用，返回空数组
      if (this.isServerUnavailableError(error)) {
        return [];
      }

      throw error;
    }
  }

  /**
   * 删除评论
   * DELETE /api/comments/:commentId
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      log.debug('删除评论:', commentId);

      const response = await apiService.delete<DeleteCommentResponse>(`/comments/${commentId}`);

      if (!response.success) {
        throw new Error(response.error || '删除评论失败');
      }

      log.debug('删除评论成功');
    } catch (error) {
      log.error('删除评论失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const commentService = new CommentService();
export default commentService;
