/**
 * 通知系统相关类型定义
 *
 * 注意：前端类型中的 Date 字段均为 string 类型（JSON 序列化后的格式）
 */

// ================================
// 枚举类型
// ================================

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

// ================================
// 基础类型
// ================================

/**
 * 通知
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  resourceType?: ResourceType;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

// ================================
// 请求参数类型
// ================================

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
 * 批量标记已读的输入数据
 */
export interface BatchMarkAsReadInput {
  notificationIds?: string[];
}

// ================================
// API 响应类型
// ================================

/**
 * API 通用响应
 */
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 通知列表响应
 */
export interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
}

/**
 * 未读数量响应
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * 标记已读响应
 */
export interface MarkAsReadResponse extends ApiResponse<Notification> {}

/**
 * 批量标记已读响应
 */
export interface BatchMarkAsReadResponse extends ApiResponse<{
  count: number;
}> {}

/**
 * 删除通知响应
 */
export interface DeleteNotificationResponse extends ApiResponse {}

// ================================
// 通知模板
// ================================

/**
 * 通知模板数据接口
 */
export interface NotificationTemplateData {
  taskTitle?: string;
  assignerName?: string;
  commenterName?: string;
  teamName?: string;
  inviterName?: string;
  userName?: string;
  projectName?: string;
  permission?: string;
}
