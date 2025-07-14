/*
 * @Author: XItools Team
 * @Date: 2025-07-01 16:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 16:00:00
 * @FilePath: \XItools\frontend\src\components\auth\LoginLoadingAnimation.tsx
 * @Description: 登录页面加载动画组件 - 提供优雅的登录过程动画效果
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoginLoadingAnimationProps {
  /** 是否显示加载动画 */
  isVisible: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 动画类型 */
  type?: 'login' | 'register' | 'forgot-password';
  /** 自定义类名 */
  className?: string;
}

export const LoginLoadingAnimation: React.FC<LoginLoadingAnimationProps> = ({
  isVisible,
  loadingText,
  type = 'login',
  className = '',
}) => {
  const { t } = useTranslation('auth');

  const getDefaultText = () => {
    switch (type) {
      case 'register':
        return t('register.registering');
      case 'forgot-password':
        return t('forgotPassword.sending');
      default:
        return t('login.loggingIn');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`login-loading-overlay ${className}`}>
      <div className="login-loading-container">
        {/* 主要加载动画 */}
        <div className="loading-animation-main">
          <div className="loading-logo">
            <img src="/logo.svg" alt="XItools" className="logo-pulse" />
          </div>

          {/* 环形进度指示器 */}
          <div className="loading-ring">
            <div className="ring-segment ring-1"></div>
            <div className="ring-segment ring-2"></div>
            <div className="ring-segment ring-3"></div>
            <div className="ring-segment ring-4"></div>
          </div>
        </div>

        {/* 加载文本 */}
        <div className="loading-text-container">
          <p className="loading-text">{loadingText || getDefaultText()}</p>
          <div className="loading-dots">
            <span className="dot dot-1">.</span>
            <span className="dot dot-2">.</span>
            <span className="dot dot-3">.</span>
          </div>
        </div>

        {/* 背景粒子效果 */}
        <div className="loading-particles">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className={`particle particle-${index + 1}`}
              style={
                {
                  '--delay': `${index * 0.1}s`,
                  '--duration': `${2 + (index % 3)}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginLoadingAnimation;
