/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:30:00
 * @FilePath: \XItools\frontend\src\pages\AuthPage.tsx
 * @Description: 认证页面组件
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useEffect } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useUserStore, userStoreHelpers } from '../store/userStore';
import { useTranslation } from 'react-i18next';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  redirectTo = '/',
  className = '',
}) => {
  const { t } = useTranslation();
  const { checkAuthStatus } = useUserStore();

  // 不在AuthPage中检查认证状态，由AppRouter统一管理
  // 如果用户已经登录，AppRouter会直接跳转到主应用，不会显示AuthPage

  const handleAuthSuccess = () => {
    console.log('认证成功');

    if (onAuthSuccess) {
      onAuthSuccess();
    } else {
      // 默认行为：重新加载页面或触发应用状态更新
      window.location.reload();
    }
  };

  return (
    <div className={`auth-page ${className}`}>
      <AuthLayout initialMode={initialMode} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
};

export default AuthPage;
