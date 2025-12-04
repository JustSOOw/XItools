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
      const comment = await apiService.post<TaskComment>(`/tasks/${taskId}/comments`, data);
      log.debug('创建评论成功');
      return comment;
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
      // 后端返回分页格式 { comments: [...], total, page, pageSize, totalPages }
      const result = await apiService.get<{ comments: TaskComment[]; total: number; page: number; pageSize: number; totalPages: number }>(`/tasks/${taskId}/comments`, {
        params: query || {},
      });
      // 从分页结果中提取评论数组
      const comments = result?.comments || [];
      log.debug('获取评论列表成功:', comments.length);
      return comments;
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
      await apiService.delete(`/comments/${commentId}`);
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
