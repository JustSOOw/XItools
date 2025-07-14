/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\components\auth\LoginForm.tsx
 * @Description: 用户登录表单组件
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { UserLoginRequest } from '../../types/User';
import { useTranslation } from 'react-i18next';
import { useAuthError } from '../../hooks/useAuthError';
import { useUserFeedback } from '../../hooks/useUserFeedback';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import LoginLoadingAnimation from './LoginLoadingAnimation';
import {
  ExclamationTriangleIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
  className?: string;
}

// 记住我功能的localStorage键名
const REMEMBER_ME_KEY = 'xi-remember-me';

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword,
  className = '',
}) => {
  const { t } = useTranslation('auth');
  const { login, isLoading, error, clearError, checkAuthStatus } = useUserStore();
  const { handleLoginError } = useAuthError();
  const { auth: authFeedback, showSuccess, showError } = useUserFeedback();

  const [formData, setFormData] = useState<UserLoginRequest>({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 组件初始化时从localStorage读取记住的账户密码
  useEffect(() => {
    try {
      const rememberedData = localStorage.getItem(REMEMBER_ME_KEY);
      if (rememberedData) {
        const parsed = JSON.parse(rememberedData);
        setFormData((prev) => ({
          ...prev,
          identifier: parsed.identifier || '',
          password: parsed.password || '',
          rememberMe: true,
        }));
      }
    } catch (error) {
      console.warn('读取记住的登录信息失败:', error);
      // 清理损坏的数据
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }, []);

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      errors.identifier = t('validation.identifierRequired');
    }

    if (!formData.password) {
      errors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('validation.passwordMinLength');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

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
      // 调用真实的登录API
      console.log('开始登录:', formData);

      await login(formData);

      // 处理记住我功能
      if (formData.rememberMe) {
        // 保存账户和密码到localStorage
        try {
          localStorage.setItem(
            REMEMBER_ME_KEY,
            JSON.stringify({
              identifier: formData.identifier,
              password: formData.password,
            }),
          );
          console.log('已保存登录信息到localStorage');
        } catch (error) {
          console.warn('保存登录信息失败:', error);
        }
      } else {
        // 如果没有勾选记住我，清除保存的信息
        localStorage.removeItem(REMEMBER_ME_KEY);
        console.log('已清除保存的登录信息');
      }

      // 手动触发用户状态检查，确保UI立即更新
      await checkAuthStatus();

      // 显示登录成功消息
      console.log('登录成功');
      showSuccess(t('messages.loginSuccess'));

      // 延迟执行成功回调，让用户看到成功消息
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } catch (err: any) {
      // 显示登录失败消息
      console.error('登录失败:', err);
      const errorMessage = handleLoginError(err);
      showError(errorMessage);
    }
  };

  return (
    <>
      {/* 加载动画覆盖层 */}
      <LoginLoadingAnimation
        isVisible={isLoading}
        type="login"
        loadingText={t('login.loggingIn')}
      />

      <div className={`login-form ${className}`}>
        <div className="form-header">
          <h2 className="form-title">{t('login.title')}</h2>
          <p className="form-subtitle">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          {/* 全局错误提示 */}
          {error && (
            <div className="error-message global-error">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{handleLoginError({ response: { data: { error } } })}</span>
            </div>
          )}

          {/* 用户名/邮箱输入 */}
          <div className="form-group">
            <label htmlFor="identifier" className="form-label">
              {t('login.identifier')}
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                placeholder={t('login.identifierPlaceholder')}
                className={`form-input ${validationErrors.identifier ? 'error' : ''}`}
                disabled={isLoading}
                autoComplete="username"
              />
              <UserIcon className="input-icon w-5 h-5" />
            </div>
            {validationErrors.identifier && (
              <span className="error-message">{validationErrors.identifier}</span>
            )}
          </div>

          {/* 密码输入 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('login.password')}
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('login.passwordPlaceholder')}
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <LockClosedIcon className="input-icon w-5 h-5" />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>

          {/* 记住我选项 */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">{t('login.rememberMe')}</span>
            </label>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" type="spinner" />
                <span>{t('login.loggingIn')}</span>
              </>
            ) : (
              <span>{t('login.submit')}</span>
            )}
          </button>

          {/* 底部链接区域 */}
          <div className="form-footer">
            <div className="footer-links-row">
              {onForgotPassword && (
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={onForgotPassword}
                  disabled={isLoading}
                >
                  {t('login.forgotPassword')}
                </button>
              )}

              {onSwitchToRegister && (
                <div className="switch-form-text">
                  {t('login.noAccount')}
                  <button
                    type="button"
                    className="switch-form-link"
                    onClick={onSwitchToRegister}
                    disabled={isLoading}
                  >
                    {t('login.switchToRegister')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginForm;
