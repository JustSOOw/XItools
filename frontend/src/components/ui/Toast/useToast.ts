/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 21:10:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 21:10:00
 * @FilePath: \XItools\frontend\src\components\ui\Toast\useToast.ts
 * @Description: Toast Hook - 提供Toast通知的状态管理和API
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import { useState, useCallback, useMemo } from 'react';
import { ToastProps, ToastAction } from './Toast';

interface ToastOptions {
  title?: string;
  duration?: number;
  action?: ToastAction;
  position?: ToastProps['position'];
}

interface ToastAPI {
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/**
 * Toast Hook
 * 提供Toast通知的状态管理和便捷API
 */
export const useToast = (): [ToastProps[], ToastAPI] => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // 生成唯一ID
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 添加Toast
  const addToast = useCallback((
    type: ToastProps['type'],
    message: string,
    options: ToastOptions = {}
  ): string => {
    const id = generateId();
    const toast: ToastProps = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration,
      action: options.action,
      position: options.position || 'bottom-right',
      onClose: (toastId) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      },
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, [generateId]);

  // 移除Toast
  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 移除所有Toast
  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // 便捷API - 使用useMemo避免每次渲染都创建新对象
  const api: ToastAPI = useMemo(() => ({
    success: (message, options) => addToast('success', message, options),
    error: (message, options) => addToast('error', message, options),
    warning: (message, options) => addToast('warning', message, options),
    info: (message, options) => addToast('info', message, options),
    dismiss,
    dismissAll,
  }), [addToast, dismiss, dismissAll]);

  return [toasts, api];
};

// 全局Toast实例（可选）
let globalToastAPI: ToastAPI | null = null;

export const setGlobalToastAPI = (api: ToastAPI) => {
  globalToastAPI = api;
};

// 全局Toast方法
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    if (globalToastAPI) {
      return globalToastAPI.success(message, options);
    }
    console.warn('Toast API not initialized. Please use ToastProvider.');
    return '';
  },
  error: (message: string, options?: ToastOptions) => {
    if (globalToastAPI) {
      return globalToastAPI.error(message, options);
    }
    console.warn('Toast API not initialized. Please use ToastProvider.');
    return '';
  },
  warning: (message: string, options?: ToastOptions) => {
    if (globalToastAPI) {
      return globalToastAPI.warning(message, options);
    }
    console.warn('Toast API not initialized. Please use ToastProvider.');
    return '';
  },
  info: (message: string, options?: ToastOptions) => {
    if (globalToastAPI) {
      return globalToastAPI.info(message, options);
    }
    console.warn('Toast API not initialized. Please use ToastProvider.');
    return '';
  },
  dismiss: (id: string) => {
    if (globalToastAPI) {
      globalToastAPI.dismiss(id);
    }
  },
  dismissAll: () => {
    if (globalToastAPI) {
      globalToastAPI.dismissAll();
    }
  },
};

export default useToast;
