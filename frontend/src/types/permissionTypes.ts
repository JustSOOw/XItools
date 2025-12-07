/**
 * 项目权限相关类型定义
 *
 * 注意：前端类型中的 Date 字段均为 string 类型（JSON 序列化后的格式）
 */

// ================================
// 枚举类型
// ================================

/**
 * 项目权限类型
 */
export enum ProjectPermissionType {
  VIEW = 'view',   // 查看权限
  EDIT = 'edit',   // 编辑权限
}

// ================================
// 基础类型
// ================================

/**
 * 项目权限
 */
export interface ProjectPermission {
  id: string;
  permission: ProjectPermissionType;
  projectId: string;
  memberId: string;
  grantedBy: string;
  grantedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 项目权限详情（包含成员信息）
 */
export interface ProjectPermissionDetail extends ProjectPermission {
  member: {
    id: string;
    userId: string;
    user: {
      id: string;
      username: string;
      email: string;
      avatar?: string;
    };
  };
}

// ================================
// 请求参数类型
// ================================

/**
 * 设置项目权限的输入数据
 */
export interface SetProjectPermissionInput {
  memberId: string;
  permission: ProjectPermissionType;
}

/**
 * 更新项目权限的输入数据
 */
export interface UpdateProjectPermissionInput {
  permission: ProjectPermissionType;
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
 * 设置权限响应
 */
export interface SetPermissionResponse extends ApiResponse<ProjectPermission> {}

/**
 * 更新权限响应
 */
export interface UpdatePermissionResponse extends ApiResponse<ProjectPermission> {}

/**
 * 获取项目权限列表响应
 */
export interface GetProjectPermissionsResponse extends ApiResponse<ProjectPermissionDetail[]> {}

/**
 * 删除权限响应
 */
export interface DeletePermissionResponse extends ApiResponse {}

// ================================
// 权限检查
// ================================

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  permission?: ProjectPermissionType;
  isOwner?: boolean;
}
