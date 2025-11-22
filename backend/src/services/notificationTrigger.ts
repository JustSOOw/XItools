import { notificationService } from './notificationService.js';
import {
  NotificationType,
  ResourceType,
  NOTIFICATION_TEMPLATES,
} from '../types/notificationTypes.js';
import { getIo } from '../utils/socket.js';

/**
 * 通知触发器 - 在各种事件发生时创建并推送通知
 */
export class NotificationTrigger {
  /**
   * 任务被分配 - 通知所有负责人
   */
  static async taskAssigned(params: {
    taskId: string;
    taskTitle: string;
    assignees: string[];
    assignerId?: string;
    assignerName?: string;
  }) {
    const { taskId, taskTitle, assignees, assignerId, assignerName } = params;

    // 过滤掉分配者自己（不需要通知）
    const notifyUsers = assignerId
      ? assignees.filter(userId => userId !== assignerId)
      : assignees;

    if (notifyUsers.length === 0) return;

    const template = NOTIFICATION_TEMPLATES[NotificationType.TASK_ASSIGNED];
    const content = template.contentTemplate({ taskTitle, assignerName });

    // 批量创建通知
    const notifications = await notificationService.createNotifications(
      notifyUsers.map(userId => ({
        userId,
        type: NotificationType.TASK_ASSIGNED,
        title: template.title,
        content,
        resourceType: ResourceType.TASK,
        resourceId: taskId,
      }))
    );

    // WebSocket 实时推送
    const io = getIo();
    for (const notification of notifications) {
      io.to(`user:${notification.userId}`).emit('notification:new', notification);

      // 同时更新未读数量
      const unreadCount = await notificationService.getUnreadCount(notification.userId);
      io.to(`user:${notification.userId}`).emit('notification:unread_count', unreadCount);
    }
  }

  /**
   * 任务被评论 - 通知任务创建者和所有负责人
   */
  static async taskCommented(params: {
    taskId: string;
    taskTitle: string;
    taskOwnerId: string;
    assignees: string[];
    commenterId: string;
    commenterName: string;
  }) {
    const { taskId, taskTitle, taskOwnerId, assignees, commenterId, commenterName } = params;

    // 收集需要通知的用户（任务创建者 + 所有负责人，排除评论者自己）
    const notifyUsers = [taskOwnerId, ...assignees].filter(
      userId => userId !== commenterId
    );

    // 去重
    const uniqueUsers = [...new Set(notifyUsers)];

    if (uniqueUsers.length === 0) return;

    const template = NOTIFICATION_TEMPLATES[NotificationType.TASK_COMMENTED];
    const content = template.contentTemplate({ taskTitle, commenterName });

    // 批量创建通知
    const notifications = await notificationService.createNotifications(
      uniqueUsers.map(userId => ({
        userId,
        type: NotificationType.TASK_COMMENTED,
        title: template.title,
        content,
        resourceType: ResourceType.TASK,
        resourceId: taskId,
      }))
    );

    // WebSocket 实时推送
    const io = getIo();
    for (const notification of notifications) {
      io.to(`user:${notification.userId}`).emit('notification:new', notification);

      // 同时更新未读数量
      const unreadCount = await notificationService.getUnreadCount(notification.userId);
      io.to(`user:${notification.userId}`).emit('notification:unread_count', unreadCount);
    }
  }

  /**
   * 收到团队邀请
   */
  static async teamInvitation(params: {
    invitationId: string;
    invitedUserId: string;
    teamName: string;
    inviterName: string;
  }) {
    const { invitationId, invitedUserId, teamName, inviterName } = params;

    const template = NOTIFICATION_TEMPLATES[NotificationType.TEAM_INVITATION];
    const content = template.contentTemplate({ teamName, inviterName });

    const notification = await notificationService.createNotification({
      userId: invitedUserId,
      type: NotificationType.TEAM_INVITATION,
      title: template.title,
      content,
      resourceType: ResourceType.INVITATION,
      resourceId: invitationId,
    });

    // WebSocket 实时推送
    const io = getIo();
    io.to(`user:${invitedUserId}`).emit('notification:new', notification);

    // 同时更新未读数量
    const unreadCount = await notificationService.getUnreadCount(invitedUserId);
    io.to(`user:${invitedUserId}`).emit('notification:unread_count', unreadCount);
  }

