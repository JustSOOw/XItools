/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\components\auth\UserProfile.tsx
 * @Description: 用户资料组件
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { UserUpdateRequest, PasswordChangeRequest } from '../../types/User';
import { useTranslation } from 'react-i18next';
import { useAuthError } from '../../hooks/useAuthError';
import { PasswordStrengthIndicator } from '../ui/PasswordStrengthIndicator';

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { t } = useTranslation('auth');
  const { user, updateProfile, changePassword, logout, isLoading, error, clearError } =
    useUserStore();
  const { handleProfileError } = useAuthError();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profileData, setProfileData] = useState<UserUpdateRequest>({
    email: '',
    avatar: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: '',
  });

  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email,
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // 清除成功消息
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 验证资料表单
  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profileData.email?.trim()) {
      errors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = t('validation.emailFormat');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 验证密码表单
  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = t('validation.currentPasswordRequired');
    }

    if (!passwordData.newPassword) {
      errors.newPassword = t('validation.newPasswordRequired');
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = t('validation.passwordMinLength');
    }

    if (!confirmNewPassword) {
      errors.confirmNewPassword = t('validation.confirmPasswordRequired');
    } else if (confirmNewPassword !== passwordData.newPassword) {
      errors.confirmNewPassword = t('validation.passwordMismatch');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = t('validation.passwordSameAsCurrent');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理资料输入变化
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 清除验证错误
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (error) clearError();
    if (successMessage) setSuccessMessage('');
  };

  // 处理密码输入变化
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'confirmNewPassword') {
      setConfirmNewPassword(value);
    } else {
      setPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // 清除验证错误
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (error) clearError();
    if (successMessage) setSuccessMessage('');
  };

  // 处理资料更新
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    try {
      await updateProfile(profileData);
      setSuccessMessage(t('profile.updateSuccess'));
    } catch (err) {
      console.error('更新资料失败:', err);
    }
  };

  // 处理密码修改
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      await changePassword(passwordData);
      setSuccessMessage(t('profile.passwordChangeSuccess'));

      // 清空密码表单
      setPasswordData({
        currentPassword: '',
        newPassword: '',
      });
      setConfirmNewPassword('');
    } catch (err) {
      console.error('修改密码失败:', err);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    if (window.confirm(t('profile.logoutConfirm'))) {
      await logout();
    }
  };

  // 切换密码显示状态
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!user) {
    return (
      <div className="user-profile-error">
        <p>{t('profile.notLoggedIn')}</p>
      </div>
    );
  }

  return (
    <div className={`user-profile ${className}`}>
      <div className="profile-header">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <div className="avatar-placeholder">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="user-info">
          <h2 className="user-name">{user.username}</h2>
          <p className="user-email">{user.email}</p>
          <span className="user-role">{t(`roles.${user.role}`)}</span>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="icon-user"></i>
          {t('profile.profileTab')}
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <i className="icon-lock"></i>
          {t('profile.passwordTab')}
        </button>
      </div>

      {/* 消息提示 */}
      {successMessage && (
        <div className="success-message">
          <i className="icon-check-circle"></i>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="icon-alert-circle"></i>
          <span>{handleProfileError({ response: { data: { error } } })}</span>
        </div>
      )}

      {/* 资料编辑表单 */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t('profile.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileInputChange}
              className={`form-input ${validationErrors.email ? 'error' : ''}`}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <span className="error-message">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="avatar" className="form-label">
              {t('profile.avatar')}
            </label>
            <input
              type="url"
              id="avatar"
              name="avatar"
              value={profileData.avatar}
              onChange={handleProfileInputChange}
              placeholder={t('profile.avatarPlaceholder')}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="icon-loader spinning"></i>
                <span>{t('profile.updating')}</span>
              </>
            ) : (
              <span>{t('profile.updateProfile')}</span>
            )}
          </button>
        </form>
      )}

      {/* 密码修改表单 */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              {t('profile.currentPassword')}
            </label>
            <div className="input-wrapper">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                className={`form-input ${validationErrors.currentPassword ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('current')}
              >
                <i className={`icon-${showPasswords.current ? 'eye-off' : 'eye'}`}></i>
              </button>
            </div>
            {validationErrors.currentPassword && (
              <span className="error-message">{validationErrors.currentPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              {t('profile.newPassword')}
            </label>
            <div className="input-wrapper">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                className={`form-input ${validationErrors.newPassword ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
              >
                <i className={`icon-${showPasswords.new ? 'eye-off' : 'eye'}`}></i>
              </button>
            </div>
            {validationErrors.newPassword && (
              <span className="error-message">{validationErrors.newPassword}</span>
            )}
            {/* 密码强度指示器 */}
            <PasswordStrengthIndicator password={passwordData.newPassword} showDetails={true} />
          </div>

          <div className="form-group">
            <label htmlFor="confirmNewPassword" className="form-label">
              {t('profile.confirmNewPassword')}
            </label>
            <div className="input-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={confirmNewPassword}
                onChange={handlePasswordInputChange}
                className={`form-input ${validationErrors.confirmNewPassword ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                <i className={`icon-${showPasswords.confirm ? 'eye-off' : 'eye'}`}></i>
              </button>
            </div>
            {validationErrors.confirmNewPassword && (
              <span className="error-message">{validationErrors.confirmNewPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="icon-loader spinning"></i>
                <span>{t('profile.changingPassword')}</span>
              </>
            ) : (
              <span>{t('profile.changePassword')}</span>
            )}
          </button>
        </form>
      )}

      {/* 登出按钮 */}
      <div className="profile-actions">
        <button onClick={handleLogout} className="logout-button" disabled={isLoading}>
          <i className="icon-log-out"></i>
          {t('profile.logout')}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
