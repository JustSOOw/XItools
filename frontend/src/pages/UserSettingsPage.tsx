/*
 * @Author: XItools Team
 * @Date: 2025-07-01 10:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 10:00:00
 * @FilePath: \XItools\frontend\src\pages\UserSettingsPage.tsx
 * @Description: 用户设置页面组件
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '../components/auth/UserProfile';
import { ApiKeyManagement } from '../components/settings/ApiKeyManagement';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { useI18n } from '../hooks/useI18n';

interface UserSettingsPageProps {
  className?: string;
}

export const UserSettingsPage: React.FC<UserSettingsPageProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { currentTheme, setTheme, themeConfigs } = useThemeStore();
  // const { language, changeLanguage, supportedLanguages } = useI18n(); // 已禁用多语言功能

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'preferences' | 'api-keys'>(
    'profile',
  );

  if (!user) {
    return (
      <div className="user-settings-page">
        <div className="settings-error">
          <h2>{t('auth:profile.notLoggedIn')}</h2>
          <p>{t('settings.pleaseLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`user-settings-page ${className}`}>
      <div className="settings-container">
        {/* 页面标题 */}
        <div className="settings-header">
          <h1 className="settings-title">{t('settings.title')}</h1>
          <p className="settings-subtitle">{t('settings.subtitle')}</p>
        </div>

        {/* 标签页导航 */}
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="icon-user"></i>
            <span>{t('settings.tabs.profile')}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <i className="icon-palette"></i>
            <span>{t('settings.tabs.appearance')}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <i className="icon-settings"></i>
            <span>{t('settings.tabs.preferences')}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'api-keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('api-keys')}
          >
            <i className="icon-key"></i>
            <span>API密钥</span>
          </button>
        </div>

        {/* 标签页内容 */}
        <div className="settings-content">
          {/* 个人资料标签页 */}
          {activeTab === 'profile' && (
            <div className="tab-content active">
              <div className="settings-section">
                <h2 className="section-title">{t('settings.profile.title')}</h2>
                <p className="section-description">{t('settings.profile.description')}</p>
                <UserProfile className="profile-form" />
              </div>
            </div>
          )}

          {/* 外观设置标签页 */}
          {activeTab === 'appearance' && (
            <div className="tab-content active">
              <div className="settings-section">
                <h2 className="section-title">{t('settings.appearance.title')}</h2>
                <p className="section-description">{t('settings.appearance.description')}</p>

                {/* 主题选择 */}
                <div className="setting-group">
                  <h3 className="setting-label">{t('settings.appearance.theme')}</h3>
                  <div className="theme-grid">
                    {Object.values(themeConfigs).map((theme) => (
                      <div
                        key={theme.id}
                        className={`theme-card ${currentTheme === theme.id ? 'active' : ''}`}
                        onClick={() => setTheme(theme.id)}
                      >
                        <div className="theme-preview">
                          <div
                            className="preview-color primary"
                            style={{ backgroundColor: theme.preview.primary }}
                          ></div>
                          <div
                            className="preview-color secondary"
                            style={{ backgroundColor: theme.preview.secondary }}
                          ></div>
                          <div
                            className="preview-color accent"
                            style={{ backgroundColor: theme.preview.accent }}
                          ></div>
                        </div>
                        <div className="theme-info">
                          <h4 className="theme-name">{theme.name}</h4>
                          <p className="theme-description">{theme.description}</p>
                        </div>
                        {currentTheme === theme.id && (
                          <div className="theme-check">
                            <i className="icon-check"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 语言选择 - 已禁用多语言功能 */}
                {/* <div className="setting-group">
                  <h3 className="setting-label">{t('settings.appearance.language')}</h3>
                  <div className="language-selector">
                    <select
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value as any)}
                      className="language-select"
                    >
                      {Object.entries(supportedLanguages).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div> */}
              </div>
            </div>
          )}

          {/* 偏好设置标签页 */}
          {activeTab === 'preferences' && (
            <div className="tab-content active">
              <div className="settings-section">
                <h2 className="section-title">{t('settings.preferences.title')}</h2>
                <p className="section-description">{t('settings.preferences.description')}</p>

                {/* 通知设置 */}
                <div className="setting-group">
                  <h3 className="setting-label">{t('settings.preferences.notifications')}</h3>
                  <div className="setting-options">
                    <label className="setting-option">
                      <input type="checkbox" defaultChecked />
                      <span className="checkmark"></span>
                      <span className="option-text">
                        {t('settings.preferences.emailNotifications')}
                      </span>
                    </label>
                    <label className="setting-option">
                      <input type="checkbox" defaultChecked />
                      <span className="checkmark"></span>
                      <span className="option-text">{t('settings.preferences.taskReminders')}</span>
                    </label>
                    <label className="setting-option">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      <span className="option-text">{t('settings.preferences.weeklyReports')}</span>
                    </label>
                  </div>
                </div>

                {/* 隐私设置 */}
                <div className="setting-group">
                  <h3 className="setting-label">{t('settings.preferences.privacy')}</h3>
                  <div className="setting-options">
                    <label className="setting-option">
                      <input type="checkbox" defaultChecked />
                      <span className="checkmark"></span>
                      <span className="option-text">
                        {t('settings.preferences.profileVisibility')}
                      </span>
                    </label>
                    <label className="setting-option">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      <span className="option-text">
                        {t('settings.preferences.activityTracking')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API密钥管理标签页 */}
          {activeTab === 'api-keys' && (
            <div className="tab-content active">
              <div className="settings-section">
                <h2 className="section-title">API密钥管理</h2>
                <p className="section-description">
                  管理您的MCP API访问密钥，用于第三方应用和脚本集成。
                </p>
                <ApiKeyManagement className="api-key-section" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
