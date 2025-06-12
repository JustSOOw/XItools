/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 21:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 21:00:00
 * @FilePath: \XItools\frontend\src\components\ui\Toast\Toast.tsx
 * @Description: Toast通知组件 - 提供轻量级的成功/警告/错误通知
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Portal from '../../Portal';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // 毫秒，0表示不自动关闭
  action?: ToastAction;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

/**
 * 单个Toast通知组件
 */
const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onClose,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // 进入动画
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 自动关闭
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // 等待退出动画完成
  };

  const typeStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: '✕',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: '⚠',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'ℹ',
    },
  };



  const animationClasses = classNames(
    'transition-all duration-300 ease-out',
    {
      'opacity-0 translate-y-2': !isVisible,
      'opacity-100 translate-y-0': isVisible && !isLeaving,
      'opacity-0 translate-y-2 scale-95': isLeaving,
    }
  );

  const style = typeStyles[type];

  return (
    <div
      className={classNames(
        'max-w-sm w-full',
        animationClasses
      )}
    >
      <div
        className={classNames(
          'rounded-lg border shadow-lg p-4',
          style.bg,
          style.border,
          style.text
        )}
      >
        <div className="flex items-start">
          {/* 图标 */}
          <div className="flex-shrink-0">
            <span className="text-lg font-bold">{style.icon}</span>
          </div>

          {/* 内容 */}
          <div className="ml-3 flex-1">
            {title && (
              <h4 className="text-sm font-medium mb-1">{title}</h4>
            )}
            <p className="text-sm">{message}</p>

            {/* 操作按钮 */}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={classNames(
                    'text-sm font-medium underline hover:no-underline focus:outline-none',
                    style.text
                  )}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          {/* 关闭按钮 */}
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={classNames(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-black/5 dark:hover:bg-white/5',
                style.text
              )}
            >
              <span className="sr-only">关闭</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
