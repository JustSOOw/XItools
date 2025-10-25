/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\components\auth\RegisterForm.tsx
 * @Description: 用户注册表单组件
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { UserRegisterRequest } from '../../types/User';
import { useTranslation } from 'react-i18next';
import { useAuthError } from '../../hooks/useAuthError';
import { useUserFeedback } from '../../hooks/useUserFeedback';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { PasswordStrengthIndicator } from '../ui/PasswordStrengthIndicator';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  className = '',
}) => {
  const { t } = useTranslation('auth');
  const { register, isLoading, error, clearError } = useUserStore();
  const { handleRegisterError } = useAuthError();
  const { auth: authFeedback } = useUserFeedback();

  const [formData, setFormData] = useState<UserRegisterRequest>({
    username: '',
    email: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 用户名验证
    if (!formData.username.trim()) {
      errors.username = t('validation.usernameRequired');
    } else if (formData.username.length < 3) {
      errors.username = t('validation.usernameMinLength');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = t('validation.usernameFormat');
    }

    // 邮箱验证
    if (!formData.email.trim()) {
      errors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('validation.emailFormat');
    }

    // 密码验证 - 放宽要求，只要求最小长度
    if (!formData.password) {
      errors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('validation.passwordMinLength');
    }

    // 确认密码验证
    if (!confirmPassword) {
      errors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (confirmPassword !== formData.password) {
      errors.confirmPassword = t('validation.passwordMismatch');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // 清除对应字段的验证错误
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // 清除全局错误
    if (error) {
      clearError();
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);

      // 显示注册成功消息
      authFeedback.registerSuccess(formData.username);

      // 延迟执行成功回调，让用户看到成功消息
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      // 显示注册失败消息
      authFeedback.registerError(err);
      console.error('注册失败:', err);
    }
  };

  return (
    <div className={`register-form ${className}`}>
      <div className="form-header">
        <h2 className="form-title">{t('register.title')}</h2>
        <p className="form-subtitle">{t('register.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* 用户名输入 */}
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            {t('register.username')}
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={t('register.usernamePlaceholder')}
              className="form-input"
              disabled={isLoading}
              autoComplete="username"
            />
            <i className="input-icon icon-user"></i>
          </div>
        </div>

        {/* 邮箱输入 */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            {t('register.email')}
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('register.emailPlaceholder')}
              className="form-input"
              disabled={isLoading}
              autoComplete="email"
            />
            <i className="input-icon icon-mail"></i>
          </div>
        </div>

        {/* 密码输入 */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            {t('register.password')}
          </label>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('register.passwordPlaceholder')}
              className="form-input"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <i className="input-icon icon-lock"></i>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <i className={`icon-${showPassword ? 'eye-off' : 'eye'}`}></i>
            </button>
          </div>
          {/* 密码强度指示器 */}
          <PasswordStrengthIndicator password={formData.password} showDetails={true} />
        </div>

        {/* 确认密码输入 */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            {t('register.confirmPassword')}
          </label>
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              placeholder={t('register.confirmPasswordPlaceholder')}
              className="form-input"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <i className="input-icon icon-lock"></i>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <i className={`icon-${showConfirmPassword ? 'eye-off' : 'eye'}`}></i>
            </button>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="icon-loader spinning"></i>
              <span>{t('register.registering')}</span>
            </>
          ) : (
            <span>{t('register.submit')}</span>
          )}
        </button>

        {/* 切换到登录 */}
        {onSwitchToLogin && (
          <div className="form-footer">
            <p className="switch-form-text">
              {t('register.hasAccount')}
              <button
                type="button"
                className="switch-form-link"
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                {t('register.switchToLogin')}
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;
