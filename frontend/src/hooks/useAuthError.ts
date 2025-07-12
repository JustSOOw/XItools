/*
 * @Author: XItools Team
 * @Date: 2025-07-01 13:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 13:30:00
 * @FilePath: \XItools\frontend\src\hooks\useAuthError.ts
 * @Description: 认证错误处理Hook，提供统一的错误处理和多语言支持
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorHandler, ErrorInfo, AuthErrorCode, getErrorMessage } from '../utils/errorHandler';

/**
 * 认证错误处理Hook
 */
export function useAuthError() {
  const { t } = useTranslation('auth');

  // 创建错误处理器实例
  const errorHandler = new ErrorHandler(t);

  /**
   * 处理API错误
   */
  const handleError = useCallback(
    (error: any): ErrorInfo => {
      return errorHandler.handleApiError(error);
    },
    [errorHandler],
  );

  /**
   * 获取用户友好的错误消息
   */
  const getErrorMsg = useCallback(
    (error: any): string => {
      return getErrorMessage(error, t);
    },
    [t],
  );

  /**
   * 处理注册错误
   */
  const handleRegisterError = useCallback(
    (error: any): string => {
      const errorInfo = handleError(error);

      // 根据错误类型返回特定的消息
      if (errorInfo.code === AuthErrorCode.USERNAME_TAKEN) {
        return t('errors.register.usernameExists');
      }
      if (errorInfo.code === AuthErrorCode.EMAIL_TAKEN) {
        return t('errors.register.emailExists');
      }
      if (errorInfo.code === AuthErrorCode.WEAK_PASSWORD) {
        return t('errors.register.weakPassword');
      }

      // 检查原始错误消息中的关键词
      const originalError = error.response?.data?.error || '';
      if (originalError.includes('用户名') || originalError.includes('username')) {
        return t('errors.register.usernameExists');
      }
      if (originalError.includes('邮箱') || originalError.includes('email')) {
        return t('errors.register.emailExists');
      }
      if (originalError.includes('密码') || originalError.includes('password')) {
        return t('errors.register.weakPassword');
      }

      return errorInfo.message || t('errors.register.failed');
    },
    [handleError, t],
  );

  /**
   * 处理登录错误
   */
  const handleLoginError = useCallback(
    (error: any): string => {
      const errorInfo = handleError(error);

      // 根据错误类型返回特定的消息
      if (errorInfo.code === AuthErrorCode.INVALID_CREDENTIALS) {
        return t('errors.login.invalidCredentials');
      }
      if (errorInfo.code === AuthErrorCode.USER_NOT_FOUND) {
        return t('errors.login.userNotFound');
      }
      if (errorInfo.code === AuthErrorCode.USER_INACTIVE) {
        return t('errors.login.userInactive');
      }

      // 检查原始错误消息中的关键词
      const originalError = error.response?.data?.error || '';
      if (originalError.includes('用户不存在') || originalError.includes('User does not exist')) {
        return t('errors.login.userNotFound');
      }
      if (originalError.includes('密码错误') || originalError.includes('password')) {
        return t('errors.login.invalidCredentials');
      }
      if (originalError.includes('禁用') || originalError.includes('disabled')) {
        return t('errors.login.userInactive');
      }

      return errorInfo.message || t('errors.login.failed');
    },
    [handleError, t],
  );

  /**
   * 处理Token错误
   */
  const handleTokenError = useCallback(
    (error: any): string => {
      const errorInfo = handleError(error);

      if (errorInfo.code === AuthErrorCode.TOKEN_EXPIRED) {
        return t('errors.token.expired');
      }
      if (errorInfo.code === AuthErrorCode.TOKEN_INVALID) {
        return t('errors.token.invalid');
      }
      if (errorInfo.code === AuthErrorCode.SESSION_REVOKED) {
        return t('errors.session.revoked');
      }

      // 检查原始错误消息
      const originalError = error.response?.data?.error || '';
      if (originalError.includes('过期') || originalError.includes('expired')) {
        return t('errors.token.expired');
      }
      if (originalError.includes('无效') || originalError.includes('invalid')) {
        return t('errors.token.invalid');
      }
      if (originalError.includes('缺少') || originalError.includes('missing')) {
        return t('errors.token.missing');
      }

      return errorInfo.message || t('errors.token.invalid');
    },
    [handleError, t],
  );

  /**
   * 处理权限错误
   */
  const handlePermissionError = useCallback(
    (error: any): string => {
      const errorInfo = handleError(error);

      if (errorInfo.code === AuthErrorCode.INSUFFICIENT_PERMISSIONS) {
        return t('errors.permission.insufficient');
      }

      // 检查原始错误消息
      const originalError = error.response?.data?.error || '';
      if (originalError.includes('无权') || originalError.includes('forbidden')) {
        return t('errors.permission.forbidden');
      }
      if (originalError.includes('权限') || originalError.includes('permission')) {
        return t('errors.permission.insufficient');
      }

      return errorInfo.message || t('errors.permission.accessDenied');
    },
    [handleError, t],
  );

  /**
   * 处理资料更新错误
   */
  const handleProfileError = useCallback(
    (error: any): string => {
      const originalError = error.response?.data?.error || '';

      if (originalError.includes('当前密码') || originalError.includes('current password')) {
        return t('errors.profile.currentPasswordIncorrect');
      }
      if (originalError.includes('相同') || originalError.includes('same')) {
        return t('errors.profile.passwordSameAsCurrent');
      }
      if (originalError.includes('头像') || originalError.includes('avatar')) {
        return t('errors.profile.avatarUploadFailed');
      }
      if (originalError.includes('密码') || originalError.includes('password')) {
        return t('errors.profile.passwordChangeFailed');
      }

      return getErrorMsg(error) || t('errors.profile.updateFailed');
    },
    [getErrorMsg, t],
  );

  /**
   * 检查错误类型
   */
  const isAuthError = useCallback(
    (error: any): boolean => {
      return errorHandler.isAuthError(error);
    },
    [errorHandler],
  );

  const isPermissionError = useCallback(
    (error: any): boolean => {
      return errorHandler.isPermissionError(error);
    },
    [errorHandler],
  );

  const isNetworkError = useCallback(
    (error: any): boolean => {
      return errorHandler.isNetworkError(error);
    },
    [errorHandler],
  );

  return {
    // 通用错误处理
    handleError,
    getErrorMessage: getErrorMsg,

    // 特定场景错误处理
    handleRegisterError,
    handleLoginError,
    handleTokenError,
    handlePermissionError,
    handleProfileError,

    // 错误类型检查
    isAuthError,
    isPermissionError,
    isNetworkError,

    // 错误处理器实例
    errorHandler,
  };
}

export default useAuthError;
