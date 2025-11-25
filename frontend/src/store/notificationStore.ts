/**
 * 通知状态管理
 *
 * 管理用户通知列表、未读数量等
 */

import { create } from 'zustand';
import { toast } from '../components/ui/Toast';
import notificationService from '../services/notificationService';
import {
  Notification,
  NotificationsResponse,
  GetNotificationsOptions,
} from '../types/notificationTypes';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (options?: GetNotificationsOptions) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,

  /**
   * 获取通知列表
   */
  fetchNotifications: async (options?: GetNotificationsOptions) => {
    set({ isLoading: true, error: null });
    try {
      const response: NotificationsResponse = await notificationService.getNotifications(options);
      set({
        notifications: response.data,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        unreadCount: response.unreadCount,
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error('获取通知列表失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 获取未读通知数量
   */
  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error: any) {
      console.error('获取未读通知数量失败:', error);
    }
  },

  /**
   * 标记通知为已读
   */
  markAsRead: async (notificationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNotification = await notificationService.markAsRead(notificationId);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? updatedNotification : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('标记通知已读失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 全部标记为已读
   */
  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      await notificationService.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));

      toast.success('所有通知已标记为已读');
    } catch (error: any) {
      set({ error: error.message });
      toast.error(error.message || '标记已读失败');
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 删除通知
   */
  deleteNotification: async (notificationId: string) => {
    set({ isLoading: true, error: null });
    try {
      await notificationService.deleteNotification(notificationId);

      set((state) => {
        const notification = state.notifications.find((n) => n.id === notificationId);
        const isUnread = notification && !notification.isRead;

        return {
          notifications: state.notifications.filter((n) => n.id !== notificationId),
          unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          total: Math.max(0, state.total - 1),
        };
      });
    } catch (error: any) {
      set({ error: error.message });
      toast.error(error.message || '删除通知失败');
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 添加新通知（WebSocket推送时调用）
   */
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      total: state.total + 1,
      unreadCount: !notification.isRead ? state.unreadCount + 1 : state.unreadCount,
    }));

    // 显示toast提示
    toast.info(notification.title);
  },

  /**
   * 增加未读数量（WebSocket推送时调用）
   */
  incrementUnreadCount: () => {
    set((state) => ({
      unreadCount: state.unreadCount + 1,
    }));
  },

  /**
   * 减少未读数量
   */
  decrementUnreadCount: () => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
}));
