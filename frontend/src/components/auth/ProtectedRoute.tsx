/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\components\auth\ProtectedRoute.tsx
 * @Description: 路由保护组件
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import { useUserStore, userStoreHelpers } from '../../store/userStore';
import { LoginStatus, UserRole } from '../../types/User';
import { AuthLayout } from './AuthLayout';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  redirectTo?: string;
  className?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  fallback,
  redirectTo,
  className = '',
}) => {
  const { t } = useTranslation();
  const { user, loginStatus, checkAuthStatus, isLoading } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化认证状态检查
  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      setIsInitialized(true);
    };

    initAuth();
  }, [checkAuthStatus]);

  // 如果正在初始化或加载中，显示加载状态
  if (!isInitialized || isLoading) {
    return (
      <div className={`protected-route-loading ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="icon-loader spinning"></i>
          </div>
          <p className="loading-text">{t('auth:loading.checking')}</p>
        </div>
      </div>
    );
  }

  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return <div className={className}>{children}</div>;
  }

  // 检查用户是否已登录
  const isLoggedIn = userStoreHelpers.isLoggedIn();

  // 如果未登录或token过期，显示登录界面
  if (!isLoggedIn || loginStatus === LoginStatus.TOKEN_EXPIRED) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={`protected-route-auth ${className}`}>
        <AuthLayout
          initialMode="login"
          onAuthSuccess={() => {
            // 认证成功后，组件会自动重新渲染
            console.log('认证成功');
          }}
        />
      </div>
    );
  }

  // 检查用户角色权限
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className={`protected-route-unauthorized ${className}`}>
        <div className="unauthorized-container">
          <div className="unauthorized-icon">
            <i className="icon-shield-off"></i>
          </div>
          <h2 className="unauthorized-title">{t('auth:unauthorized.title')}</h2>
          <p className="unauthorized-message">
            {t('auth:unauthorized.message', {
              requiredRole: t(`auth:roles.${requiredRole}`),
              currentRole: t(`auth:roles.${user?.role}`),
            })}
          </p>
          <div className="unauthorized-actions">
            <button onClick={() => window.history.back()} className="back-button">
              <i className="icon-arrow-left"></i>
              {t('auth:unauthorized.goBack')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 认证通过，渲染子组件
  return <div className={className}>{children}</div>;
};

// 高阶组件版本
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requiredRole?: UserRole;
    fallback?: React.ReactNode;
  } = {},
) {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// 角色检查组件
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  className?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  className = '',
}) => {
  const { t } = useTranslation();
  const { user } = useUserStore();

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={`role-guard-denied ${className}`}>
        <div className="access-denied">
          <i className="icon-lock"></i>
          <p>{t('auth:roleGuard.accessDenied')}</p>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

// 认证状态检查Hook
export const useAuthGuard = (
  options: {
    requireAuth?: boolean;
    requiredRole?: UserRole;
  } = {},
) => {
  const { requireAuth = true, requiredRole } = options;
  const { user, loginStatus } = useUserStore();

  const isLoggedIn = userStoreHelpers.isLoggedIn();
  const hasRequiredRole = !requiredRole || userStoreHelpers.hasRole(requiredRole);

  const isAuthorized = !requireAuth || (isLoggedIn && hasRequiredRole);
  const needsAuth = requireAuth && !isLoggedIn;
  const needsRole = requireAuth && isLoggedIn && !hasRequiredRole;

  return {
    isAuthorized,
    needsAuth,
    needsRole,
    isLoggedIn,
    hasRequiredRole,
    user,
    loginStatus,
  };
};

export default ProtectedRoute;
