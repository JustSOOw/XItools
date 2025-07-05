/*
 * @Author: XItools Team
 * @Date: 2025-07-01 17:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 17:00:00
 * @FilePath: \XItools\frontend\src\hooks\useUserFeedback.ts
 * @Description: 用户反馈Hook，提供统一的用户反馈机制
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../components/ui/Toast';
import { useAuthError } from './useAuthError';

/**
 * 反馈类型
 */
export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

/**
 * 反馈选项
 */
export interface FeedbackOptions {
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * 用户反馈Hook
 */
export function useUserFeedback() {
  const { t } = useTranslation(['auth', 'common']);
  const { handleLoginError, handleRegisterError, handleProfileError } = useAuthError();

  /**
   * 显示成功消息
   */
  const showSuccess = useCallback((message: string, options?: FeedbackOptions) => {
    return toast.success(message, {
      title: options?.title || t('common:feedback.success'),
      duration: options?.duration || 4000,
      action: options?.action,
      position: options?.position
    });
  }, [t]);

  /**
   * 显示错误消息
   */
  const showError = useCallback((message: string, options?: FeedbackOptions) => {
    return toast.error(message, {
      title: options?.title || t('common:feedback.error'),
      duration: options?.duration || 6000,
      action: options?.action,
      position: options?.position
    });
  }, [t]);

  /**
   * 显示警告消息
   */
  const showWarning = useCallback((message: string, options?: FeedbackOptions) => {
    return toast.warning(message, {
      title: options?.title || t('common:feedback.warning'),
      duration: options?.duration || 5000,
      action: options?.action,
      position: options?.position
    });
  }, [t]);

  /**
   * 显示信息消息
   */
  const showInfo = useCallback((message: string, options?: FeedbackOptions) => {
    return toast.info(message, {
      title: options?.title || t('common:feedback.info'),
      duration: options?.duration || 4000,
      action: options?.action,
      position: options?.position
    });
  }, [t]);

  /**
   * 认证相关反馈
   */
  const authFeedback = {
    /**
     * 登录成功
     */
    loginSuccess: useCallback((username?: string) => {
      const message = username
        ? t('feedback.loginSuccess', { username })
        : t('feedback.loginSuccessGeneric');

      return showSuccess(message, {
        title: t('feedback.welcome'),
        duration: 3000
      });
    }, [showSuccess, t]),

    /**
     * 登录失败
     */
    loginError: useCallback((error: any) => {
      const message = handleLoginError(error);
      return showError(message, {
        title: t('feedback.loginFailed'),
        duration: 6000
      });
    }, [showError, handleLoginError, t]),

    /**
     * 注册成功
     */
    registerSuccess: useCallback((username?: string) => {
      const message = username
        ? t('feedback.registerSuccess', { username })
        : t('feedback.registerSuccessGeneric');

      return showSuccess(message, {
        title: t('feedback.welcomeNew'),
        duration: 4000
      });
    }, [showSuccess, t]),

    /**
     * 注册失败
     */
    registerError: useCallback((error: any) => {
      const message = handleRegisterError(error);
      return showError(message, {
        title: t('feedback.registerFailed'),
        duration: 6000
      });
    }, [showError, handleRegisterError, t]),

    /**
     * 登出成功
     */
    logoutSuccess: useCallback(() => {
      return showInfo(t('feedback.logoutSuccess'), {
        title: t('feedback.goodbye'),
        duration: 3000
      });
    }, [showInfo, t]),

    /**
     * 密码修改成功
     */
    passwordChangeSuccess: useCallback(() => {
      return showSuccess(t('feedback.passwordChanged'), {
        title: t('feedback.securityUpdate'),
        duration: 4000
      });
    }, [showSuccess, t]),

    /**
     * 密码修改失败
     */
    passwordChangeError: useCallback((error: any) => {
      const message = handleProfileError(error);
      return showError(message, {
        title: t('feedback.passwordChangeFailed'),
        duration: 6000
      });
    }, [showError, handleProfileError, t]),

    /**
     * 资料更新成功
     */
    profileUpdateSuccess: useCallback(() => {
      return showSuccess(t('feedback.profileUpdated'), {
        title: t('feedback.profileSaved'),
        duration: 3000
      });
    }, [showSuccess, t]),

    /**
     * 资料更新失败
     */
    profileUpdateError: useCallback((error: any) => {
      const message = handleProfileError(error);
      return showError(message, {
        title: t('feedback.profileUpdateFailed'),
        duration: 6000
      });
    }, [showError, handleProfileError, t]),

    /**
     * Token过期提醒
     */
    tokenExpired: useCallback(() => {
      return showWarning(t('feedback.sessionExpired'), {
        title: t('feedback.sessionExpiredTitle'),
        duration: 8000,
        action: {
          label: t('feedback.relogin'),
          onClick: () => {
            window.location.href = '/login';
          }
        }
      });
    }, [showWarning, t]),

    /**
     * 网络错误
     */
    networkError: useCallback(() => {
      return showError(t('feedback.networkError'), {
        title: t('feedback.connectionProblem'),
        duration: 6000,
        action: {
          label: t('feedback.retry'),
          onClick: () => {
            window.location.reload();
          }
        }
      });
    }, [showError, t])
  };

  /**
   * 操作反馈
   */
  const operationFeedback = {
    /**
     * 保存成功
     */
    saveSuccess: useCallback((itemName?: string) => {
      const message = itemName
        ? t('common:feedback.saveSuccessItem', { item: itemName })
        : t('common:feedback.saveSuccess');
      
      return showSuccess(message, { duration: 3000 });
    }, [showSuccess, t]),

    /**
     * 删除成功
     */
    deleteSuccess: useCallback((itemName?: string) => {
      const message = itemName
        ? t('common:feedback.deleteSuccessItem', { item: itemName })
        : t('common:feedback.deleteSuccess');
      
      return showSuccess(message, { duration: 3000 });
    }, [showSuccess, t]),

    /**
     * 复制成功
     */
    copySuccess: useCallback((content?: string) => {
      const message = content
        ? t('common:feedback.copySuccessContent', { content })
        : t('common:feedback.copySuccess');
      
      return showSuccess(message, { duration: 2000 });
    }, [showSuccess, t]),

    /**
     * 操作失败
     */
    operationError: useCallback((operation: string, error?: string) => {
      const message = error || t('common:feedback.operationFailed', { operation });
      return showError(message, { duration: 5000 });
    }, [showError, t]),

    /**
     * 加载失败
     */
    loadError: useCallback((resource?: string) => {
      const message = resource
        ? t('common:feedback.loadErrorResource', { resource })
        : t('common:feedback.loadError');
      
      return showError(message, {
        duration: 5000,
        action: {
          label: t('common:feedback.refresh'),
          onClick: () => {
            window.location.reload();
          }
        }
      });
    }, [showError, t])
  };

  /**
   * 表单验证反馈
   */
  const validationFeedback = {
    /**
     * 表单验证失败
     */
    validationError: useCallback((message?: string) => {
      return showWarning(
        message || t('common:feedback.validationError'),
        {
          title: t('common:feedback.checkInput'),
          duration: 4000
        }
      );
    }, [showWarning, t]),

    /**
     * 必填字段提醒
     */
    requiredFields: useCallback((fields: string[]) => {
      const message = t('common:feedback.requiredFields', { 
        fields: fields.join(', ') 
      });
      
      return showWarning(message, {
        title: t('common:feedback.incompleteForm'),
        duration: 5000
      });
    }, [showWarning, t])
  };

  return {
    // 基础反馈方法
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // 认证相关反馈
    auth: authFeedback,
    
    // 操作反馈
    operation: operationFeedback,
    
    // 表单验证反馈
    validation: validationFeedback
  };
}

export default useUserFeedback;
