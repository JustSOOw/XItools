/*
 * @Author: JustSOOw 117962858+JustSOOw@users.noreply.github.com
 * @Date: 2025-07-07 13:28:50
 * @LastEditors: JustSOOw 117962858+JustSOOw@users.noreply.github.com
 * @LastEditTime: 2025-07-07 22:23:12
 * @FilePath: \XItools\frontend\src\components\settings\ApiKeyManagement.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */
/**
 * API密钥管理主组件
 *
 * 按照设计方案重构的API密钥管理界面，提供安全、清晰且高效的密钥管理体验
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ApiKeyList from './ApiKeyList';
import CreateApiKeyModal from './CreateApiKeyModal';
import ApiKeySuccessModal from './ApiKeySuccessModal';

interface ApiKeyManagementProps {
  className?: string;
}

export const ApiKeyManagement: React.FC<ApiKeyManagementProps> = ({ 
  className = '' 
}) => {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState('');
  const [createdKeyName, setCreatedKeyName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 处理创建API密钥成功
  const handleCreateSuccess = (apiKey: string, keyName: string) => {
    setCreatedApiKey(apiKey);
    setCreatedKeyName(keyName);
    setShowCreateModal(false);
    setShowSuccessModal(true);
    // 触发列表刷新
    setRefreshTrigger(prev => prev + 1);
  };

  // 处理成功模态框关闭
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setCreatedApiKey('');
    setCreatedKeyName('');
  };

  return (
    <div className={`api-key-management-redesigned ${className}`}>
      {/* 页面头部 */}
      <div className="api-key-header">
        <div className="header-content">
          <div className="header-text">
            <h2 className="header-title">API密钥管理</h2>
            <p className="header-description">
              通过API密钥，您可以授权外部应用（如Cursor）安全地访问您在XItools中的数据，而无需暴露您的账户密码。
            </p>
          </div>
          <button
            className="create-key-button"
            onClick={() => setShowCreateModal(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            生成新密钥
          </button>
        </div>
      </div>

      {/* API密钥列表 */}
      <div className="api-key-content">
        <ApiKeyList
          onCreateClick={() => setShowCreateModal(true)}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* 创建API密钥模态框 */}
      <CreateApiKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 创建成功模态框 */}
      <ApiKeySuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        apiKey={createdApiKey}
        keyName={createdKeyName}
      />
    </div>
  );
};

export default ApiKeyManagement;