import { PrismaClient, Notification } from '@prisma/client';
import {
  NotificationDTO,
  CreateNotificationInput,
  GetNotificationsOptions,
  NotificationsResponse,
  NotificationType,
  ResourceType,
} from '../types/notificationTypes.js';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * 创建通知
   */
  async createNotification(input: CreateNotificationInput): Promise<NotificationDTO> {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        content: input.content,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
      },
    });

    return this.mapToDTO(notification);
  }

  /**
   * 批量创建通知
   */
  async createNotifications(inputs: CreateNotificationInput[]): Promise<NotificationDTO[]> {
    const notifications = await prisma.notification.createMany({
      data: inputs,
    });

    // createMany 不返回创建的记录，需要重新查询
    const userIds = [...new Set(inputs.map(input => input.userId))];
    const createdNotifications = await prisma.notification.findMany({
      where: {
        userId: { in: userIds },
        createdAt: {
          gte: new Date(Date.now() - 5000), // 查询最近5秒内创建的
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: inputs.length,
    });

    return createdNotifications.map(this.mapToDTO);
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(
    userId: string,
    options: GetNotificationsOptions = {}
  ): Promise<NotificationsResponse> {
    const {
      page = 1,
      pageSize = 20,
      isRead,
      type,
    } = options;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    if (type) {
      where.type = type;
    }

    // 并行查询通知列表和总数
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      data: notifications.map(this.mapToDTO),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      unreadCount,
    };
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationDTO> {
    // 验证通知归属
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    if (notification.userId !== userId) {
      throw new Error('无权操作此通知');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return this.mapToDTO(updated);
  }

  /**
   * 批量标记通知为已读
   */
  async batchMarkAsRead(
    userId: string,
    notificationIds?: string[]
  ): Promise<{ count: number }> {
    const where: any = { userId, isRead: false };

    // 如果提供了 notificationIds，只标记指定的通知
    if (notificationIds && notificationIds.length > 0) {
      where.id = { in: notificationIds };
    }

    const result = await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    return { count: result.count };
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { count: result.count };
  }

  /**
   * 获取未读数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    // 验证通知归属
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    if (notification.userId !== userId) {
      throw new Error('无权删除此通知');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * 删除用户的所有已读通知
   */
  async deleteReadNotifications(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return { count: result.count };
  }

  /**
   * 清理过期通知（超过30天的已读通知）
   */
  async cleanupOldNotifications(): Promise<{ count: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return { count: result.count };
  }

  /**
   * 辅助方法：将 Prisma 模型转换为 DTO
   */
  private mapToDTO(notification: Notification): NotificationDTO {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type as NotificationType,
      title: notification.title,
      content: notification.content,
      resourceType: notification.resourceType as ResourceType | undefined,
      resourceId: notification.resourceId || undefined,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}

// 导出单例
export const notificationService = new NotificationService();
