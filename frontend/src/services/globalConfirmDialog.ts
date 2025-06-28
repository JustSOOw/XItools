/**
 * 全局确认对话框服务
 * 提供全局的确认对话框功能，类似于Toast的全局API
 */

import { ConfirmDialogProps } from '../components/feedback/ConfirmDialog';

// 确认对话框配置类型
export interface GlobalConfirmDialogConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

// 确认对话框API类型
export interface GlobalConfirmDialogAPI {
  showConfirm: (config: GlobalConfirmDialogConfig, onConfirm?: () => void | Promise<void>) => void;
  hideConfirm: () => void;
}

// 全局状态管理
let globalConfirmDialogAPI: GlobalConfirmDialogAPI | null = null;

/**
 * 设置全局确认对话框API
 * 由App组件调用，注册全局API
 */
export const setGlobalConfirmDialogAPI = (api: GlobalConfirmDialogAPI) => {
  globalConfirmDialogAPI = api;
};

/**
 * 全局确认对话框方法
 * 可以在任何组件中使用，无需Provider
 */
export const globalConfirmDialog = {
  /**
   * 显示确认对话框
   */
  show: (config: GlobalConfirmDialogConfig, onConfirm?: () => void | Promise<void>) => {
    if (globalConfirmDialogAPI) {
      return globalConfirmDialogAPI.showConfirm(config, onConfirm);
    }
    console.warn('Global ConfirmDialog API not initialized. Please ensure App component is properly set up.');
    
    // 降级到原生confirm作为备用方案
    const result = window.confirm(`${config.title ? config.title + '\n\n' : ''}${config.message}`);
    if (result && onConfirm) {
      try {
        const result = onConfirm();
        if (result instanceof Promise) {
          result.catch(error => console.error('确认操作失败:', error));
        }
      } catch (error) {
        console.error('确认操作失败:', error);
      }
    }
  },

  /**
   * 隐藏确认对话框
   */
  hide: () => {
    if (globalConfirmDialogAPI) {
      globalConfirmDialogAPI.hideConfirm();
    }
  },

  /**
   * 便捷方法：显示危险操作确认对话框
   */
  danger: (message: string, onConfirm?: () => void | Promise<void>, title?: string) => {
    return globalConfirmDialog.show({
      title: title || '危险操作',
      message,
      type: 'danger',
      confirmText: '确定',
      cancelText: '取消',
    }, onConfirm);
  },

  /**
   * 便捷方法：显示警告确认对话框
   */
  warning: (message: string, onConfirm?: () => void | Promise<void>, title?: string) => {
    return globalConfirmDialog.show({
      title: title || '警告',
      message,
      type: 'warning',
      confirmText: '确定',
      cancelText: '取消',
    }, onConfirm);
  },

  /**
   * 便捷方法：显示信息确认对话框
   */
  info: (message: string, onConfirm?: () => void | Promise<void>, title?: string) => {
    return globalConfirmDialog.show({
      title: title || '提示',
      message,
      type: 'info',
      confirmText: '确定',
      cancelText: '取消',
    }, onConfirm);
  },

  /**
   * 便捷方法：显示删除确认对话框
   */
  delete: (itemName: string, onConfirm?: () => void | Promise<void>) => {
    return globalConfirmDialog.show({
      title: '确认删除',
      message: `确定要删除"${itemName}"吗？此操作不可撤销。`,
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消',
    }, onConfirm);
  },
};

// 导出类型
export type { GlobalConfirmDialogConfig, GlobalConfirmDialogAPI };
export default globalConfirmDialog;