  /**
   * 邀请被接受 - 通知团队管理员
   */
  static async invitationAccepted(params: {
    teamId: string;
    teamName: string;
    teamOwnerId: string;
    userName: string;
  }) {
    const { teamId, teamName, teamOwnerId, userName } = params;

    const template = NOTIFICATION_TEMPLATES[NotificationType.INVITATION_ACCEPTED];
    const content = template.contentTemplate({ userName, teamName });

    const notification = await notificationService.createNotification({
      userId: teamOwnerId,
      type: NotificationType.INVITATION_ACCEPTED,
      title: template.title,
      content,
      resourceType: ResourceType.TEAM,
      resourceId: teamId,
    });

    // WebSocket 实时推送
    const io = getIo();
    io.to(`user:${teamOwnerId}`).emit('notification:new', notification);

    // 同时更新未读数量
    const unreadCount = await notificationService.getUnreadCount(teamOwnerId);
    io.to(`user:${teamOwnerId}`).emit('notification:unread_count', unreadCount);
  }

  /**
   * 项目权限变更 - 通知成员
   */
  static async permissionChanged(params: {
    projectId: string;
    projectName: string;
    userId: string;
    permission: 'view' | 'edit';
  }) {
    const { projectId, projectName, userId, permission } = params;

    const template = NOTIFICATION_TEMPLATES[NotificationType.PERMISSION_CHANGED];
    const content = template.contentTemplate({ projectName, permission });

    const notification = await notificationService.createNotification({
      userId,
      type: NotificationType.PERMISSION_CHANGED,
      title: template.title,
      content,
      resourceType: ResourceType.PROJECT,
      resourceId: projectId,
    });

    // WebSocket 实时推送
    const io = getIo();
    io.to(`user:${userId}`).emit('notification:new', notification);

    // 同时更新未读数量
    const unreadCount = await notificationService.getUnreadCount(userId);
    io.to(`user:${userId}`).emit('notification:unread_count', unreadCount);
  }

  /**
   * 成员加入团队 - 通知所有团队成员（除了新成员）
   */
  static async memberJoined(params: {
    teamId: string;
    teamName: string;
    newMemberId: string;
    userName: string;
    existingMemberIds: string[];
  }) {
    const { teamId, teamName, newMemberId, userName, existingMemberIds } = params;

    // 排除新成员自己
    const notifyUsers = existingMemberIds.filter(userId => userId !== newMemberId);

    if (notifyUsers.length === 0) return;

    const template = NOTIFICATION_TEMPLATES[NotificationType.MEMBER_JOINED];
    const content = template.contentTemplate({ userName, teamName });

    // 批量创建通知
    const notifications = await notificationService.createNotifications(
      notifyUsers.map(userId => ({
        userId,
        type: NotificationType.MEMBER_JOINED,
        title: template.title,
        content,
        resourceType: ResourceType.TEAM,
        resourceId: teamId,
      }))
    );

    // WebSocket 实时推送
    const io = getIo();
    for (const notification of notifications) {
      io.to(`user:${notification.userId}`).emit('notification:new', notification);

      // 同时更新未读数量
      const unreadCount = await notificationService.getUnreadCount(notification.userId);
      io.to(`user:${notification.userId}`).emit('notification:unread_count', unreadCount);
    }

    // 同时广播到团队房间
    io.to(`team:${teamId}`).emit('team:member_joined', {
      userName,
      teamName,
    });
  }

  /**
   * 成员离开团队 - 通知所有剩余团队成员
   */
  static async memberLeft(params: {
    teamId: string;
    teamName: string;
    userName: string;
    remainingMemberIds: string[];
  }) {
    const { teamId, teamName, userName, remainingMemberIds } = params;

    if (remainingMemberIds.length === 0) return;

    const template = NOTIFICATION_TEMPLATES[NotificationType.MEMBER_LEFT];
    const content = template.contentTemplate({ userName, teamName });

    // 批量创建通知
    const notifications = await notificationService.createNotifications(
      remainingMemberIds.map(userId => ({
        userId,
        type: NotificationType.MEMBER_LEFT,
        title: template.title,
        content,
        resourceType: ResourceType.TEAM,
        resourceId: teamId,
      }))
    );

    // WebSocket 实时推送
    const io = getIo();
    for (const notification of notifications) {
      io.to(`user:${notification.userId}`).emit('notification:new', notification);

      // 同时更新未读数量
      const unreadCount = await notificationService.getUnreadCount(notification.userId);
      io.to(`user:${notification.userId}`).emit('notification:unread_count', unreadCount);
    }

    // 同时广播到团队房间
    io.to(`team:${teamId}`).emit('team:member_left', {
      userName,
      teamName,
    });
  }
}

// 导出便捷访问
export const notificationTrigger = NotificationTrigger;
