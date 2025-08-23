/**
 * 编辑API密钥模态框
 * 作用：允许用户修改密钥名称与权限（读/写），提交后刷新列表
 */
import React, { useEffect, useState } from 'react';
import Modal, { ModalFooter } from '../Modal';
import useToast from '../ui/Toast/useToast';
import { apiKeyService } from '../../services/apiKeyService';

interface ApiKeyLike {
  id: string;
  name: string;
  permissions: string[];
}

interface EditApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKeyLike | null;
  onSaved?: () => void;
}

const EditApiKeyModal: React.FC<EditApiKeyModalProps> = ({ isOpen, onClose, apiKey, onSaved }) => {
  const [, toast] = useToast();
  const [name, setName] = useState('');
  const [permRead, setPermRead] = useState(true);
  const [permWrite, setPermWrite] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && apiKey) {
      setName(apiKey.name || '');
      setPermRead(apiKey.permissions?.includes('mcp:read'));
      setPermWrite(apiKey.permissions?.includes('mcp:write'));
    }
  }, [isOpen, apiKey]);

  const handleSave = async () => {
    if (!apiKey) return;
    const perms: string[] = [];
    if (permRead) perms.push('mcp:read');
    if (permWrite) perms.push('mcp:write');
    if (perms.length === 0) {
      toast.error('至少需要选择一个权限');
      return;
    }
    try {
      setSaving(true);
      await apiKeyService.updateApiKey(apiKey.id, { name: name.trim(), permissions: perms });
      toast.success('已保存');
      onSaved && onSaved();
      onClose();
    } catch (e) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="编辑API密钥" size="sm" footer={<ModalFooter onCancel={onClose} onConfirm={handleSave} confirmText="保存" isConfirmLoading={saving} />}>
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label className="form-label">密钥名称</label>
        <input className="form-input" value={name} maxLength={50} onChange={(e) => setName(e.target.value)} placeholder="输入新的密钥名称" />
        <div className="form-label" style={{ marginTop: '0.5rem' }}>权限</div>
        <label className="permission-option">
          <input type="checkbox" checked={permRead} onChange={(e) => setPermRead(e.target.checked)} />
          <div className="permission-info">
            <div className="permission-title">读取</div>
            <div className="permission-desc">允许读取任务、看板和项目数据</div>
          </div>
        </label>
        <label className="permission-option">
          <input type="checkbox" checked={permWrite} onChange={(e) => setPermWrite(e.target.checked)} />
          <div className="permission-info">
            <div className="permission-title">写入</div>
            <div className="permission-desc">允许创建、更新、删除任务和看板</div>
          </div>
        </label>
      </div>
    </Modal>
  );
};

export default EditApiKeyModal;

