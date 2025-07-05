/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:30:00
 * @FilePath: \XItools\frontend\src\components\auth\UserMenu.tsx
 * @Description: 用户菜单组件
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUserStore, userStoreHelpers } from '../../store/userStore';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Modal from '../Modal';
import Button from '../Button';

interface UserMenuProps {
  isCollapsed?: boolean;
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  isCollapsed = false,
  className = ''
}) => {
  const { t } = useTranslation('auth');
  const { user, logout, isLoading } = useUserStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 检查用户是否已登录
  const isLoggedIn = userStoreHelpers.isLoggedIn();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理登出
  const handleLogout = async () => {
    if (window.confirm(t('profile.logoutConfirm'))) {
      await logout();
      setIsDropdownOpen(false);
    }
  };

  // 处理菜单项点击
  const handleMenuItemClick = (action: string) => {
    setIsDropdownOpen(false);
    
    switch (action) {
      case 'profile':
        setIsProfileModalOpen(true);
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  // 如果用户未登录，不显示菜单
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <>
      <div className={classNames('user-menu', className)} ref={dropdownRef}>
        {/* 用户信息触发器 */}
        <button
          className={classNames(
            'user-menu-trigger',
            {
              'collapsed': isCollapsed,
              'expanded': !isCollapsed,
              'active': isDropdownOpen
            }
          )}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isLoading}
        >
          {/* 用户头像 */}
          <div className="user-avatar">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            {/* 在线状态指示器 */}
            <div className="status-indicator online"></div>
          </div>

          {/* 用户信息（非折叠状态显示） */}
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user.username}</div>
            </div>
          )}

          {/* 下拉箭头 */}
          {!isCollapsed && (
            <div className="dropdown-arrow">
              <svg
                className={classNames('w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200', {
                  'transform rotate-180': isDropdownOpen
                })}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </button>

        {/* 下拉菜单 */}
        {isDropdownOpen && (
          <div className={classNames('user-menu-dropdown', {
            'collapsed': isCollapsed
          })}>
            <div className="dropdown-content">
              {/* 用户信息头部（折叠状态显示） */}
              {isCollapsed && (
                <div className="dropdown-header">
                  <div className="user-avatar large">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="avatar-image"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              )}

              {/* 菜单项 */}
              <div className="dropdown-menu">
                <button
                  className="menu-item"
                  onClick={() => handleMenuItemClick('profile')}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>{t('profile.profileTab')}</span>
                </button>

                <div className="menu-divider"></div>

                <button
                  className="menu-item logout"
                  onClick={() => handleMenuItemClick('logout')}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('profile.logout')}</span>
                  {isLoading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </button>
              </div>

              {/* 快捷信息 */}
              <div className="dropdown-footer">
                <div className="quick-info">
                  <div className="info-item">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t('profile.lastLogin')}: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 用户资料模态框 */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

/**
 * 用户资料模态框组件
 */
interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('auth');
  const { user, updateProfile, changePassword, refreshUserInfo, isLoading, error, clearError } = useUserStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 自动保存函数
  const autoSave = useCallback(async (data: typeof profileData) => {
    if (!user || !isEditMode) return;

    try {
      setIsSaving(true);
      await updateProfile({
        email: data.email !== user.email ? data.email : undefined,
        avatar: data.avatar !== user.avatar ? data.avatar : undefined,
        bio: data.bio !== user.bio ? data.bio : undefined,
      });
      setSuccessMessage('资料已自动保存');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error: any) {
      console.error('自动保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, updateProfile, isEditMode]);

  // 防抖自动保存
  const debouncedAutoSave = useCallback((data: typeof profileData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(data);
    }, 1000); // 1秒后自动保存
  }, [autoSave]);

  // 重置表单数据
  useEffect(() => {
    if (isOpen && user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || '',
        bio: user.bio || ''
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('');
      setValidationErrors({});
      setIsUploadingAvatar(false);
      setIsEditMode(false);
      setIsSaving(false);
      if (error) clearError();
    }
  }, [isOpen, user, error, clearError]);

  // 单独处理模态框打开时的数据刷新
  useEffect(() => {
    if (isOpen) {
      refreshUserInfo();
    }
  }, [isOpen, refreshUserInfo]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 处理头像上传
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({
        ...prev,
        avatar: '请选择图片文件'
      }));
      return;
    }

    // 验证文件大小（支持大文件头像，限制为100MB以防止意外）
    if (file.size > 100 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        avatar: '图片大小不能超过100MB'
      }));
      return;
    }

    setIsUploadingAvatar(true);
    setValidationErrors(prev => ({ ...prev, avatar: '' }));

    try {
      // 转换为base64
      const base64 = await convertFileToBase64(file);

      // 更新头像
      await updateProfile({ avatar: base64 });

      // 更新本地状态
      setProfileData(prev => ({
        ...prev,
        avatar: base64
      }));

      setSuccessMessage('头像更新成功');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('头像上传失败:', error);

      // 根据错误类型提供更具体的错误信息
      let errorMessage = '头像上传失败，请重试';

      if (error instanceof Error) {
        if (error.message.includes('413') || error.message.includes('Request Entity Too Large')) {
          errorMessage = '图片文件过大，请选择较小的图片';
        } else if (error.message.includes('CORS') || error.message.includes('cors')) {
          errorMessage = '网络连接问题，请检查网络设置';
        } else if (error.message.includes('Network')) {
          errorMessage = '网络错误，请检查连接';
        } else if (error.message.includes('timeout')) {
          errorMessage = '上传超时，请重试';
        }
      }

      setValidationErrors(prev => ({
        ...prev,
        avatar: errorMessage
      }));
    } finally {
      setIsUploadingAvatar(false);
      // 清空文件输入，允许重新选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理表单输入变化
  const handleProfileDataChange = (field: keyof typeof profileData, value: string) => {
    const newData = { ...profileData, [field]: value };
    setProfileData(newData);

    // 清除相关字段的验证错误
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // 如果在编辑模式下，触发自动保存
    if (isEditMode && field !== 'email') { // 邮箱不支持修改
      debouncedAutoSave(newData);
    }
  };

  // 文件转base64工具函数
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('文件读取失败'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  };



  // 处理密码表单提交
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 密码验证
    const errors: Record<string, string> = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = t('validation.currentPasswordRequired');
    }
    if (!passwordData.newPassword) {
      errors.newPassword = t('validation.newPasswordRequired');
    }
    if (passwordData.newPassword.length < 6) {
      errors.newPassword = t('validation.passwordMinLength');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = t('validation.passwordMismatch');
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMessage(t('profile.passwordChangeSuccess'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setValidationErrors({});
    } catch (err) {
      console.error('修改密码失败:', err);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('profile.title')}
      size="lg"
    >
      <div className="user-profile-modal max-h-[80vh] overflow-y-auto">
        {/* 用户信息头部 - 重新设计 */}
        <div className="profile-header mb-8">
          <div className="px-8 py-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10">
            {/* 头部布局：头像 + 用户信息 + 编辑按钮 */}
            <div className="flex items-center justify-between min-h-[100px]">
              {/* 左侧：头像和用户信息 */}
              <div className="flex items-center space-x-6 flex-shrink-0">
                <div className="relative group flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20 shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center ring-4 ring-primary/20 shadow-lg flex-shrink-0">
                      <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {/* 头像编辑按钮 */}
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center group-hover:scale-110"
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    title={isUploadingAvatar ? "上传中..." : "编辑头像"}
                  >
                    {isUploadingAvatar ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* 用户信息 */}
                <div className="space-y-1 flex-shrink-0">
                  <h3 className="text-xl font-bold text-text-primary whitespace-nowrap">{user.username}</h3>
                  <p className="text-text-secondary text-sm whitespace-nowrap">{user.email}</p>
                  {user?.createdAt && (
                    <p className="text-text-secondary text-xs flex items-center whitespace-nowrap">
                      <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      已注册 {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} 天
                    </p>
                  )}
                </div>
              </div>

              {/* 中间：弹性空间 */}
              <div className="flex-1 min-w-[80px]"></div>

              {/* 右侧：编辑按钮和保存状态 */}
              {activeTab === 'profile' && (
                <div className="flex items-center space-x-3 flex-shrink-0">
                  {isSaving && (
                    <div className="flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <svg className="w-4 h-4 mr-2 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">正在保存...</span>
                    </div>
                  )}

                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={classNames(
                      'flex items-center px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105',
                      isEditMode
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                        : 'bg-white dark:bg-gray-800 text-text-primary border-2 border-border hover:border-primary/50 shadow-sm hover:shadow-md'
                    )}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    {isEditMode ? '完成编辑' : '编辑资料'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 标签页导航 - 重新设计 */}
        <div className="flex bg-surface/50 rounded-lg p-1 mb-6">
          <button
            className={classNames(
              'flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200',
              activeTab === 'profile'
                ? 'bg-white dark:bg-gray-800 text-primary shadow-sm border border-primary/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-gray-800/50'
            )}
            onClick={() => setActiveTab('profile')}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            {t('profile.profileTab')}
          </button>
          <button
            className={classNames(
              'flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200',
              activeTab === 'password'
                ? 'bg-white dark:bg-gray-800 text-primary shadow-sm border border-primary/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-gray-800/50'
            )}
            onClick={() => setActiveTab('password')}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 0 1 6 0z" clipRule="evenodd" />
            </svg>
            {t('profile.passwordTab')}
          </button>
        </div>

        {/* 成功消息 */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* 错误消息 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 个人资料信息 - 重新设计 */}
        {activeTab === 'profile' && (
          <div className="space-y-8">

            {/* 基本信息分组 */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">基本信息</h3>
                    <p className="text-sm text-text-secondary">管理您的个人基本信息</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 用户名 */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      用户名
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => handleProfileDataChange('username', e.target.value)}
                        className={classNames(
                          'w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 bg-white dark:bg-gray-800 text-text-primary placeholder-text-secondary/60',
                          validationErrors.username
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-border hover:border-primary/50'
                        )}
                        placeholder="输入用户名"
                      />
                    ) : (
                      <div className="px-4 py-3.5 bg-surface/30 border-2 border-border/30 rounded-xl text-text-primary font-medium">
                        {profileData.username}
                      </div>
                    )}
                    {validationErrors.username && (
                      <p className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.username}
                      </p>
                    )}
                  </div>

                  {/* 邮箱 */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-text-primary">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      邮箱地址
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-md">只读</span>
                    </label>
                    <div className="px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-text-secondary cursor-not-allowed relative">
                      {profileData.email}
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {validationErrors.email && (
                      <p className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 个人简介分组 */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">个人简介</h3>
                    <p className="text-sm text-text-secondary">分享您的个人介绍和兴趣爱好</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {isEditMode ? (
                    <div className="space-y-3">
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleProfileDataChange('bio', e.target.value)}
                        className={classNames(
                          'w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 bg-white dark:bg-gray-800 resize-none text-text-primary placeholder-text-secondary/60',
                          validationErrors.bio
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-border hover:border-primary/50'
                        )}
                        rows={4}
                        maxLength={500}
                        placeholder="介绍一下自己吧... 可以分享您的兴趣爱好、专业技能或个人特色"
                      />
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-text-secondary">
                          <span className="inline-flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            支持换行和特殊字符
                          </span>
                        </div>
                        <div className={classNames(
                          'text-xs font-medium px-2 py-1 rounded-md',
                          profileData.bio.length > 450
                            ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                            : profileData.bio.length > 300
                              ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'text-text-secondary bg-surface/50'
                        )}>
                          {profileData.bio.length}/500
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-4 bg-surface/30 border-2 border-border/30 rounded-xl min-h-[100px] flex items-center">
                      {profileData.bio ? (
                        <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{profileData.bio}</p>
                      ) : (
                        <p className="text-text-secondary italic flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                          </svg>
                          暂无个人简介，点击编辑按钮添加介绍
                        </p>
                      )}
                    </div>
                  )}
                  {validationErrors.bio && (
                    <p className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>



            {/* 头像上传错误提示 */}
            {validationErrors.avatar && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800 dark:text-red-200 text-sm">{validationErrors.avatar}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 密码修改表单 */}
        {activeTab === 'password' && (
          <div className="space-y-8">
            {/* 安全提示 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">安全提醒</h3>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• 密码长度至少8位，建议包含大小写字母、数字和特殊字符</li>
                    <li>• 不要使用与其他网站相同的密码</li>
                    <li>• 修改密码后，您需要重新登录</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 密码修改表单 */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">修改密码</h3>
                    <p className="text-sm text-text-secondary">更新您的账户密码以保护账户安全</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* 当前密码 */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-text-primary">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      {t('profile.currentPassword')}
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className={classNames(
                        'w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 bg-white dark:bg-gray-800 text-text-primary placeholder-text-secondary/60',
                        validationErrors.currentPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                          : 'border-border hover:border-primary/50'
                      )}
                      placeholder="请输入当前密码"
                      disabled={isLoading}
                    />
                    {validationErrors.currentPassword && (
                      <p className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* 新密码 */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-text-primary">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {t('profile.newPassword')}
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className={classNames(
                        'w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 bg-white dark:bg-gray-800 text-text-primary placeholder-text-secondary/60',
                        validationErrors.newPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                          : 'border-border hover:border-primary/50'
                      )}
                      placeholder="请输入新密码"
                      disabled={isLoading}
                    />
                    {validationErrors.newPassword && (
                      <p className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* 确认新密码 */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-text-primary">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {t('profile.confirmNewPassword')}
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={classNames(
                        'w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 bg-white dark:bg-gray-800 text-text-primary placeholder-text-secondary/60',
                        validationErrors.confirmPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                          : 'border-border hover:border-primary/50'
                      )}
                      placeholder="请再次输入新密码"
                      disabled={isLoading}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex justify-end pt-6 border-t border-border/30">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isLoading}
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      {t('profile.changePassword')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserMenu;
