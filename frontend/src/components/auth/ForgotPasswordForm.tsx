/*
 * @Author: XItools Team
 * @Date: 2025-07-01 17:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-10-25 21:00:00
 * @FilePath: \XItools\frontend\src\components\auth\ForgotPasswordForm.tsx
 * @Description: 忘记密码表单组件（用户名+邮箱+邮箱验证码）
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useFormValidation } from '../../hooks/useFormValidation';
import { useUserFeedback } from '../../hooks/useUserFeedback';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { apiClient } from '../../utils/apiClient';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

interface ForgotPasswordData {
  username: string;
  email: string;
  verificationCode: string;
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

  // 验证码发送相关状态
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [codeExpiresAt, setCodeExpiresAt] = useState<Date | null>(null);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    data: formData,
    errors: validationErrors,
    updateField,
    validateAll,
    validateSingleField,
    hasErrors,
  } = useFormValidation<ForgotPasswordData>(
    {
      username: '',
      email: '',
      verificationCode: '',
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
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: t('validation.emailInvalid'),
      },
      verificationCode: {
        required: true,
        minLength: 6,
        maxLength: 6,
        message: t('validation.verificationCodeRequired'),
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ForgotPasswordData, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    validateSingleField(name as keyof ForgotPasswordData);
  };

  /**
   * 发送邮箱验证码
   */
  const handleSendCode = async () => {
    // 验证用户名和邮箱
    if (!formData.username.trim()) {
      showError(t('validation.usernameRequired'));
      return;
    }

    if (!formData.email.trim()) {
      showError(t('validation.emailRequired'));
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      showError(t('validation.emailInvalid'));
      return;
    }

    setIsSendingCode(true);

    try {
      const response = await apiClient.post('/auth/request-password-reset', {
        username: formData.username,
        email: formData.email,
      });

      if (response.data.success) {
        setCodeSent(true);
        setCountdown(60); // 60秒倒计时
        setMaskedEmail(response.data.data.maskedEmail);
        setCodeExpiresAt(new Date(response.data.data.expiresAt));

        showSuccess(
          response.data.message || t('forgotPassword.codeSent'),
          {
            title: t('common.feedback.success'),
            duration: 5000,
          }
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || t('forgotPassword.sendCodeFailed');

      showError(errorMessage, {
        title: t('common.feedback.error'),
        duration: 5000,
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  /**
   * 提交表单重置密码
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    if (!codeSent) {
      showError(t('forgotPassword.pleaseGetCode'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', {
        username: formData.username,
        email: formData.email,
        verificationCode: formData.verificationCode,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        setIsSuccess(true);
        showSuccess(response.data.message || t('forgotPassword.resetSuccess'), {
          title: t('forgotPassword.successTitle'),
          duration: 5000,
        });

        onSuccess?.();

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

  if (isSuccess) {
    return (
      <div className={`forgot-password-form success-state ${className}`}>
        <div className="form-header">
          <div className="success-icon">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              className="form-input"
              disabled={isLoading || codeSent}
              autoComplete="username"
              autoFocus
            />
          </div>
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
              className="form-input"
              disabled={isLoading || codeSent}
              autoComplete="email"
            />
          </div>
          {maskedEmail && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('forgotPassword.maskedEmailHint', { email: maskedEmail })}
            </div>
          )}
        </div>

        {/* 验证码输入和发送按钮 */}
        <div className="form-group">
          <label htmlFor="verificationCode" className="form-label">
            {t('forgotPassword.verificationCodeLabel')}
          </label>
          <div className="flex gap-2">
            <div className="input-wrapper flex-1">
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder={t('forgotPassword.verificationCodePlaceholder')}
                className="form-input"
                disabled={isLoading || !codeSent}
                autoComplete="off"
                maxLength={6}
              />
            </div>
            <button
              type="button"
              className={`send-code-button ${countdown > 0 ? 'disabled' : ''}`}
              onClick={handleSendCode}
              disabled={isSendingCode || countdown > 0 || isLoading}
            >
              {isSendingCode ? (
                <>
                  <LoadingSpinner size="small" type="spinner" />
                  <span>{t('forgotPassword.sendingCode')}</span>
                </>
              ) : countdown > 0 ? (
                <span>{t('forgotPassword.resendAfter', { seconds: countdown })}</span>
              ) : codeSent ? (
                <span>{t('forgotPassword.resendCode')}</span>
              ) : (
                <span>{t('forgotPassword.sendCode')}</span>
              )}
            </button>
          </div>
        </div>

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
              onBlur={handleInputBlur}
              placeholder={t('forgotPassword.newPasswordPlaceholder')}
              className="form-input"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword((prev) => !prev)}
              disabled={isLoading}
            >
              {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

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
              onBlur={handleInputBlur}
              placeholder={t('forgotPassword.confirmPasswordPlaceholder')}
              className="form-input"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button type="submit" className={`submit-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="small" type="spinner" />
              <span>{t('forgotPassword.resetting')}</span>
            </>
          ) : (
            <span>{t('forgotPassword.submit')}</span>
          )}
        </button>

        <div className="form-footer">
          <button type="button" className="back-link" onClick={onBackToLogin} disabled={isLoading}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t('forgotPassword.backToLogin')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
