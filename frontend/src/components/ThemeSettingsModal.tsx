/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 15:40:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 15:40:00
 * @FilePath: \XItools\frontend\src\components\ThemeSettingsModal.tsx
 * @Description: 主题设置模态框组件
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import Modal from './Modal';
import ThemeSettings from './ThemeSettings';
import Button from './Button';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="主题设置"
      size="md"
    >
      <div className="space-y-4">
        {/* 主题设置内容 */}
        <ThemeSettings />

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ThemeSettingsModal;
