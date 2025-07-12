/**
 * 全局确认对话框上下文
 * 提供全局的确认对话框功能，确保对话框在整个应用层面显示
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmDialogProps } from '../components/feedback/ConfirmDialog';

// 确认对话框配置类型
export interface ConfirmDialogConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

// 确认对话框API类型
export interface ConfirmDialogAPI {
  showConfirm: (config: ConfirmDialogConfig, onConfirm?: () => void | Promise<void>) => void;
  hideConfirm: () => void;
}

// 确认对话框状态类型
interface ConfirmDialogState {
  isOpen: boolean;
  config: ConfirmDialogConfig;
  onConfirm?: () => void | Promise<void>;
}

// 创建上下文
const ConfirmDialogContext = createContext<ConfirmDialogAPI | null>(null);

// Provider组件属性
interface ConfirmDialogProviderProps {
  children: React.ReactNode;
}

/**
 * 全局确认对话框Provider
 * 应该在App组件的顶层使用
 */
export const ConfirmDialogProvider: React.FC<ConfirmDialogProviderProps> = ({ children }) => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    config: { message: '' },
  });

  // 显示确认对话框
  const showConfirm = useCallback(
    (config: ConfirmDialogConfig, onConfirm?: () => void | Promise<void>) => {
      setDialogState({
        isOpen: true,
        config,
        onConfirm,
      });
    },
    [],
  );

  // 隐藏确认对话框
  const hideConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 处理确认操作
  const handleConfirm = useCallback(async () => {
    if (dialogState.onConfirm) {
      try {
        await dialogState.onConfirm();
        hideConfirm();
      } catch (error) {
        console.error('确认操作失败:', error);
        // 可以在这里添加错误处理逻辑
        hideConfirm();
      }
    } else {
      hideConfirm();
    }
  }, [dialogState.onConfirm, hideConfirm]);

  // API对象
  const api: ConfirmDialogAPI = {
    showConfirm,
    hideConfirm,
  };

  return (
    <ConfirmDialogContext.Provider value={api}>
      {children}
      {/* 这里不渲染ConfirmDialog，而是通过Context暴露状态给App组件 */}
    </ConfirmDialogContext.Provider>
  );
};

/**
 * 使用全局确认对话框的Hook
 */
export const useGlobalConfirmDialog = (): ConfirmDialogAPI => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useGlobalConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
};

/**
 * 获取确认对话框状态的Hook（仅供App组件使用）
 */
export const useConfirmDialogState = () => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    config: { message: '' },
  });

  const showConfirm = useCallback(
    (config: ConfirmDialogConfig, onConfirm?: () => void | Promise<void>) => {
      setDialogState({
        isOpen: true,
        config,
        onConfirm,
      });
    },
    [],
  );

  const hideConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (dialogState.onConfirm) {
      try {
        await dialogState.onConfirm();
        hideConfirm();
      } catch (error) {
        console.error('确认操作失败:', error);
        hideConfirm();
      }
    } else {
      hideConfirm();
    }
  }, [dialogState.onConfirm, hideConfirm]);

  return {
    dialogState,
    showConfirm,
    hideConfirm,
    handleConfirm,
  };
};

export default ConfirmDialogContext;
