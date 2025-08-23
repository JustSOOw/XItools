/**
 * 查看API密钥模态框
 * 作用：在用户点击“查看密钥”按钮后，安全地再次展示该密钥的完整值以便复制（仅所有者可见）。
 */
import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import useToast from '../ui/Toast/useToast';
import { apiKeyService } from '../../services/apiKeyService';

interface ViewApiKeyModalProps {
  // 是否可见
  isOpen: boolean;
  // 关闭回调
  onClose: () => void;
  // 目标密钥ID
  keyId: string | null;
  // 显示的密钥名称（用于标题提示）
  keyName?: string;
}

const ViewApiKeyModal: React.FC<ViewApiKeyModalProps> = ({ isOpen, onClose, keyId, keyName }) => {
  const [, toast] = useToast();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  // 打开时拉取完整密钥
  useEffect(() => {
    const fetchKey = async () => {
      if (!isOpen || !keyId) return;
      try {
        setLoading(true);
        const detail = await apiKeyService.getApiKeyDetail(keyId);
        setApiKey(detail.apiKey);
      } catch (e) {
        toast.error('获取密钥失败');
      } finally {
        setLoading(false);
      }
    };
    fetchKey();
    // 清理复制状态
    if (!isOpen) setCopied(false);
  }, [isOpen, keyId]);

  // 复制
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error('复制失败');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`查看密钥${keyName ? '：' + keyName : ''}`} size="md">
      <div className="api-key-display">
        <div className="key-section">
          <label className="section-label">您的API密钥</label>
          <div className="key-container">
            <code className="api-key-value">{loading ? '加载中…' : apiKey}</code>
            {!loading && (
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={onCopy} title="复制API密钥">
                <i className={`icon-${copied ? 'check' : 'copy'}`}></i>
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="security-warning" style={{ marginTop: '8px' }}>
        <i className="icon-alert-triangle"></i>
        <div className="warning-content">
          <strong>提示：</strong>
          请勿在公共场所泄露此密钥，丢失或怀疑泄露时请及时撤销并重新生成。
        </div>
      </div>
    </Modal>
  );
};

export default ViewApiKeyModal;

