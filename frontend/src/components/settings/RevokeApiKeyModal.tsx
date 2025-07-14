/**
 * 撤销API密钥确认模态框组件
 *
 * 按照设计方案实现的安全撤销确认对话框，要求用户输入密钥名称进行二次确认
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import useToast from '../ui/Toast/useToast';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: string;
  lastUsedIp?: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

interface RevokeApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  apiKey: ApiKey | null;
}

export const RevokeApiKeyModal: React.FC<RevokeApiKeyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  apiKey,
}) => {
  const { t } = useTranslation();
  const [, toastAPI] = useToast();
  const [confirmName, setConfirmName] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  // 重置状态
  useEffect(() => {
    if (!isOpen) {
      setConfirmName('');
      setIsRevoking(false);
    }
  }, [isOpen]);

  // 检查名称是否匹配
  const isNameMatched = confirmName.trim() === apiKey?.name;

  // 处理撤销确认
  const handleConfirm = async () => {
    if (!apiKey || !isNameMatched) return;

    try {
      setIsRevoking(true);
      await onConfirm(apiKey.id);
      onClose();
    } catch (error) {
      console.error('撤销API密钥失败:', error);
    } finally {
      setIsRevoking(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isNameMatched && !isRevoking) {
      handleConfirm();
    }
  };

  if (!apiKey) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="确认撤销密钥？"
      size="md"
      closeOnClickOutside={!isRevoking}
      closeOnEsc={!isRevoking}
    >
      <div className="revoke-modal-content">
        {/* 警告信息 */}
        <div className="warning-section">
          <div className="warning-icon">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="warning-text">
            <p className="warning-message">
              您确定要撤销密钥 <strong>"{apiKey.name}"</strong> 吗？
            </p>
            <p className="warning-description">
              此操作无法撤销，所有使用此密钥的应用将立即失去访问权限。
            </p>
          </div>
        </div>

        {/* 密钥信息 */}
        <div className="key-info-section">
          <div className="info-item">
            <span className="info-label">密钥前缀:</span>
            <code className="info-value">{apiKey.keyPrefix}...</code>
          </div>
          <div className="info-item">
            <span className="info-label">创建时间:</span>
            <span className="info-value">
              {new Date(apiKey.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">权限:</span>
            <span className="info-value">
              {apiKey.permissions.map((p) => p.replace('mcp:', '')).join(', ')}
            </span>
          </div>
        </div>

        {/* 确认输入 */}
        <div className="confirm-section">
          <label className="confirm-label">为防止误操作，请输入密钥名称以确认:</label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={apiKey.name}
            className="confirm-input"
            disabled={isRevoking}
            autoFocus
          />
          <div className="input-hint">
            请输入: <strong>{apiKey.name}</strong>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose} disabled={isRevoking}>
            取消
          </button>
          <button
            className="confirm-button"
            onClick={handleConfirm}
            disabled={!isNameMatched || isRevoking}
          >
            {isRevoking ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
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
                撤销中...
              </>
            ) : (
              '确认撤销'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RevokeApiKeyModal;
