/**
 * 创建API密钥模态框组件
 *
 * 提供创建新API密钥的表单界面，包括名称、描述、权限和过期时间设置
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import useToast from '../ui/Toast/useToast';
import { apiKeyService } from '../../services/apiKeyService';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (apiKey: string, keyName: string) => void;
}

interface CreateApiKeyForm {
  name: string;
  description: string;
  permissions: string[];
  expiresIn: string;
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [, toastAPI] = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateApiKeyForm>({
    name: '',
    description: '',
    permissions: ['read', 'write'],
    expiresIn: '90d',
  });

  // 可用权限选项
  const permissionOptions = [
    { value: 'read', label: '读取权限', description: '获取看板、任务等数据' },
    { value: 'write', label: '写入权限', description: '创建、更新、删除任务和看板' },
  ];

  // 过期时间选项
  const expirationOptions = [
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' },
    { value: '90d', label: '90天' },
    { value: '1y', label: '1年' },
    { value: 'never', label: '永不过期' },
  ];

  // 处理表单输入变化
  const handleInputChange = (field: keyof CreateApiKeyForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理权限选择变化
  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => {
      let newPermissions = [...prev.permissions];

      if (checked) {
        // 添加权限
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission);
        }
      } else {
        // 移除权限
        newPermissions = newPermissions.filter((p) => p !== permission);
      }

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toastAPI.error('请输入密钥名称');
      return;
    }

    if (formData.permissions.length === 0) {
      toastAPI.error('请至少选择一个权限');
      return;
    }

    setIsLoading(true);

    try {
      // 转换权限格式 - 去重并映射到后端权限
      const permissionSet = new Set<string>();

      formData.permissions.forEach((perm) => {
        switch (perm) {
          case 'read':
            permissionSet.add('mcp:read');
            break;
          case 'write':
            permissionSet.add('mcp:write');
            break;
        }
      });

      const mcpPermissions = Array.from(permissionSet);

      // 计算过期时间
      let expiresAt = null;
      if (formData.expiresIn !== 'never') {
        const now = new Date();
        switch (formData.expiresIn) {
          case '30d':
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case '90d':
            expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case '1y':
            expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
            break;
        }
      }

      const result = await apiKeyService.createApiKey({
        name: formData.name.trim(),
        permissions: mcpPermissions,
        expiresAt: expiresAt,
      });

      // 检查结果是否有效，防止访问undefined属性
      if (!result || !result.apiKey || !result.name) {
        throw new Error('服务器返回的数据格式无效');
      }

      // 重置表单
      setFormData({
        name: '',
        description: '',
        permissions: ['read', 'write'],
        expiresIn: '90d',
      });

      // 调用成功回调，触发父组件刷新列表
      onSuccess(result.apiKey, result.name);

      // 不在这里显示成功提示，因为会有专门的成功模态框
    } catch (error) {
      console.error('创建API密钥失败:', error);

      // 处理不同类型的错误
      let errorMessage = '创建API密钥失败';

      // 处理API错误响应
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        const errorData = apiError.response?.data;

        if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }

        // 根据错误代码提供更友好的提示
        if (errorData?.code === 'DUPLICATE_API_KEY_NAME') {
          errorMessage = '该名称的API密钥已存在，请使用其他名称';
        } else if (errorData?.code === 'VALIDATION_ERROR') {
          errorMessage = '请求参数验证失败，请检查输入内容';
        } else if (errorData?.code === 'INSUFFICIENT_PERMISSIONS') {
          errorMessage = '权限不足，无法创建API密钥';
        } else if (errorData?.code === 'INTERNAL_SERVER_ERROR') {
          errorMessage = '服务器内部错误，请稍后重试';
        }
      } else if (error instanceof Error) {
        // 处理其他类型的错误
        if (error.message.includes('网络连接失败') || error.message.includes('Network Error')) {
          errorMessage = '网络连接失败，请检查网络连接后重试';
        } else if (error.message.includes('timeout')) {
          errorMessage = '请求超时，请稍后重试';
        } else if (error.message.includes('该名称的API密钥已存在')) {
          errorMessage = '该名称的API密钥已存在，请使用其他名称';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toastAPI.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 关闭模态框
  const handleClose = () => {
    if (!isLoading) {
      // 重置表单
      setFormData({
        name: '',
        description: '',
        permissions: ['read', 'write'],
        expiresIn: '90d',
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="创建API密钥" size="md">
      <form onSubmit={handleSubmit} className="create-api-key-form">
        {/* 基本信息 */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="keyName" className="form-label required">
              密钥名称
            </label>
            <input
              id="keyName"
              type="text"
              className="form-input"
              placeholder="为您的API密钥起一个描述性的名称"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              maxLength={50}
              required
            />
            <div className="form-hint">用于识别此API密钥的用途，例如"移动应用"或"数据同步脚本"</div>
          </div>

          <div className="form-group">
            <label htmlFor="keyDescription" className="form-label">
              描述 <span className="optional">(可选)</span>
            </label>
            <textarea
              id="keyDescription"
              className="form-textarea"
              placeholder="详细描述此API密钥的用途和使用场景"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
        </div>

        {/* 权限设置 */}
        <div className="form-section">
          <div className="section-header">
            <h4 className="section-title">权限设置</h4>
            <p className="section-description">选择此API密钥可以执行的操作类型</p>
          </div>

          <div className="permissions-grid">
            {permissionOptions.map((option) => (
              <div key={option.value} className="permission-item">
                <label className="permission-label">
                  <input
                    type="checkbox"
                    className="permission-checkbox"
                    checked={formData.permissions.includes(option.value)}
                    onChange={(e) => handlePermissionChange(option.value, e.target.checked)}
                  />
                  <div className="permission-content">
                    <div className="permission-name">{option.label}</div>
                    <div className="permission-description">{option.description}</div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 过期设置 */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="expiresIn" className="form-label">
              过期时间
            </label>
            <select
              id="expiresIn"
              className="form-select"
              value={formData.expiresIn}
              onChange={(e) => handleInputChange('expiresIn', e.target.value)}
            >
              {expirationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="form-hint">
              {formData.expiresIn === 'never'
                ? '此密钥将永不过期，请确保妥善保管'
                : '密钥过期后将自动失效，需要重新创建'}
            </div>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="security-notice">
          <div className="notice-icon">
            <i className="icon-shield"></i>
          </div>
          <div className="notice-content">
            <h5>安全提示</h5>
            <ul>
              <li>API密钥创建后只会显示一次，请务必妥善保存</li>
              <li>不要在公共代码仓库或不安全的地方存储API密钥</li>
              <li>建议定期轮换API密钥以提高安全性</li>
              <li>如果密钥泄露，请立即删除并创建新的密钥</li>
            </ul>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !formData.name.trim() || formData.permissions.length === 0}
          >
            {isLoading ? (
              <>
                <i className="icon-loader animate-spin"></i>
                创建中...
              </>
            ) : (
              '创建API密钥'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateApiKeyModal;
