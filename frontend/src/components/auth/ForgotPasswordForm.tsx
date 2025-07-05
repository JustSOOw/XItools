/*
 * @Author: XItools Team
 * @Date: 2025-07-01 17:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 17:30:00
 * @FilePath: \XItools\frontend\src\components\auth\ForgotPasswordForm.tsx
 * @Description: 忘记密码表单组件
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useUserFeedback } from '../../hooks/useUserFeedback';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

interface ForgotPasswordData {
  email: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
  className = ''
}) => {
  const { t } = useTranslation('auth');
  const { showSuccess, showError } = useUserFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // 表单验证
  const {
    data: formData,
    errors: validationErrors,
    updateField,
    validateAll,
    hasErrors
  } = useFormValidation<ForgotPasswordData>(
    { email: '' },
    {
      email: {
        required: true,
        email: true,
        message: t('validation.emailRequired')
      }
    }
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
      // 模拟API调用 - 实际项目中需要调用真实的API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 成功发送重置邮件
      setIsEmailSent(true);
      showSuccess(
        t('forgotPassword.emailSent', { email: formData.email }),
        {
          title: t('forgotPassword.checkEmail'),
          duration: 6000
        }
      );
      
      onSuccess?.();
    } catch (error: any) {
      showError(
        error.message || t('forgotPassword.sendFailed'),
        {
          title: t('forgotPassword.error'),
          duration: 5000
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 重新发送邮件
  const handleResendEmail = async () => {
    setIsLoading(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess(
        t('forgotPassword.emailResent'),
        {
          title: t('forgotPassword.emailSent'),
          duration: 4000
        }
      );
    } catch (error: any) {
      showError(
        error.message || t('forgotPassword.resendFailed'),
        {
          title: t('forgotPassword.error'),
          duration: 5000
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className={`forgot-password-form success-state ${className}`}>
        <div className="form-header">
          <div className="success-icon">
            <i className="icon-mail-check"></i>
          </div>
          <h2 className="form-title">{t('forgotPassword.emailSentTitle')}</h2>
          <p className="form-subtitle">
            {t('forgotPassword.emailSentMessage', { email: formData.email })}
          </p>
        </div>

        <div className="form-content">
          <div className="success-instructions">
            <h3>{t('forgotPassword.nextSteps')}</h3>
            <ol className="steps-list">
              <li>{t('forgotPassword.step1')}</li>
              <li>{t('forgotPassword.step2')}</li>
              <li>{t('forgotPassword.step3')}</li>
            </ol>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="resend-button"
              onClick={handleResendEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" type="spinner" />
                  <span>{t('forgotPassword.resending')}</span>
                </>
              ) : (
                <span>{t('forgotPassword.resendEmail')}</span>
              )}
            </button>

            <button
              type="button"
              className="back-button"
              onClick={onBackToLogin}
            >
              <i className="icon-arrow-left"></i>
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
              autoFocus
            />
            <i className="input-icon icon-mail"></i>
          </div>
          {validationErrors.email && (
            <span className="error-message">{validationErrors.email}</span>
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
              <span>{t('forgotPassword.sending')}</span>
            </>
          ) : (
            <span>{t('forgotPassword.submit')}</span>
          )}
        </button>

        {/* 返回登录 */}
        <div className="form-footer">
          <button
            type="button"
            className="back-link"
            onClick={onBackToLogin}
            disabled={isLoading}
          >
            <i className="icon-arrow-left"></i>
            <span>{t('forgotPassword.backToLogin')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
