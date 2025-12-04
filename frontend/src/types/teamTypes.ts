/**
 * 团队协作相关类型定义
 *
 * 注意：前端类型中的 Date 字段均为 string 类型（JSON 序列化后的格式）
 */

// ================================
// 枚举类型
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

// ================================
// 基础类型
// ================================

/**
 * 团队信息
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 团队详情 (包含成员信息)
 */
export interface TeamDetail extends Team {
  memberCount: number;
  members?: TeamMember[];
}

/**
 * 团队成员
 */
export interface TeamMember {
  id: string;
  role: TeamRole;
  status: TeamMemberStatus;
  userId: string;
  teamId: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

/**
 * 团队邀请
 */
export interface TeamInvitation {
  id: string;
  inviteCode: string;
  invitedEmail: string;
  status: InvitationStatus;
  expiresAt: string;
  teamId: string;
  inviterId: string;
  invitedUserId?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 团队邀请详情 (包含团队和邀请者信息)
 */
export interface TeamInvitationDetail extends TeamInvitation {
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

// ================================
// 请求参数类型
// ================================

/**
 * 创建团队的输入数据
 */
export interface CreateTeamInput {
  name: string;
  description?: string;
  avatar?: string;
}

/**
 * 更新团队的输入数据
 */
export interface UpdateTeamInput {
  name?: string;
  description?: string;
  avatar?: string;
}

/**
 * 邀请成员的输入数据
 */
export interface InviteMembersInput {
  emails: string[];
}

/**
 * 接受邀请的输入数据
 */
export interface AcceptInvitationInput {
  invitationId: string;
}

/**
 * 拒绝邀请的输入数据
 */
export interface RejectInvitationInput {
  invitationId: string;
}

/**
 * 更新成员角色的输入数据
 * 注意：不能将成员角色更新为 OWNER
 */
export interface UpdateMemberRoleInput {
  role: TeamRole.ADMIN | TeamRole.MEMBER | TeamRole.GUEST;
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
 * 获取团队响应
 */
export interface GetTeamResponse extends ApiResponse<Team> {}

/**
 * 获取团队详情响应
 */
export interface GetTeamDetailResponse extends ApiResponse<TeamDetail> {}

/**
 * 获取团队成员列表响应
 */
export interface GetTeamMembersResponse extends ApiResponse<TeamMember[]> {}

/**
 * 获取邀请列表响应
 */
export interface GetInvitationsResponse extends ApiResponse<TeamInvitation[]> {}

/**
 * 发送邀请响应
 */
export interface SendInvitationsResponse extends ApiResponse<{
  invitations: TeamInvitation[];
  count: number;
}> {}

/**
 * 验证邀请码响应
 */
export interface VerifyInviteCodeResponse extends ApiResponse<TeamInvitationDetail> {}
