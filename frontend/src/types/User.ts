/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\types\User.ts
 * @Description: 用户相关类型定义
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

// 用户基本信息接口
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// 用户注册请求接口
export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  role?: string;
}

// 用户登录请求接口
export interface UserLoginRequest {
  identifier: string; // 用户名或邮箱
  password: string;
  rememberMe?: boolean;
}

// 用户更新请求接口
export interface UserUpdateRequest {
  avatar?: string;
  bio?: string;
  email?: string;
  role?: string;
}

// 密码修改请求接口
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// 认证响应接口
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    expiresAt: string;
  };
}

// 认证错误响应接口
export interface AuthErrorResponse {
  success: false;
  error: string;
}

// 用户信息响应接口
export interface UserInfoResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// JWT Token 载荷接口
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

// 用户会话信息接口
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
  createdAt: string;
  lastAccessedAt: string;
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

// 登录状态枚举
export enum LoginStatus {
  LOGGED_OUT = 'logged_out',
  LOGGING_IN = 'logging_in',
  LOGGED_IN = 'logged_in',
  TOKEN_EXPIRED = 'token_expired',
  ERROR = 'error',
}
