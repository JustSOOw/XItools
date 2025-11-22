/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:30:00
 * @FilePath: \XItools\frontend\src\components\AppRouter.tsx
 * @Description: 应用路由组件 - 管理认证状态和页面切换
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUserStore, userStoreHelpers } from '../store/userStore';
import { LoginStatus } from '../types/User';
import { AuthPage } from '../pages/AuthPage';
import App from '../App';
import TeamSettings from '../pages/TeamSettings';
import AcceptInvitation from '../pages/AcceptInvitation';
import Layout from './Layout';
import { useTranslation } from 'react-i18next';

// 页面类型枚举
export enum PageType {
  LOADING = 'loading',
  AUTH = 'auth',
  MAIN = 'main',
}

interface AppRouterProps {
  className?: string;
}

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { loginStatus } = useUserStore();
  const location = useLocation();
  const isLoggedIn = userStoreHelpers.isLoggedIn();

  if (!isLoggedIn || loginStatus !== LoginStatus.LOGGED_IN) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export const AppRouter: React.FC<AppRouterProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { checkAuthStatus } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化认证状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error('初始化认证状态失败:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, checkAuthStatus]);

  // 渲染加载页面
  const renderLoadingPage = () => (
    <div className="app-loading">
      <div className="loading-container">
        <div className="loading-logo">
          <img src="/logo.svg" alt="XItools" className="logo-image" />
          <h1 className="logo-text">XItools</h1>
        </div>

        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>

        <p className="loading-text">{t('auth:loading.checking')}</p>

        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isInitialized) {
    return renderLoadingPage();
  }

  return (
    <div className={`app-router ${className}`}>
      <Routes>
        <Route path="/auth" element={<AuthPage initialMode="login" className="full-screen" />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />

        {/* Team Settings Route - Wrapped in Layout if App doesn't handle it, 
            but App renders Layout. So we might need to nest this or make App handle child routes.
            For now, let's assume App is the main dashboard and we want TeamSettings to replace the board view 
            BUT keep the Sidebar. 
            
            However, App.tsx renders Layout and then the board content.
            If we want TeamSettings to show inside Layout, we should probably move Layout out of App 
            or make App a layout route.
            
            Let's try to make App a layout route or use a separate layout for team settings.
            Since I can't easily refactor App.tsx to be a layout route without changing its internal structure significantly,
            I will wrap TeamSettings in Layout here.
        */}
        <Route
          path="/team/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamSettings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default AppRouter;
