/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 20:15:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 20:15:00
 * @FilePath: \XItools\frontend\src\components\ui\Loading\LoadingSpinner.tsx
 * @Description: 加载旋转器组件 - 提供多种样式的加载动画
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import classNames from 'classnames';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
  text?: string;
}

/**
 * 加载旋转器组件
 * 提供多种样式和大小的加载动画
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  className = '',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    muted: 'text-text-secondary',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <svg
            className={classNames(
              'animate-spin',
              sizeClasses[size],
              colorClasses[color]
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );

      case 'dots':
        return (
          <div className={classNames('flex space-x-1', sizeClasses[size])}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={classNames(
                  'rounded-full animate-pulse',
                  colorClasses[color],
                  'bg-current w-1/4 h-1/4'
                )}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '1s',
                }}
              ></div>
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={classNames(
              'rounded-full animate-ping',
              sizeClasses[size],
              colorClasses[color],
              'bg-current opacity-75'
            )}
          ></div>
        );

      case 'bars':
        return (
          <div className={classNames('flex items-end space-x-1', sizeClasses[size])}>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={classNames(
                  'animate-pulse bg-current w-1/5',
                  colorClasses[color]
                )}
                style={{
                  height: `${25 + (index % 2) * 50}%`,
                  animationDelay: `${index * 0.15}s`,
                  animationDuration: '1.2s',
                }}
              ></div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={classNames('flex flex-col items-center justify-center', className)}>
      {renderSpinner()}
      {text && (
        <p className={classNames(
          'mt-2 text-sm',
          colorClasses[color],
          'animate-pulse'
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * 全屏加载组件
 */
export const FullScreenLoader: React.FC<{
  text?: string;
  variant?: LoadingSpinnerProps['variant'];
}> = ({ text = '加载中...', variant = 'spinner' }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface rounded-lg p-8 shadow-xl">
        <LoadingSpinner
          size="lg"
          variant={variant}
          color="primary"
          text={text}
        />
      </div>
    </div>
  );
};

/**
 * 内联加载组件 - 用于按钮或小区域
 */
export const InlineLoader: React.FC<{
  size?: LoadingSpinnerProps['size'];
  className?: string;
}> = ({ size = 'sm', className = '' }) => {
  return (
    <LoadingSpinner
      size={size}
      variant="spinner"
      color="muted"
      className={className}
    />
  );
};

/**
 * 卡片加载组件 - 用于卡片内容加载
 */
export const CardLoader: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = '加载中...', className = '' }) => {
  return (
    <div className={classNames(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      <LoadingSpinner
        size="md"
        variant="dots"
        color="primary"
        text={text}
      />
    </div>
  );
};

export default LoadingSpinner;
