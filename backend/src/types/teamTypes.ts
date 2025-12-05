/**
 * 团队协作相关类型定义和 Zod 验证 schemas
 *
 * 包括:
 * - Team (团队)
 * - TeamMember (团队成员)
 * - TeamInvitation (团队邀请)
 * - ProjectPermission (项目权限)
 * - TaskComment (任务评论)
 * - Notification (通知)
 */

import { z } from 'zod';

// ================================
// 团队相关类型
// ================================

/**
 * 团队角色枚举
 * OWNER - 所有者（团队创建者，不可更改）
 * ADMIN - 管理员（可以管理成员和邀请）
 * MEMBER - 成员（可以查看和编辑分配的项目）
 * GUEST - 访客（只读权限）
 */
export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

/**
 * 团队成员状态
 */
export enum TeamMemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * 邀请状态
 */
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/**
 * 项目权限类型
 */
export enum ProjectPermissionType {
  VIEW = 'view',
  EDIT = 'edit',
}

/**
 * 通知类型
 */
export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMMENTED = 'task_commented',
  TEAM_INVITATION = 'team_invitation',
  INVITATION_ACCEPTED = 'invitation_accepted',
  PERMISSION_CHANGED = 'permission_changed',
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',
}

// ================================
// 自定义验证器
// ================================

/**
 * 头像字段验证器
 * 支持两种格式:
 * 1. 标准 URL (https://...)
 * 2. Base64 数据 URL (data:image/...)
 */
const avatarSchema = z.string().refine(
  (val) => {
    // 如果为空或未定义，通过验证（optional 会处理）
    if (!val) return true;
    // 检查是否为 Base64 数据 URL
    if (val.startsWith('data:image/')) return true;
    // 检查是否为有效 URL
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: '头像必须是有效的 URL 或 Base64 图片数据' }
).optional();

// ================================
// Zod 验证 Schemas
// ================================

/**
 * 创建团队的验证 schema
 */
