/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\components\auth\index.ts
 * @Description: 认证组件导出文件
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

// 表单组件
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { UserProfile } from './UserProfile';

// 布局组件
export { AuthLayout } from './AuthLayout';

// 用户界面组件
export { UserMenu } from './UserMenu';

// 路由保护组件
export {
  ProtectedRoute,
  withAuth,
  RoleGuard,
  useAuthGuard
} from './ProtectedRoute';

// 类型导出
export type { default as LoginFormProps } from './LoginForm';
export type { default as RegisterFormProps } from './RegisterForm';
export type { default as UserProfileProps } from './UserProfile';
export type { default as AuthLayoutProps } from './AuthLayout';
export type { default as ProtectedRouteProps } from './ProtectedRoute';
