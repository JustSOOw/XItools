/**
 * 创建选择器组件
 * 用于在工作区层级选择创建项目或看板
 */

import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import Modal from '../Modal';
import Button from '../Button';

interface CreateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'project' | 'board') => void;
  workspaceName?: string;
}

/**
 * 创建选择器组件
 * 让用户选择在工作区下创建项目还是看板
 */
const CreateSelector: React.FC<CreateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectType,
  workspaceName = '工作区'
}) => {
  const { t } = useI18n();

  // 处理选择
  const handleSelect = (type: 'project' | 'board') => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('navigation.selectCreateType', { 
        defaultValue: `在 "${workspaceName}" 中新建`,
        workspaceName 
      })}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-text-secondary text-sm mb-6">
          {t('navigation.selectCreateTypeDescription', { 
            defaultValue: '请选择要创建的类型：' 
          })}
        </p>

        {/* 创建选项 */}
        <div className="space-y-3">
          {/* 创建项目选项 */}
          <button
            onClick={() => handleSelect('project')}
            className="w-full p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-surface/50 transition-all duration-200 text-left group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-lg">📁</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors">
                  {t('navigation.createProject', { defaultValue: '创建项目' })}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {t('navigation.createProjectDescription', { 
                    defaultValue: '项目可以包含多个看板，适合组织相关的任务集合' 
                  })}
                </p>
              </div>
            </div>
          </button>

          {/* 创建看板选项 */}
          <button
            onClick={() => handleSelect('board')}
            className="w-full p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-surface/50 transition-all duration-200 text-left group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <span className="text-lg">📋</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary group-hover:text-success transition-colors">
                  {t('navigation.createBoard', { defaultValue: '创建看板' })}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {t('navigation.createBoardDescription', { 
                    defaultValue: '直接在工作区下创建独立的任务看板' 
                  })}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* 取消按钮 */}
        <div className="flex justify-end pt-4 border-t border-border/30">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            {t('common:actions.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateSelector;
