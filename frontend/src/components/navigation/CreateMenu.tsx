/**
 * 新建菜单组件
 */

import React, { useState } from 'react';
import { useNavigationStore } from '../../store/navigationStore';
import { multiBoardService } from '../../services/multiBoardService';
import { useI18n } from '../../hooks/useI18n';
import Modal from '../Modal';
import Button from '../Button';
import Input from '../ui/Input';

interface CreateMenuProps {
  type: 'workspace' | 'project' | 'board';
  parentId?: string;
  onClose: () => void;
  onConfirm?: (data: { name: string; description?: string }) => Promise<void>;
}

const CreateMenu: React.FC<CreateMenuProps> = ({ type, parentId, onClose, onConfirm }) => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { addWorkspace, addProject, addBoard, getCurrentWorkspace } = useNavigationStore();

  // 获取标题和描述
  const getModalConfig = () => {
    switch (type) {
      case 'workspace':
        return {
          title: t('navigation.createWorkspace', { defaultValue: '新建工作区' }),
          nameLabel: t('navigation.workspaceName', { defaultValue: '工作区名称' }),
          namePlaceholder: t('navigation.workspaceNamePlaceholder', {
            defaultValue: '请输入工作区名称',
          }),
          descriptionLabel: t('navigation.workspaceDescription', { defaultValue: '工作区描述' }),
          descriptionPlaceholder: t('navigation.workspaceDescriptionPlaceholder', {
            defaultValue: '请输入工作区描述（可选）',
          }),
        };
      case 'project':
        return {
          title: t('navigation.createProject', { defaultValue: '新建项目' }),
          nameLabel: t('navigation.projectName', { defaultValue: '项目名称' }),
          namePlaceholder: t('navigation.projectNamePlaceholder', {
            defaultValue: '请输入项目名称',
          }),
          descriptionLabel: t('navigation.projectDescription', { defaultValue: '项目描述' }),
          descriptionPlaceholder: t('navigation.projectDescriptionPlaceholder', {
            defaultValue: '请输入项目描述（可选）',
          }),
        };
      case 'board':
        return {
          title: t('navigation.createBoard', { defaultValue: '新建看板' }),
          nameLabel: t('navigation.boardName', { defaultValue: '看板名称' }),
          namePlaceholder: t('navigation.boardNamePlaceholder', { defaultValue: '请输入看板名称' }),
          descriptionLabel: t('navigation.boardDescription', { defaultValue: '看板描述' }),
          descriptionPlaceholder: t('navigation.boardDescriptionPlaceholder', {
            defaultValue: '请输入看板描述（可选）',
          }),
        };
    }
  };

  const config = getModalConfig();

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      // 如果有onConfirm回调，使用它
      if (onConfirm) {
        await onConfirm({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
      } else {
        // 否则使用原有的逻辑
        switch (type) {
          case 'workspace':
            const workspace = await multiBoardService.createWorkspace({
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
              isDefault: false,
            });
            addWorkspace({
              ...workspace,
              type: 'workspace',
            });
            break;

          case 'project':
            if (!parentId) {
              throw new Error('缺少工作区ID');
            }
            const project = await multiBoardService.createProject({
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
              workspaceId: parentId,
            });
            addProject({
              ...project,
              type: 'project',
            });
            break;

          case 'board':
            // 确定看板的父级容器
            let boardData: any = {
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
            };

            if (parentId) {
              // 如果有parentId，判断是项目ID还是工作区ID
              const currentWorkspace = getCurrentWorkspace();
              if (currentWorkspace && parentId === currentWorkspace.id) {
                // 直接属于工作区
                boardData.workspaceId = parentId;
              } else {
                // 属于项目
                boardData.projectId = parentId;
              }
            } else {
              // 没有parentId，使用当前工作区
              const currentWorkspace = getCurrentWorkspace();
              if (currentWorkspace) {
                boardData.workspaceId = currentWorkspace.id;
              } else {
                throw new Error('无法确定看板的父级容器');
              }
            }

            const board = await multiBoardService.createBoard(boardData);
            addBoard({
              ...board,
              type: 'board',
            });
            break;
        }
      }

      onClose();
    } catch (error) {
      console.error(`创建${type}失败:`, error);
      // TODO: 显示错误提示
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={config.title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 名称输入 */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {config.nameLabel}
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={config.namePlaceholder}
            required
            autoFocus
            disabled={isLoading}
          />
        </div>

        {/* 描述输入 */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {config.descriptionLabel}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={config.descriptionPlaceholder}
            rows={3}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none bg-surface text-text-primary placeholder-text-secondary"
          />
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !formData.name.trim()}
            isLoading={isLoading}
          >
            {t('common:actions.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateMenu;
