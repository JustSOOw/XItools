/*
 * @Author: XItools Team
 * @Date: 2025-07-01 16:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 16:30:00
 * @FilePath: \XItools\frontend\src\components\ui\LoadingSpinner.tsx
 * @Description: 加载状态指示器组件，提供多种样式的加载动画
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

export type LoadingSize = 'small' | 'medium' | 'large';
export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'skeleton';

interface LoadingSpinnerProps {
  size?: LoadingSize;
  type?: LoadingType;
  text?: string;
  overlay?: boolean;
  className?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  type = 'spinner',
  text,
  overlay = false,
  className = '',
  color
}) => {
  const { t } = useTranslation('common');

  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large'
  };

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`loading-dots ${sizeClasses[size]}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`loading-pulse ${sizeClasses[size]}`}>
            <div className="pulse-circle"></div>
          </div>
        );
      
      case 'skeleton':
        return (
          <div className={`loading-skeleton ${sizeClasses[size]}`}>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line"></div>
          </div>
        );
      
      default: // spinner
        return (
          <div className={`loading-spinner ${sizeClasses[size]}`}>
            <div className="spinner-circle"></div>
          </div>
        );
    }
  };

  const content = (
    <div 
      className={`loading-container ${className}`}
      style={color ? { '--loading-color': color } as React.CSSProperties : undefined}
    >
      {renderSpinner()}
      {text && (
        <div className="loading-text">
          {text}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

// 内联加载器（用于按钮等小空间）
export const InlineLoader: React.FC<{
  size?: LoadingSize;
  className?: string;
}> = ({ size = 'small', className = '' }) => {
  return (
    <div className={`inline-loader ${className}`}>
      <div className={`spinner-inline ${size}`}>
        <div className="spinner-circle"></div>
      </div>
    </div>
  );
};

// 页面加载器（全屏覆盖）
export const PageLoader: React.FC<{
  text?: string;
  logo?: boolean;
}> = ({ text, logo = true }) => {
  const { t } = useTranslation('common');
  
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        {logo && (
          <div className="loader-logo">
            <img src="/logo.svg" alt="XItools" className="logo-image" />
          </div>
        )}
        <LoadingSpinner 
          size="large" 
          type="spinner"
          text={text || t('loading.text')}
        />
      </div>
    </div>
  );
};

// 骨架屏加载器
export const SkeletonLoader: React.FC<{
  lines?: number;
  avatar?: boolean;
  className?: string;
}> = ({ lines = 3, avatar = false, className = '' }) => {
  return (
    <div className={`skeleton-loader ${className}`}>
      {avatar && (
        <div className="skeleton-avatar"></div>
      )}
      <div className="skeleton-content">
        {Array.from({ length: lines }, (_, index) => (
          <div 
            key={index}
            className={`skeleton-line ${index === lines - 1 ? 'short' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
