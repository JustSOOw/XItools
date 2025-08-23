/**
 * API密钥列表组件
 *
 * 按照设计方案重构的API密钥列表，采用卡片式布局，提供清晰的密钥信息展示
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useToast from '../ui/Toast/useToast';
import RevokeApiKeyModal from './RevokeApiKeyModal';
import ViewApiKeyModal from './ViewApiKeyModal';
import { apiKeyService } from '../../services/apiKeyService';

import EditApiKeyModal from './EditApiKeyModal';
interface ApiKey {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  keyPrefix: string;
  lastUsedAt?: string;
  lastUsedIp?: string;
  usageCount: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

interface ApiKeyListProps {
  onCreateClick: () => void;
  refreshTrigger?: number;
  className?: string;
}

export const ApiKeyList: React.FC<ApiKeyListProps> = ({
  onCreateClick,
  refreshTrigger = 0,
  className = '',
}) => {
  const { t } = useTranslation();
  const [, toastAPI] = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokeModal, setRevokeModal] = useState<{ isOpen: boolean; apiKey: ApiKey | null }>({
    isOpen: false,
    apiKey: null,
  });

  // 编辑&查看状态
  const [editState, setEditState] = useState<{ open: boolean; key: ApiKey | null }>({ open: false, key: null });
  const [viewState, setViewState] = useState<{ open: boolean; keyId: string | null; keyName?: string }>({ open: false, keyId: null });

  const handleViewKey = (key: ApiKey) => {
    setViewState({ open: true, keyId: key.id, keyName: key.name });
  };

  // 权限标签映射
  const permissionLabels: Record<string, string> = {
    'mcp:read': '读取',
    'mcp:write': '写入',
  };

  // 获取权限标签颜色
  const getPermissionColor = (permission: string): string => {
    const colors: Record<string, string> = {
      'mcp:read': 'text-blue-600 bg-blue-50',
      'mcp:write': 'text-green-600 bg-green-50',
    };
    return colors[permission] || 'text-gray-600 bg-gray-50';
  };

  // 加载API密钥列表
  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      const data = await apiKeyService.getApiKeys();
      setApiKeys(data || []);
    } catch (error) {
      console.error('加载API密钥失败:', error);

      let errorMessage = '加载API密钥列表失败';
      if (error instanceof Error) {
        if (error.message.includes('网络连接失败')) {
          errorMessage = '网络连接失败，请检查网络连接后重试';
        } else if (error.message.includes('权限不足')) {
          errorMessage = '权限不足，无法访问API密钥列表';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toastAPI.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理撤销密钥
  const handleRevoke = (apiKey: ApiKey) => {
    setRevokeModal({ isOpen: true, apiKey });
  };

  // 确认撤销密钥
  const handleConfirmRevoke = async (id: string) => {
    try {
      await apiKeyService.deleteApiKey(id);
      setApiKeys((prev) => prev.filter((key) => key.id !== id));
      toastAPI.success('API密钥已撤销');
      setRevokeModal({ isOpen: false, apiKey: null });
    } catch (error) {
      console.error('撤销API密钥失败:', error);

      let errorMessage = '撤销API密钥失败';
      if (error instanceof Error) {
        if (error.message.includes('网络连接失败')) {
          errorMessage = '网络连接失败，请检查网络连接后重试';
        } else if (error.message.includes('权限不足')) {
          errorMessage = '权限不足，无法撤销此API密钥';
        } else if (error.message.includes('API密钥不存在')) {
          errorMessage = 'API密钥不存在或已被删除';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toastAPI.error(errorMessage);
    }
  };

  // 格式化相对时间
  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '从未使用过';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 30) return `${diffDays}天前`;

    return formatDate(dateString);
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadApiKeys();
  }, [refreshTrigger]);

  return (
    <div className={`redesigned-api-keys-list ${className}`}>
      {/* 加载状态 */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="loading-text">加载API密钥中...</p>
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && apiKeys.length === 0 && (
        <div className="empty-state-container">
          <div className="empty-icon">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h3 className="empty-title">还没有API密钥</h3>
          <p className="empty-description">创建您的第一个API密钥来开始使用MCP服务</p>
          <button className="empty-action-button" onClick={onCreateClick}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            创建第一个API密钥
          </button>
        </div>
      )}

      {/* API密钥卡片列表 */}
      {!isLoading && apiKeys.length > 0 && (
        <div className="api-keys-grid">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="api-key-card compact">
              {/* 顶部行：名称 + 前缀 + 操作图标 */}
              <div className="card-row header-row">
                <div className="title-block">
                  <h4 className="key-name ellipsis">{apiKey.name}</h4>
                  <code className="key-prefix-inline">{apiKey.keyPrefix}...</code>
                </div>
                <div className="actions-inline">
                  <button
                    className="btn-icon"
                    title="查看密钥"
                    onClick={() => handleViewKey(apiKey)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    className="btn-icon"
                    title="编辑密钥"
                    onClick={() => setEditState({ open: true, key: apiKey })}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    className="btn-icon danger"
                    title="撤销密钥"
                    onClick={() => handleRevoke(apiKey)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 第二行：权限标签 + 元信息（上次/创建/过期） */}
              <div className="card-row meta-row">
                <div className="permissions-inline">
                  {apiKey.permissions.map((permission) => (
                    <span key={permission} className={`permission-chip ${getPermissionColor(permission)}`}>
                      {permissionLabels[permission] || permission}
                    </span>
                  ))}
                </div>
                <div className="info-inline">
                  <span className="meta-item">上次 {formatRelativeTime(apiKey.lastUsedAt)}</span>
                  <span className="divider">·</span>
                  <span className="meta-item">创建 {formatDate(apiKey.createdAt)}</span>
                  <span className="divider">·</span>
                  <span className="meta-item">到期 {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : '永不'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 查看密钥模态框 */}
      <ViewApiKeyModal
        isOpen={viewState.open}
        onClose={() => setViewState({ open: false, keyId: null })}
        keyId={viewState.keyId}
        keyName={viewState.keyName}
      />

      {/* 编辑密钥模态框 */}
      <EditApiKeyModal
        isOpen={editState.open}
        onClose={() => setEditState({ open: false, key: null })}
        apiKey={editState.key}
        onSaved={loadApiKeys}
      />



      {/* 撤销确认模态框 */}
      <RevokeApiKeyModal
        isOpen={revokeModal.isOpen}
        onClose={() => setRevokeModal({ isOpen: false, apiKey: null })}
        onConfirm={handleConfirmRevoke}
        apiKey={revokeModal.apiKey}
      />
    </div>
  );
};

export default ApiKeyList;
