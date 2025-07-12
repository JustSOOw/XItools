/**
 * 用户认证相关的类型定义
 *
 * 包含用户模型、认证请求/响应、JWT载荷等类型定义
 */

import { z } from 'zod';

// ================================
// 用户基础类型
// ================================

/**
 * 用户基本信息接口
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户会话接口
 */
export interface UserSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户角色接口
 */
export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ================================
// 认证请求/响应类型
// ================================

/**
 * 用户注册请求Schema
 */
export const userRegisterSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和连字符'),
  email: z.string().email('请输入有效的邮箱地址').max(100, '邮箱地址过长'),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符'),
  avatar: z.string().url('头像必须是有效的URL').optional(),
  bio: z.string().max(500, '个人简介最多500个字符').optional(),
  role: z
    .string()
    .regex(/^(admin|user|viewer)$/, '角色必须是admin、user或viewer之一')
    .default('user')
    .optional(),
});

export type UserRegisterRequest = z.infer<typeof userRegisterSchema>;

/**
 * 用户登录请求Schema
 */
export const userLoginSchema = z.object({
  identifier: z.string().min(1, '用户名或邮箱不能为空'), // 可以是用户名或邮箱
  password: z.string().min(1, '密码不能为空'),
  rememberMe: z.boolean().optional().default(false),
});

export type UserLoginRequest = z.infer<typeof userLoginSchema>;

/**
 * 用户信息更新请求Schema
 */
export const userUpdateSchema = z.object({
  avatar: z.string().url('头像必须是有效的URL').nullable().optional(),
  bio: z.string().max(500, '个人简介最多500个字符').nullable().optional(),
  email: z.string().email('请输入有效的邮箱地址').max(100, '邮箱地址过长').optional(),
  role: z
    .string()
    .regex(/^(admin|user|viewer)$/, '角色必须是admin、user或viewer之一')
    .optional(),
});

export type UserUpdateRequest = z.infer<typeof userUpdateSchema>;

/**
 * 密码修改请求Schema
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '当前密码不能为空'),
    newPassword: z.string().min(6, '新密码至少6个字符').max(50, '新密码最多50个字符'),
    confirmPassword: z.string().min(1, '确认密码不能为空'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新密码和确认密码不匹配',
    path: ['confirmPassword'],
  });

export type PasswordChangeRequest = z.infer<typeof passwordChangeSchema>;

// ================================
// 认证响应类型
// ================================

/**
 * 认证成功响应
 */
export interface AuthResponse {
  success: true;
  data: {
    user: Omit<User, 'passwordHash'>; // 不包含密码哈希
    token: string;
    refreshToken?: string;
    expiresAt: Date;
  };
  message: string;
}

/**
 * 认证失败响应
 */
export interface AuthErrorResponse {
  success: false;
  error: string;
  code?: string;
}

/**
 * 用户信息响应
 */
export interface UserInfoResponse {
  success: true;
  data: {
    user: Omit<User, 'passwordHash'>;
  };
}

// ================================
// JWT相关类型
// ================================

/**
 * JWT载荷接口
 */
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  sessionId: string;
  iat: number; // 签发时间
  exp: number; // 过期时间
}

/**
 * JWT配置接口
 */
export interface JWTConfig {
  secret: string;
  expiresIn: string | number;
  refreshExpiresIn: string | number;
  issuer: string;
  audience: string;
}

// ================================
// 权限相关类型
// ================================

/**
 * 权限类型枚举
 */
export enum Permission {
  // 通用权限
  ALL = '*',

  // 读取权限
  READ_OWN = 'read:own',
  READ_SHARED = 'read:shared',
  READ_ALL = 'read:all',

  // 写入权限
  WRITE_OWN = 'write:own',
  WRITE_SHARED = 'write:shared',
  WRITE_ALL = 'write:all',

  // 删除权限
  DELETE_OWN = 'delete:own',
  DELETE_SHARED = 'delete:shared',
  DELETE_ALL = 'delete:all',

  // 创建权限
  CREATE_WORKSPACE = 'create:workspace',
  CREATE_PROJECT = 'create:project',
  CREATE_BOARD = 'create:board',
  CREATE_TASK = 'create:task',

  // 管理权限
  MANAGE_USERS = 'manage:users',
  MANAGE_ROLES = 'manage:roles',
  MANAGE_SYSTEM = 'manage:system',
}

/**
 * 用户权限上下文
 */
export interface UserContext {
  userId: string;
  username: string;
  email: string;
  sessionId: string;
  permissions: Permission[];
  isActive: boolean;
}

// ================================
// 中间件相关类型
// ================================

/**
 * 认证中间件选项
 */
export interface AuthMiddlewareOptions {
  required?: boolean; // 是否必须认证
  permissions?: Permission[]; // 需要的权限
  allowInactive?: boolean; // 是否允许非活跃用户
}

/**
 * 扩展Fastify Request类型以包含用户信息
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: UserContext;
  }
}

// ================================
// 数据库查询相关类型
// ================================

/**
 * 用户查询过滤器
 */
export interface UserQueryFilter {
  username?: string;
  email?: string;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页查询结果
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ================================
// 错误类型
// ================================

/**
 * 认证错误类型
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_REVOKED = 'SESSION_REVOKED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  RATE_LIMITED = 'RATE_LIMITED',
}

/**
 * 认证错误类
 */
export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

// ================================
// 导出所有类型
// ================================

export type {
  User,
  UserSession,
  UserRole,
  UserRegisterRequest,
  UserLoginRequest,
  UserUpdateRequest,
  PasswordChangeRequest,
  AuthResponse,
  AuthErrorResponse,
  UserInfoResponse,
  JWTPayload,
  JWTConfig,
  UserContext,
  AuthMiddlewareOptions,
  UserQueryFilter,
  PaginationParams,
  PaginatedResult,
};
