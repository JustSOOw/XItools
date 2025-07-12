/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\feedback\ConfirmDialog.tsx
 * @Description: 操作确认对话框组件 - 提供用户操作确认功能
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React from 'react';
import { ConfirmDialogAnimation } from '../animations';
import Button from '../Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

/**
 * 操作确认对话框组件
 * 为重要操作提供二次确认功能
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  type = 'info',
  isLoading = false,
}) => {
  // 根据类型获取图标和样式
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-error/10',
          iconColor: 'text-error',
          confirmVariant: 'danger' as const,
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-warning/10',
          iconColor: 'text-warning',
          confirmVariant: 'warning' as const,
        };
      case 'success':
        return {
          icon: '✅',
          iconBg: 'bg-success/10',
          iconColor: 'text-success',
          confirmVariant: 'success' as const,
        };
      default:
        return {
          icon: 'ℹ️',
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          confirmVariant: 'primary' as const,
        };
    }
  };

  const typeConfig = getTypeConfig();

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <ConfirmDialogAnimation isOpen={isOpen} onOverlayClick={onClose}>
      <div className="p-6">
        {/* 图标和标题 */}
        <div className="flex items-start space-x-4 mb-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${typeConfig.iconBg} flex items-center justify-center`}
          >
            <span className={`text-lg ${typeConfig.iconColor}`}>{typeConfig.icon}</span>
          </div>
          <div className="flex-1">
            {title && <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>}
            <p className="text-text-secondary leading-relaxed">{message}</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={typeConfig.confirmVariant} onClick={handleConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </ConfirmDialogAnimation>
  );
};

/**
 * 确认对话框Hook
 * 提供便捷的确认对话框调用方式
 */
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    props: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>;
    onConfirm?: () => void | Promise<void>;
  }>({
    isOpen: false,
    props: { message: '' },
  });

  const showConfirm = React.useCallback(
    (
      props: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>,
      onConfirm?: () => void | Promise<void>,
    ) => {
      setDialogState({
        isOpen: true,
        props,
        onConfirm,
      });
    },
    [],
  );

  const hideConfirm = React.useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = React.useCallback(async () => {
    if (dialogState.onConfirm) {
      try {
        await dialogState.onConfirm();
        hideConfirm();
      } catch (error) {
        console.error('确认操作失败:', error);
        // 可以在这里添加错误处理逻辑
      }
    } else {
      hideConfirm();
    }
  }, [dialogState.onConfirm, hideConfirm]);

  const ConfirmDialogComponent = React.useMemo(
    () => (
      <ConfirmDialog
        {...dialogState.props}
        isOpen={dialogState.isOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
      />
    ),
    [dialogState, hideConfirm, handleConfirm],
  );

  return {
    showConfirm,
    hideConfirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
};

export default ConfirmDialog;