export const createTeamSchema = z.object({
  name: z.string().trim().min(1, '团队名称不能为空').max(100, '团队名称不能超过100个字符'),
  description: z.string().trim().max(500, '团队描述不能超过500个字符').optional(),
  avatar: avatarSchema,
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

/**
 * 更新团队的验证 schema
 */
export const updateTeamSchema = z.object({
  name: z.string().trim().min(1, '团队名称不能为空').max(100, '团队名称不能超过100个字符').optional(),
  description: z.string().trim().max(500, '团队描述不能超过500个字符').optional(),
  avatar: avatarSchema,
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

/**
 * 邀请成员的验证 schema
 */
export const inviteMembersSchema = z.object({
  emails: z.array(
    z.string().email('邮箱格式不正确')
  ).min(1, '至少需要邀请一个成员').max(50, '一次最多邀请50个成员'),
});

export type InviteMembersInput = z.infer<typeof inviteMembersSchema>;

/**
 * 接受邀请的验证 schema
 */
export const acceptInvitationSchema = z.object({
  invitationId: z.string().uuid('邀请ID格式不正确'),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

/**
 * 拒绝邀请的验证 schema
 */
export const rejectInvitationSchema = z.object({
  invitationId: z.string().uuid('邀请ID格式不正确'),
});

export type RejectInvitationInput = z.infer<typeof rejectInvitationSchema>;

/**
 * 更新成员角色的验证 schema
 * 注意：不能将成员角色更新为 OWNER，OWNER 只能通过转让所有权设置
 */
export const updateMemberRoleSchema = z.object({
  role: z.enum([TeamRole.ADMIN, TeamRole.MEMBER, TeamRole.GUEST], {
    errorMap: () => ({ message: '角色必须为 admin、member 或 guest' }),
  }),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

/**
 * 设置项目权限的验证 schema
 */
export const setProjectPermissionSchema = z.object({
  memberId: z.string().uuid('成员ID格式不正确'),
  permission: z.enum([ProjectPermissionType.VIEW, ProjectPermissionType.EDIT], {
    errorMap: () => ({ message: '权限类型必须为 view 或 edit' }),
  }),
});

export type SetProjectPermissionInput = z.infer<typeof setProjectPermissionSchema>;

/**
 * 更新项目权限的验证 schema
 */
export const updateProjectPermissionSchema = z.object({
  permission: z.enum([ProjectPermissionType.VIEW, ProjectPermissionType.EDIT], {
    errorMap: () => ({ message: '权限类型必须为 view 或 edit' }),
  }),
});

export type UpdateProjectPermissionInput = z.infer<typeof updateProjectPermissionSchema>;

/**
 * 创建任务评论的验证 schema
 */
export const createCommentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, '评论内容不能为空')
    .max(2000, '评论内容不能超过2000个字符')
    .transform(content => content.replace(/<[^>]*>/g, '')), // 移除所有 HTML 标签
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/**
 * 创建通知的参数
 */
export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  resourceType?: string;
  resourceId?: string;
}

// ================================
// DTO 类型定义
// ================================

/**
 * 团队 DTO
 */
export interface TeamDTO {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 团队详情 DTO (包含成员信息)
 */
export interface TeamDetailDTO extends TeamDTO {
  memberCount: number;
  members?: TeamMemberDTO[];
}

/**
 * 团队成员 DTO
 */
export interface TeamMemberDTO {
  id: string;
  role: TeamRole;
  status: TeamMemberStatus;
  userId: string;
  teamId: string;
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string | null;
  };
}

/**
 * 团队邀请 DTO
 */
export interface TeamInvitationDTO {
  id: string;
  inviteCode: string;
  invitedEmail: string;
  status: InvitationStatus;
  expiresAt: Date;
  teamId: string;
  inviterId: string;
  invitedUserId?: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 团队邀请详情 DTO (包含团队和邀请者信息)
 */
export interface TeamInvitationDetailDTO extends TeamInvitationDTO {
  team: {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
  };
  inviter: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

/**
 * 项目权限 DTO
 */
export interface ProjectPermissionDTO {
  id: string;
  permission: ProjectPermissionType;
  projectId: string;
  memberId: string;
  grantedBy: string;
  grantedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 任务评论 DTO
 */
export interface TaskCommentDTO {
  id: string;
  content: string;
  isDeleted: boolean;
  taskId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
}

/**
 * 通知 DTO
 */
export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  resourceType?: string;
  resourceId?: string;
  userId: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ================================
// 错误类型
// ================================

/**
 * 团队错误代码
 */
export enum TeamErrorCode {
  TEAM_NOT_FOUND = 'TEAM_NOT_FOUND',
  USER_ALREADY_IN_TEAM = 'USER_ALREADY_IN_TEAM',
  USER_NOT_IN_TEAM = 'USER_NOT_IN_TEAM',
  TEAM_FULL = 'TEAM_FULL',
  NOT_TEAM_OWNER = 'NOT_TEAM_OWNER',
  CANNOT_REMOVE_OWNER = 'CANNOT_REMOVE_OWNER',
  INVALID_INVITATION = 'INVALID_INVITATION',
  INVITATION_EXPIRED = 'INVITATION_EXPIRED',
  INVITATION_ALREADY_ACCEPTED = 'INVITATION_ALREADY_ACCEPTED',
}

/**
 * 团队错误类
 */
export class TeamError extends Error {
  constructor(
    public code: TeamErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'TeamError';
  }
}

/**
 * 权限错误代码
 */
export enum PermissionErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSION = 'INSUFFICIENT_PERMISSION',
  INVALID_PERMISSION_TYPE = 'INVALID_PERMISSION_TYPE',
}

/**
 * 权限错误类
 */
export class PermissionError extends Error {
  constructor(
    public code: PermissionErrorCode,
    message: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}
