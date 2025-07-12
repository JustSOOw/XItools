/*
 * @Author: XItools Team
 * @Date: 2025-07-01 10:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 10:30:00
 * @FilePath: \XItools\frontend\src\pages\RegisterPage.tsx
 * @Description: 独立注册页面组件
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useUserStore, userStoreHelpers } from '../store/userStore';
import { useTranslation } from 'react-i18next';

interface RegisterPageProps {
  className?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus } = useUserStore();

  // 获取重定向路径
  const from = (location.state as any)?.from?.pathname || '/';

  // 检查是否已经登录
  useEffect(() => {
    const checkAuth = async () => {
      await checkAuthStatus();

      // 如果已经登录，重定向到目标页面
      if (userStoreHelpers.isLoggedIn()) {
        navigate(from, { replace: true });
      }
    };

    checkAuth();
  }, [checkAuthStatus, navigate, from]);

  const handleAuthSuccess = () => {
    // 注册成功后重定向到目标页面
    navigate(from, { replace: true });
  };

  return (
    <div className={`register-page auth-page full-screen ${className}`}>
      <AuthLayout
        initialMode="register"
        onAuthSuccess={handleAuthSuccess}
        className="full-height"
      />
    </div>
  );
};

export default RegisterPage;
