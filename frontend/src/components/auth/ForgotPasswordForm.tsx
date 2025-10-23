/*
 * @Author: XItools Team
 * @Date: 2025-07-01 17:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-10-12 10:00:00
 * @FilePath: \XItools\frontend\src\components\auth\ForgotPasswordForm.tsx
 * @Description: 忘记密码表单组件（简化版：用户名+邮箱验证）
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useUserFeedback } from '../../hooks/useUserFeedback';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../api/apiClient';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

interface ForgotPasswordData {
  username: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
  className = '',
}) => {
  const { t } = useTranslation('auth');
  const { showSuccess, showError } = useUserFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 表单验证
  const {
    data: formData,
    errors: validationErrors,
    updateField,
    validateAll,
    hasErrors,
  } = useFormValidation<ForgotPasswordData>(
    {
      username: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
    {
      username: {
        required: true,
        message: t('validation.usernameRequired'),
      },
      email: {
        required: true,
        email: true,
        message: t('validation.emailRequired'),
      },
      newPassword: {
        required: true,
        minLength: 6,
        message: t('validation.passwordMinLength'),
      },
      confirmPassword: {
        required: true,
        custom: (value) => {
          if (value !== formData.newPassword) {
            return t('validation.passwordMismatch');
          }
          return '';
        },
      },
    },
  );

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ForgotPasswordData, value);
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    setIsLoading(true);

    try {
      // 调用后端重置密码 API
      const response = await apiClient.post('/auth/reset-password', {
        username: formData.username,
        email: formData.email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        setIsSuccess(true);
        showSuccess(response.data.message || t('forgotPassword.resetSuccess'), {
          title: t('forgotPassword.successTitle'),
          duration: 5000,
        });

        // 3秒后自动跳转到登录页
        setTimeout(() => {
          onBackToLogin?.();
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || t('forgotPassword.resetFailed');
      showError(errorMessage, {
        title: t('forgotPassword.error'),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 成功状态界面
  if (isSuccess) {
    return (
      <div className={`forgot-password-form success-state ${className}`}>
        <div className="form-header">
          <div className="success-icon">
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="form-title">{t('forgotPassword.successTitle')}</h2>
          <p className="form-subtitle">{t('forgotPassword.successMessage')}</p>
        </div>

        <div className="form-content">
          <div className="form-actions">
            <button type="button" className="submit-button" onClick={onBackToLogin}>
              <span>{t('forgotPassword.backToLogin')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 重置密码表单
  return (
    <div className={`forgot-password-form ${className}`}>
      <div className="form-header">
        <h2 className="form-title">{t('forgotPassword.title')}</h2>
        <p className="form-subtitle">{t('forgotPassword.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* 用户名输入 */}
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            {t('forgotPassword.usernameLabel')}
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={t('forgotPassword.usernamePlaceholder')}
              className={`form-input ${validationErrors.username ? 'error' : ''}`}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
            />
          </div>
          {validationErrors.username && (
            <span className="error-message">{validationErrors.username}</span>
          )}
        </div>

        {/* 邮箱输入 */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            {t('forgotPassword.emailLabel')}
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('forgotPassword.emailPlaceholder')}
              className={`form-input ${validationErrors.email ? 'error' : ''}`}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          {validationErrors.email && <span className="error-message">{validationErrors.email}</span>}
        </div>

        {/* 新密码输入 */}
        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">
            {t('forgotPassword.newPasswordLabel')}
          </label>
          <div className="input-wrapper">
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder={t('forgotPassword.newPasswordPlaceholder')}
              className={`form-input ${validationErrors.newPassword ? 'error' : ''}`}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isLoading}
            >
              {showNewPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {validationErrors.newPassword && (
            <span className="error-message">{validationErrors.newPassword}</span>
          )}
        </div>

        {/* 确认密码输入 */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            {t('forgotPassword.confirmPasswordLabel')}
          </label>
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder={t('forgotPassword.confirmPasswordPlaceholder')}
              className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <span className="error-message">{validationErrors.confirmPassword}</span>
          )}
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading || hasErrors()}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" type="spinner" />
              <span>{t('forgotPassword.resetting')}</span>
            </>
          ) : (
            <span>{t('forgotPassword.submit')}</span>
          )}
        </button>

        {/* 返回登录 */}
        <div className="form-footer">
          <button type="button" className="back-link" onClick={onBackToLogin} disabled={isLoading}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>{t('forgotPassword.backToLogin')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
