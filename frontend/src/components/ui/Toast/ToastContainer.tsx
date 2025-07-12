/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 21:05:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 21:05:00
 * @FilePath: \XItools\frontend\src\components\ui\Toast\ToastContainer.tsx
 * @Description: Toast容器组件 - 管理多个Toast通知的显示和位置
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React from 'react';
import Portal from '../../Portal';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

/**
 * Toast容器组件
 * 负责渲染所有Toast通知并管理它们的位置
 */
const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  // 按位置分组Toast
  const toastsByPosition = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || 'top-right';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    },
    {} as Record<string, ToastProps[]>,
  );

  return (
    <Portal>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => {
        // 为不同位置设置容器样式
        const containerClasses = {
          'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none',
          'top-right': 'fixed top-4 right-4 z-40 pointer-events-none',
          'top-left': 'fixed top-4 left-4 z-40 pointer-events-none',
          'bottom-center':
            'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none',
          'bottom-right': 'fixed bottom-4 right-4 z-40 pointer-events-none',
          'bottom-left': 'fixed bottom-4 left-4 z-40 pointer-events-none',
        };

        return (
          <div
            key={position}
            className={containerClasses[position as keyof typeof containerClasses]}
          >
            <div className="space-y-3">
              {positionToasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                  <Toast {...toast} onClose={onClose} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Portal>
  );
};

export default ToastContainer;
