/**
 * 通知服务
 *
 * 提供通知查询、标记已读等API调用
 */

import { apiService } from '../utils/apiClient';
import { log } from '../utils/env';
import { BaseApiService } from './BaseApiService';
import {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
  GetNotificationsOptions,
} from '../types/notificationTypes';

/**
 * 通知服务类
 */
class NotificationService extends BaseApiService {
  /**
   * 获取通知列表
   * GET /api/notifications
   */
  async getNotifications(options?: GetNotificationsOptions): Promise<NotificationsResponse> {
    try {
      log.debug('获取通知列表:', options);

      const response = await apiService.get<NotificationsResponse>('/notifications', {
        params: options || {},
      });

      log.debug('获取通知列表成功:', response.total);
      return response;
    } catch (error) {
      log.error('获取通知列表失败:', error);

      // 如果服务器不可用，返回空列表
      if (this.isServerUnavailableError(error)) {
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
          unreadCount: 0,
        };
      }

      throw error;
    }
  }

  /**
   * 获取未读通知数量
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(): Promise<number> {
    try {
      log.debug('获取未读通知数量');

      const response = await apiService.get<UnreadCountResponse>('/notifications/unread-count');

      log.debug('获取未读通知数量成功:', response.count);
      return response.count;
    } catch (error) {
      log.error('获取未读通知数量失败:', error);

      // 如果服务器不可用，返回 0
      if (this.isServerUnavailableError(error)) {
        return 0;
      }

      throw error;
    }
  }

  /**
   * 标记通知为已读
   * PUT /api/notifications/:notificationId/read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      log.debug('标记通知为已读:', notificationId);
      const notification = await apiService.put<Notification>(
        `/notifications/${notificationId}/read`
      );
      log.debug('标记通知已读成功');
      return notification;
    } catch (error) {
      log.error('标记通知已读失败:', error);
      throw error;
    }
  }

  /**
   * 批量标记通知为已读
   * POST /api/notifications/mark-read
   */
  async batchMarkAsRead(data?: { notificationIds?: string[] }): Promise<number> {
    try {
      log.debug('批量标记通知已读:', data);
      const result = await apiService.post<{ count: number }>(
        '/notifications/mark-read',
        data || {}
      );
      log.debug('批量标记通知已读成功:', result.count);
      return result.count;
    } catch (error) {
      log.error('批量标记通知已读失败:', error);
      throw error;
    }
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(): Promise<number> {
    return this.batchMarkAsRead();
  }

  /**
   * 删除通知
   * DELETE /api/notifications/:notificationId
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      log.debug('删除通知:', notificationId);
      await apiService.delete(`/notifications/${notificationId}`);
      log.debug('删除通知成功');
    } catch (error) {
      log.error('删除通知失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const notificationService = new NotificationService();
export default notificationService;
