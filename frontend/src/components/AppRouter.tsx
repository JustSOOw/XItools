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

import React, { useState, useEffect, useCallback } from 'react';
import { useUserStore, userStoreHelpers } from '../store/userStore';
import { LoginStatus } from '../types/User';
import { AuthPage } from '../pages/AuthPage';
import App from '../App';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

// 页面类型枚举
export enum PageType {
  LOADING = 'loading',
  AUTH = 'auth',
  MAIN = 'main'
}

interface AppRouterProps {
  className?: string;
}

export const AppRouter: React.FC<AppRouterProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { user, loginStatus, checkAuthStatus, isLoading } = useUserStore();
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.LOADING);
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
  }, [isInitialized]); // 只依赖isInitialized，避免checkAuthStatus引起的循环

  // 根据认证状态决定显示哪个页面
  useEffect(() => {
    if (!isInitialized) {
      setCurrentPage(PageType.LOADING);
      return;
    }

    const isLoggedIn = userStoreHelpers.isLoggedIn();

    if (isLoggedIn && loginStatus === LoginStatus.LOGGED_IN) {
      setCurrentPage(PageType.MAIN);
    } else {
      setCurrentPage(PageType.AUTH);
    }
  }, [isInitialized, user, loginStatus]);

  // 处理认证成功
  const handleAuthSuccess = () => {
    setCurrentPage(PageType.MAIN);
  };

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

  // 渲染认证页面
  const renderAuthPage = () => (
    <AuthPage
      initialMode="login"
      onAuthSuccess={handleAuthSuccess}
      className="full-screen"
    />
  );

  // 渲染主应用
  const renderMainApp = () => <App />;

  // 根据当前页面类型渲染对应内容
  const renderCurrentPage = () => {
    switch (currentPage) {
      case PageType.LOADING:
        return renderLoadingPage();
      
      case PageType.AUTH:
        return renderAuthPage();
      
      case PageType.MAIN:
        return renderMainApp();
      
      default:
        return renderLoadingPage();
    }
  };

  return (
    <div className={`app-router ${className}`}>
      {renderCurrentPage()}
    </div>
  );
};

export default AppRouter;
