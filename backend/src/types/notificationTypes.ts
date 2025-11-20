import { z } from 'zod';

/**
 * 通知类型枚举
 */
export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',             // 任务被分配
  TASK_COMMENTED = 'task_commented',           // 任务被评论
  TEAM_INVITATION = 'team_invitation',         // 收到团队邀请
  INVITATION_ACCEPTED = 'invitation_accepted', // 邀请被接受
  PERMISSION_CHANGED = 'permission_changed',   // 权限变更
  MEMBER_JOINED = 'member_joined',             // 成员加入
  MEMBER_LEFT = 'member_left',                 // 成员离开
}

/**
 * 资源类型枚举
 */
export enum ResourceType {
  TASK = 'task',
  PROJECT = 'project',
  TEAM = 'team',
  INVITATION = 'invitation',
}

/**
 * 通知 DTO
 */
export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  resourceType?: ResourceType;
  resourceId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建通知的输入数据
 */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  resourceType?: ResourceType;
  resourceId?: string;
}

/**
 * 查询通知的选项
 */
export interface GetNotificationsOptions {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
  type?: NotificationType;
}

/**
 * 通知列表响应
 */
export interface NotificationsResponse {
  data: NotificationDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
}

/**
 * Zod Schemas
 */

// 创建通知的验证 schema
export const createNotificationSchema = z.object({
  userId: z.string().uuid('用户ID必须是有效的UUID'),
  type: z.nativeEnum(NotificationType, {
    errorMap: () => ({ message: '无效的通知类型' })
  }),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  content: z.string().min(1, '内容不能为空').max(1000, '内容不能超过1000个字符'),
  resourceType: z.nativeEnum(ResourceType, {
    errorMap: () => ({ message: '无效的资源类型' })
  }).optional(),
  resourceId: z.string().uuid('资源ID必须是有效的UUID').optional(),
});

// 查询通知的验证 schema
export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, '页码必须大于等于1').optional().default(1),
  pageSize: z.coerce.number().int().min(1, '每页数量必须大于等于1').max(100, '每页数量不能超过100').optional().default(20),
  isRead: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  type: z.nativeEnum(NotificationType, {
    errorMap: () => ({ message: '无效的通知类型' })
  }).optional(),
});

// 标记通知为已读的验证 schema
export const markAsReadSchema = z.object({
  notificationId: z.string().uuid('通知ID必须是有效的UUID'),
});

// 批量标记已读的验证 schema
export const batchMarkAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid('通知ID必须是有效的UUID')).min(1, '至少需要一个通知ID').optional(),
});

// 删除通知的验证 schema
export const deleteNotificationSchema = z.object({
  notificationId: z.string().uuid('通知ID必须是有效的UUID'),
});

/**
 * 通知事件映射 - 用于生成通知内容
 */
export const NOTIFICATION_TEMPLATES = {
  [NotificationType.TASK_ASSIGNED]: {
    title: '任务分配给您',
    contentTemplate: (data: { taskTitle: string; assignerName?: string }) =>
      data.assignerName
        ? `${data.assignerName} 将任务"${data.taskTitle}"分配给您`
        : `任务"${data.taskTitle}"已分配给您`,
  },
  [NotificationType.TASK_COMMENTED]: {
    title: '任务有新评论',
    contentTemplate: (data: { taskTitle: string; commenterName: string }) =>
      `${data.commenterName} 评论了任务"${data.taskTitle}"`,
  },
  [NotificationType.TEAM_INVITATION]: {
    title: '团队邀请',
    contentTemplate: (data: { teamName: string; inviterName: string }) =>
      `${data.inviterName} 邀请您加入团队"${data.teamName}"`,
  },
  [NotificationType.INVITATION_ACCEPTED]: {
    title: '邀请已接受',
    contentTemplate: (data: { userName: string; teamName: string }) =>
      `${data.userName} 已接受邀请，加入团队"${data.teamName}"`,
  },
  [NotificationType.PERMISSION_CHANGED]: {
    title: '项目权限变更',
    contentTemplate: (data: { projectName: string; permission: string }) =>
      `您在项目"${data.projectName}"的权限已变更为${permission === 'edit' ? '编辑' : '查看'}权限`,
  },
  [NotificationType.MEMBER_JOINED]: {
    title: '新成员加入',
    contentTemplate: (data: { userName: string; teamName: string }) =>
      `${data.userName} 加入了团队"${data.teamName}"`,
  },
  [NotificationType.MEMBER_LEFT]: {
    title: '成员离开',
    contentTemplate: (data: { userName: string; teamName: string }) =>
      `${data.userName} 离开了团队"${data.teamName}"`,
  },
};
