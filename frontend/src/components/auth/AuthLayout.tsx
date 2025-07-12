/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\components\auth\AuthLayout.tsx
 * @Description: 认证页面布局组件
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useState, useMemo } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../../store/themeStore';

interface AuthLayoutProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess?: () => void;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  className = '',
}) => {
  const { t } = useTranslation('auth');
  const { currentTheme } = useThemeStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextMode, setNextMode] = useState<'login' | 'register' | 'forgot-password' | null>(null);

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
  };

  // 平滑切换函数
  const smoothTransition = (targetMode: 'login' | 'register' | 'forgot-password') => {
    if (authMode === targetMode || isTransitioning) return;

    setIsTransitioning(true);
    setNextMode(targetMode);

    // 延迟切换以允许退出动画完成
    setTimeout(() => {
      setAuthMode(targetMode);
      setNextMode(null);

      // 延迟重置过渡状态以允许进入动画完成
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  const switchToLogin = () => {
    smoothTransition('login');
  };

  const switchToRegister = () => {
    smoothTransition('register');
  };

  const switchToForgotPassword = () => {
    smoothTransition('forgot-password');
  };

  // 使用useMemo优化动画元素生成，避免不必要的重新渲染
  const lightParticles = useMemo(() => {
    const particles = [];
    // 小光点 - 大幅增加数量
    for (let i = 0; i < 45; i++) {
      particles.push(
        <div
          key={`light-small-${i}`}
          className="light-particle light-small"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${5 + Math.random() * 4}s`,
          }}
        />,
      );
    }
    // 中等光点 - 大幅增加数量
    for (let i = 0; i < 35; i++) {
      particles.push(
        <div
          key={`light-medium-${i}`}
          className="light-particle light-medium"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        />,
      );
    }
    // 大光点 - 大幅增加数量
    for (let i = 0; i < 25; i++) {
      particles.push(
        <div
          key={`light-large-${i}`}
          className="light-particle light-large"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />,
      );
    }
    return particles;
  }, []);

  const cherryPetals = useMemo(() => {
    const petals = [];

    // 微小花瓣 - 新增
    for (let i = 0; i < 20; i++) {
      petals.push(
        <div
          key={`petal-tiny-${i}`}
          className="cherry-petal petal-tiny"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${-250 - Math.random() * 150}px`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${12 + Math.random() * 8}s`,
          }}
        />,
      );
    }

    // 小花瓣 - 增加数量
    for (let i = 0; i < 30; i++) {
      petals.push(
        <div
          key={`petal-small-${i}`}
          className="cherry-petal petal-small"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${-250 - Math.random() * 150}px`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${10 + Math.random() * 8}s`,
          }}
        />,
      );
    }

    // 中等花瓣 - 增加数量
    for (let i = 0; i < 25; i++) {
      petals.push(
        <div
          key={`petal-medium-${i}`}
          className="cherry-petal petal-medium"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${-250 - Math.random() * 150}px`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${8 + Math.random() * 8}s`,
          }}
        />,
      );
    }

    // 大花瓣 - 增加数量
    for (let i = 0; i < 20; i++) {
      petals.push(
        <div
          key={`petal-large-${i}`}
          className="cherry-petal petal-large"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${-250 - Math.random() * 150}px`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
          }}
        />,
      );
    }

    // 超大花瓣 - 新增，数量较少
    for (let i = 0; i < 8; i++) {
      petals.push(
        <div
          key={`petal-extra-large-${i}`}
          className="cherry-petal petal-extra-large"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${-250 - Math.random() * 150}px`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${5 + Math.random() * 6}s`,
          }}
        />,
      );
    }

    return petals;
  }, []);

  const oceanBubbles = useMemo(() => {
    const bubbles = [];
    // 小气泡
    for (let i = 0; i < 25; i++) {
      bubbles.push(
        <div
          key={`bubble-small-${i}`}
          className="bubble bubble-small"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${12 + Math.random() * 6}s`,
          }}
        />,
      );
    }
    // 中等气泡
    for (let i = 0; i < 15; i++) {
      bubbles.push(
        <div
          key={`bubble-medium-${i}`}
          className="bubble bubble-medium"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${10 + Math.random() * 6}s`,
          }}
        />,
      );
    }
    // 大气泡
    for (let i = 0; i < 8; i++) {
      bubbles.push(
        <div
          key={`bubble-large-${i}`}
          className="bubble bubble-large"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${8 + Math.random() * 6}s`,
          }}
        />,
      );
    }
    return bubbles;
  }, []);

  const oceanParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 12; i++) {
      particles.push(
        <div
          key={`ocean-particle-${i}`}
          className="ocean-particle"
          style={{
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />,
      );
    }
    return particles;
  }, []);

  // 渲染不同主题的背景动画
  const renderThemeBackground = () => {
    switch (currentTheme) {
      case 'light':
        return (
          <>
            {/* 浮动光点层 */}
            <div className="floating-lights">{lightParticles}</div>
            {/* 几何图形动画 */}
            <div className="geometric-shapes">
              {/* 左侧几何图形 */}
              <div className="geometric-shape shape-circle" />
              <div className="geometric-shape shape-square" />
              <div className="geometric-shape shape-hexagon" />
              <div className="geometric-shape shape-diamond" />

              {/* 右侧几何图形 */}
              <div className="geometric-shape shape-triangle" />
              <div className="geometric-shape shape-pentagon" />
              <div className="geometric-shape shape-star" />
              <div className="geometric-shape shape-oval" />
            </div>
          </>
        );

      case 'cherry':
        return (
          <>
            {/* 樱花飘落容器 */}
            <div className="cherry-blossoms">{cherryPetals}</div>
            {/* 粉色光晕效果 */}
            <div className="pink-aura">
              <div className="aura-glow glow-1" />
              <div className="aura-glow glow-2" />
              <div className="aura-glow glow-3" />
            </div>
          </>
        );

      case 'ocean':
        return (
          <>
            {/* 气泡上升容器 */}
            <div className="ocean-bubbles">{oceanBubbles}</div>
            {/* 水波纹效果 */}
            <div className="water-ripples">
              <div className="ripple ripple-1" />
              <div className="ripple ripple-2" />
              <div className="ripple ripple-3" />
            </div>
            {/* 海洋粒子流 */}
            <div className="ocean-particles">{oceanParticles}</div>
          </>
        );

      case 'dark':
      default:
        // 深色主题保持原有的星空动画
        return (
          <>
            <div className="stars-layer stars-small"></div>
            <div className="stars-layer stars-medium"></div>
            <div className="stars-layer stars-large"></div>
            <div className="shooting-stars">
              <div className="shooting-star"></div>
              <div className="shooting-star"></div>
              <div className="shooting-star"></div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`auth-layout ${className}`}>
      {/* 主题背景动画装饰 */}
      <div className="starry-background">{renderThemeBackground()}</div>

      <div className="auth-container">
        {/* 左侧品牌区域 */}
        <div className="auth-brand">
          <div className="brand-content">
            <div className="brand-logo">
              <img src="/xitools_main.png" alt="XItools" className="logo-image" />
              <h1 className="brand-name">XItools</h1>
            </div>

            <div className="brand-description">
              <div className="brand-tagline">
                <p className="brand-subtitle">{t('brand.description')}</p>
              </div>

              <div className="brand-highlights">
                <div className="highlight-card">
                  <div className="highlight-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="highlight-svg"
                    >
                      <circle cx="12" cy="12" r="11" fill="url(#mcpGradient)" opacity="0.1" />
                      <rect
                        x="8"
                        y="8"
                        width="8"
                        height="8"
                        rx="1.5"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <rect
                        x="9"
                        y="9"
                        width="6"
                        height="6"
                        rx="1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        opacity="0.6"
                      />
                      <line
                        x1="10"
                        y1="11"
                        x2="14"
                        y2="11"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        opacity="0.7"
                      />
                      <line
                        x1="10"
                        y1="13"
                        x2="14"
                        y2="13"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        opacity="0.7"
                      />
                      <circle cx="11" cy="12" r="0.5" fill="currentColor" opacity="0.9" />
                      <circle cx="13" cy="12" r="0.5" fill="currentColor" opacity="0.9" />
                      <line
                        x1="2"
                        y1="8"
                        x2="8"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                      <line
                        x1="2"
                        y1="12"
                        x2="8"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                      <line
                        x1="2"
                        y1="16"
                        x2="8"
                        y2="16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                      <line
                        x1="16"
                        y1="8"
                        x2="22"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                      <line
                        x1="16"
                        y1="12"
                        x2="22"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                      <line
                        x1="16"
                        y1="16"
                        x2="22"
                        y2="16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                      <circle cx="2" cy="8" r="1" fill="currentColor" opacity="0.9" />
                      <circle cx="2" cy="12" r="1" fill="currentColor" opacity="0.9" />
                      <circle cx="2" cy="16" r="1" fill="currentColor" opacity="0.9" />
                      <circle cx="22" cy="8" r="1" fill="currentColor" opacity="0.9" />
                      <circle cx="22" cy="12" r="1" fill="currentColor" opacity="0.9" />
                      <circle cx="22" cy="16" r="1" fill="currentColor" opacity="0.9" />
                      <circle cx="5" cy="12" r="0.8" fill="currentColor" opacity="0.6">
                        <animate
                          attributeName="opacity"
                          values="0.6;1;0.6"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="19" cy="12" r="0.8" fill="currentColor" opacity="0.6">
                        <animate
                          attributeName="opacity"
                          values="0.6;1;0.6"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="1s"
                        />
                      </circle>
                      <defs>
                        <linearGradient id="mcpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop
                            offset="0%"
                            style={{ stopColor: 'currentColor', stopOpacity: 0.2 }}
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: 'currentColor', stopOpacity: 0.05 }}
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="highlight-content">
                    <h3>{t('brand.highlight1.title')}</h3>
                    <p>{t('brand.highlight1.desc')}</p>
                  </div>
                </div>

                <div className="highlight-card">
                  <div className="highlight-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="highlight-svg"
                    >
                      <circle cx="12" cy="12" r="11" fill="url(#kanbanGradient)" opacity="0.1" />
                      <rect
                        x="4"
                        y="5"
                        width="16"
                        height="12"
                        rx="1.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        opacity="0.7"
                      />
                      <line
                        x1="9"
                        y1="5"
                        x2="9"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        opacity="0.5"
                      />
                      <line
                        x1="15"
                        y1="5"
                        x2="15"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        opacity="0.5"
                      />
                      <rect
                        x="4.5"
                        y="6"
                        width="4"
                        height="0.8"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <rect
                        x="9.5"
                        y="6"
                        width="5"
                        height="0.8"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <rect
                        x="15.5"
                        y="6"
                        width="4"
                        height="0.8"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <rect
                        x="5"
                        y="8"
                        width="3.5"
                        height="1.2"
                        rx="0.3"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <rect
                        x="5"
                        y="9.5"
                        width="3.5"
                        height="1.2"
                        rx="0.3"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <rect
                        x="10"
                        y="8"
                        width="4.5"
                        height="1.2"
                        rx="0.3"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <rect
                        x="10"
                        y="9.5"
                        width="4.5"
                        height="1.2"
                        rx="0.3"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <rect
                        x="16"
                        y="8"
                        width="3.5"
                        height="1.2"
                        rx="0.3"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <circle cx="6" cy="3" r="1.2" fill="currentColor" opacity="0.8" />
                      <circle cx="12" cy="2.5" r="1.2" fill="currentColor" opacity="0.7" />
                      <circle cx="18" cy="3" r="1.2" fill="currentColor" opacity="0.6" />
                      <circle cx="7.2" cy="2.2" r="0.4" fill="#4CAF50">
                        <animate
                          attributeName="opacity"
                          values="1;0.3;1"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="13.2" cy="1.7" r="0.4" fill="#4CAF50">
                        <animate
                          attributeName="opacity"
                          values="1;0.3;1"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="0.7s"
                        />
                      </circle>
                      <circle cx="19.2" cy="2.2" r="0.4" fill="#4CAF50">
                        <animate
                          attributeName="opacity"
                          values="1;0.3;1"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="1.4s"
                        />
                      </circle>
                      <defs>
                        <linearGradient id="kanbanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop
                            offset="0%"
                            style={{ stopColor: 'currentColor', stopOpacity: 0.2 }}
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: 'currentColor', stopOpacity: 0.05 }}
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="highlight-content">
                    <h3>{t('brand.highlight2.title')}</h3>
                    <p>{t('brand.highlight2.desc')}</p>
                  </div>
                </div>

                <div className="highlight-card">
                  <div className="highlight-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="highlight-svg"
                    >
                      <circle cx="12" cy="12" r="11" fill="url(#multiViewGradient)" opacity="0.1" />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        opacity="0.8"
                      />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.9" />
                      <g transform="translate(4, 4)">
                        <rect
                          x="0"
                          y="0"
                          width="6"
                          height="6"
                          rx="0.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.8"
                          opacity="0.6"
                        />
                        <rect
                          x="0.5"
                          y="1"
                          width="1.5"
                          height="4"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.4"
                        />
                        <rect
                          x="2.25"
                          y="1"
                          width="1.5"
                          height="4"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.4"
                        />
                        <rect
                          x="4"
                          y="1"
                          width="1.5"
                          height="4"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.4"
                        />
                        <rect
                          x="0.7"
                          y="1.3"
                          width="1.1"
                          height="0.6"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.8"
                        />
                        <rect
                          x="2.45"
                          y="1.3"
                          width="1.1"
                          height="0.6"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.8"
                        />
                        <rect
                          x="2.45"
                          y="2.1"
                          width="1.1"
                          height="0.6"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.6"
                        />
                      </g>
                      <g transform="translate(14, 4)">
                        <rect
                          x="0"
                          y="0"
                          width="6"
                          height="6"
                          rx="0.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.8"
                          opacity="0.6"
                        />
                        <rect
                          x="0.5"
                          y="1"
                          width="5"
                          height="0.8"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.7"
                        />
                        <rect
                          x="0.5"
                          y="2"
                          width="5"
                          height="0.8"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.5"
                        />
                        <rect
                          x="0.5"
                          y="3"
                          width="5"
                          height="0.8"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.5"
                        />
                        <circle cx="1" cy="1.4" r="0.15" fill="currentColor" opacity="0.8" />
                        <circle cx="1" cy="2.4" r="0.15" fill="currentColor" opacity="0.6" />
                      </g>
                      <g transform="translate(9, 14)">
                        <rect
                          x="0"
                          y="0"
                          width="6"
                          height="6"
                          rx="0.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.8"
                          opacity="0.6"
                        />
                        <line
                          x1="0.5"
                          y1="1.5"
                          x2="5.5"
                          y2="1.5"
                          stroke="currentColor"
                          strokeWidth="0.3"
                          opacity="0.5"
                        />
                        <line
                          x1="2"
                          y1="1"
                          x2="2"
                          y2="5.5"
                          stroke="currentColor"
                          strokeWidth="0.3"
                          opacity="0.5"
                        />
                        <line
                          x1="3.5"
                          y1="1"
                          x2="3.5"
                          y2="5.5"
                          stroke="currentColor"
                          strokeWidth="0.3"
                          opacity="0.5"
                        />
                        <circle cx="1.25" cy="2.25" r="0.2" fill="currentColor" opacity="0.8" />
                        <circle cx="2.75" cy="2.25" r="0.2" fill="currentColor" opacity="0.6" />
                        <circle cx="4.25" cy="3.75" r="0.2" fill="currentColor" opacity="0.7" />
                      </g>
                      <g transformOrigin="12 12">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          values="0 12 12; 120 12 12; 240 12 12; 360 12 12"
                          dur="6s"
                          repeatCount="indefinite"
                        />
                        <line
                          x1="12"
                          y1="10.5"
                          x2="12"
                          y2="9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          opacity="0.9"
                        />
                      </g>
                      <defs>
                        <linearGradient id="multiViewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop
                            offset="0%"
                            style={{ stopColor: 'currentColor', stopOpacity: 0.2 }}
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: 'currentColor', stopOpacity: 0.05 }}
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="highlight-content">
                    <h3>{t('brand.highlight3.title')}</h3>
                    <p>{t('brand.highlight3.desc')}</p>
                  </div>
                </div>
              </div>

              <div className="brand-stats">
                <div className="stat-item">
                  <div className="stat-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="stat-svg"
                    >
                      <rect
                        x="3"
                        y="6"
                        width="14"
                        height="10"
                        rx="1.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        opacity="0.8"
                      />
                      <path
                        d="M 7 6 L 7 4 Q 7 3 8 3 L 12 3 Q 13 3 13 4 L 13 6"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                        opacity="0.8"
                      />
                      <line
                        x1="3"
                        y1="9"
                        x2="17"
                        y2="9"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        opacity="0.6"
                      />
                      <rect
                        x="5"
                        y="7"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.9"
                      />
                      <rect
                        x="7"
                        y="7"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <rect
                        x="9"
                        y="7"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.7"
                      />
                      <rect
                        x="11"
                        y="7"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.9"
                      />
                      <rect
                        x="13"
                        y="7"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <rect
                        x="15"
                        y="7"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.7"
                      />
                      <rect
                        x="5"
                        y="10"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <rect
                        x="7"
                        y="10"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <rect
                        x="9"
                        y="10"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.7"
                      />
                      <rect
                        x="11"
                        y="10"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.9"
                      />
                      <rect
                        x="13"
                        y="10"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <rect
                        x="15"
                        y="10"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <rect
                        x="5"
                        y="12.5"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.7"
                      />
                      <rect
                        x="7"
                        y="12.5"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.5"
                      />
                      <rect
                        x="9"
                        y="12.5"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <rect
                        x="11"
                        y="12.5"
                        width="1.5"
                        height="1.5"
                        rx="0.2"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <circle cx="16" cy="5" r="1" fill="currentColor" opacity="0.3">
                        <animate
                          attributeName="opacity"
                          values="0.3;0.9;0.3"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x="16"
                        y="5.5"
                        textAnchor="middle"
                        fontSize="0.6"
                        fill="currentColor"
                        opacity="0.9"
                      >
                        12
                      </text>
                    </svg>
                  </div>
                  <span className="stat-number">12+</span>
                  <span className="stat-label">{t('brand.stats.tools')}</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="stat-svg"
                    >
                      <circle
                        cx="10"
                        cy="10"
                        r="2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        opacity="0.8"
                      />
                      <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.9" />
                      <g transform="translate(7, 2)">
                        <rect
                          x="0"
                          y="0"
                          width="6"
                          height="4"
                          rx="0.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.8"
                          opacity="0.7"
                        />
                        <rect
                          x="0.5"
                          y="0.5"
                          width="1.5"
                          height="3"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.6"
                        />
                        <rect
                          x="2.25"
                          y="0.5"
                          width="1.5"
                          height="3"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.6"
                        />
                        <rect
                          x="4"
                          y="0.5"
                          width="1.5"
                          height="3"
                          rx="0.2"
                          fill="currentColor"
                          opacity="0.6"
                        />
                        <rect
                          x="0.7"
                          y="0.8"
                          width="1.1"
                          height="0.4"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.9"
                        />
                        <rect
                          x="2.45"
                          y="0.8"
                          width="1.1"
                          height="0.4"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.9"
                        />
                        <rect
                          x="2.45"
                          y="1.4"
                          width="1.1"
                          height="0.4"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.7"
                        />
                      </g>
                      <g transform="translate(1, 12)">
                        <rect
                          x="0"
                          y="0"
                          width="6"
                          height="4"
                          rx="0.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.8"
                          opacity="0.7"
                        />
                        <rect
                          x="0.5"
                          y="0.5"
                          width="5"
                          height="0.6"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.8"
                        />
                        <rect
                          x="0.5"
                          y="1.3"
                          width="5"
                          height="0.6"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.6"
                        />
                        <rect
                          x="0.5"
                          y="2.1"
                          width="5"
                          height="0.6"
                          rx="0.1"
                          fill="currentColor"
                          opacity="0.6"
                        />
                        <circle cx="0.9" cy="0.8" r="0.1" fill="currentColor" opacity="0.9" />
                        <circle cx="0.9" cy="1.6" r="0.1" fill="currentColor" opacity="0.7" />
                      </g>
                      <g transform="translate(13, 12)">
                        <rect
                          x="0"
                          y="0"
                          width="6"
                          height="4"
                          rx="0.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.8"
                          opacity="0.7"
                        />
                        <line
                          x1="0.5"
                          y1="1"
                          x2="5.5"
                          y2="1"
                          stroke="currentColor"
                          strokeWidth="0.3"
                          opacity="0.6"
                        />
                        <line
                          x1="2"
                          y1="0.5"
                          x2="2"
                          y2="3.5"
                          stroke="currentColor"
                          strokeWidth="0.3"
                          opacity="0.6"
                        />
                        <line
                          x1="3.5"
                          y1="0.5"
                          x2="3.5"
                          y2="3.5"
                          stroke="currentColor"
                          strokeWidth="0.3"
                          opacity="0.6"
                        />
                        <circle cx="1.25" cy="1.5" r="0.15" fill="currentColor" opacity="0.9" />
                        <circle cx="2.75" cy="1.5" r="0.15" fill="currentColor" opacity="0.7" />
                        <circle cx="4.25" cy="2.5" r="0.15" fill="currentColor" opacity="0.8" />
                      </g>
                      <circle cx="16" cy="4" r="1.2" fill="currentColor" opacity="0.2">
                        <animate
                          attributeName="opacity"
                          values="0.2;0.6;0.2"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x="16"
                        y="4.5"
                        textAnchor="middle"
                        fontSize="0.8"
                        fill="currentColor"
                        opacity="0.9"
                      >
                        3
                      </text>
                    </svg>
                  </div>
                  <span className="stat-number">3</span>
                  <span className="stat-label">{t('brand.stats.views')}</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="stat-svg"
                    >
                      <circle
                        cx="10"
                        cy="10"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        opacity="0.8"
                      />
                      <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.9" />
                      <g transformOrigin="10 10">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          values="0 10 10; 360 10 10"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                        <path
                          d="M 10 4 L 8.5 5.5 L 9.2 5.5 L 9.2 7 L 10.8 7 L 10.8 5.5 L 11.5 5.5 Z"
                          fill="currentColor"
                          opacity="0.8"
                        />
                        <path
                          d="M 16 10 L 14.5 8.5 L 14.5 9.2 L 13 9.2 L 13 10.8 L 14.5 10.8 L 14.5 11.5 Z"
                          fill="currentColor"
                          opacity="0.8"
                        />
                        <path
                          d="M 10 16 L 11.5 14.5 L 10.8 14.5 L 10.8 13 L 9.2 13 L 9.2 14.5 L 8.5 14.5 Z"
                          fill="currentColor"
                          opacity="0.8"
                        />
                        <path
                          d="M 4 10 L 5.5 11.5 L 5.5 10.8 L 7 10.8 L 7 9.2 L 5.5 9.2 L 5.5 8.5 Z"
                          fill="currentColor"
                          opacity="0.8"
                        />
                      </g>
                      <circle cx="10" cy="3" r="1" fill="currentColor" opacity="0.7">
                        <animate
                          attributeName="opacity"
                          values="0.7;1;0.7"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="17" cy="10" r="1" fill="currentColor" opacity="0.7">
                        <animate
                          attributeName="opacity"
                          values="0.7;1;0.7"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="0.5s"
                        />
                      </circle>
                      <circle cx="10" cy="17" r="1" fill="currentColor" opacity="0.7">
                        <animate
                          attributeName="opacity"
                          values="0.7;1;0.7"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="1s"
                        />
                      </circle>
                      <circle cx="3" cy="10" r="1" fill="currentColor" opacity="0.7">
                        <animate
                          attributeName="opacity"
                          values="0.7;1;0.7"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="1.5s"
                        />
                      </circle>
                      <circle
                        cx="5"
                        cy="10"
                        r="5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        opacity="0.3"
                      >
                        <animate
                          attributeName="r"
                          values="5;8;5"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.3;0;0.3"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="16" cy="4" r="0.8" fill="#4CAF50">
                        <animate
                          attributeName="opacity"
                          values="1;0.3;1"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text x="1" y="18" fontSize="2" fill="currentColor" opacity="0.6">
                        100%
                      </text>
                    </svg>
                  </div>
                  <span className="stat-number">100%</span>
                  <span className="stat-label">{t('brand.stats.sync')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 装饰性背景 - 增强版 */}
          <div className="brand-decoration">
            {/* 主要装饰圆圈 */}
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
            <div className="decoration-circle circle-4"></div>
            <div className="decoration-circle circle-5"></div>

            {/* 额外的小气泡 */}
            <div className="decoration-bubble bubble-1"></div>
            <div className="decoration-bubble bubble-2"></div>
            <div className="decoration-bubble bubble-3"></div>
            <div className="decoration-bubble bubble-4"></div>
            <div className="decoration-bubble bubble-5"></div>
            <div className="decoration-bubble bubble-6"></div>

            {/* 渐变装饰线条 */}
            <div className="decoration-line line-1"></div>
            <div className="decoration-line line-2"></div>
            <div className="decoration-line line-3"></div>
          </div>
        </div>

        {/* 右侧表单区域 */}
        <div className="auth-form-container">
          <div className={`auth-form-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
            <div
              className={`form-transition-container ${isTransitioning ? 'fade-out' : 'fade-in'}`}
            >
              {authMode === 'login' ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={switchToRegister}
                  onForgotPassword={switchToForgotPassword}
                  className="auth-form"
                />
              ) : authMode === 'register' ? (
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={switchToLogin}
                  className="auth-form"
                />
              ) : (
                <ForgotPasswordForm
                  onSuccess={() => {
                    // 忘记密码成功后可以选择返回登录或显示成功消息
                    console.log('密码重置邮件已发送');
                  }}
                  onBackToLogin={switchToLogin}
                  className="auth-form"
                />
              )}
            </div>

            {/* 页脚信息 - 仅在登录页面显示 */}
            {authMode === 'login' && (
              <div className="auth-footer">
                <div className="footer-links">
                  <a href="/privacy" className="footer-link">
                    {t('footer.privacy')}
                  </a>
                  <span className="footer-separator">•</span>
                  <a href="/terms" className="footer-link">
                    {t('footer.terms')}
                  </a>
                  <span className="footer-separator">•</span>
                  <a href="/help" className="footer-link">
                    {t('footer.help')}
                  </a>
                </div>

                <div className="footer-copyright">
                  <p>&copy; 2025 XItools Team. {t('footer.copyright')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
