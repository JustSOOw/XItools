/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 21:15:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 21:15:00
 * @FilePath: \XItools\frontend\src\components\ui\Toast\ToastProvider.tsx
 * @Description: Toast提供者组件 - 在应用根部提供Toast功能
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React, { useEffect } from 'react';
import ToastContainer from './ToastContainer';
import { useToast, setGlobalToastAPI } from './useToast';

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Toast提供者组件
 * 应该在应用的根部使用，为整个应用提供Toast功能
 */
const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, toastAPI] = useToast();

  // 设置全局Toast API - 当API对象变化时更新
  useEffect(() => {
    setGlobalToastAPI(toastAPI);
  }, [toastAPI]);

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={toastAPI.dismiss} />
    </>
  );
};

export default ToastProvider;
