import React, { useState } from 'react';
import { Task } from '../types/Task';
import Card from './Card';
import MoreButton, { MoreMenuItem } from './MoreButton';
import ColorPickerModal from './ColorPickerModal';
import { CardAnimation } from './animations';
import { useI18n } from '../hooks/useI18n';

interface TaskCardProps {
  task: Task;
  onClick: (taskId: string) => void;
  onColorChange?: (color: string) => void;
  onDelete?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onColorChange, onDelete }) => {
  const { t } = useI18n();
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 更多按钮菜单项
  const moreMenuItems: MoreMenuItem[] = [
    {
      id: 'set-color',
      label: t('task:actions.setColor'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
          />
        </svg>
      ),
      onClick: () => {
        setShowColorPicker(true);
      },
    },
    {
      id: 'delete',
      label: t('task:actions.delete'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      onClick: () => onDelete?.(),
      danger: true,
    },
  ];

  // 日期格式化函数
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(t('common:locale')).format(date);
    } catch (e) {
      return null;
    }
  };

  // 获取优先级对应的颜色和文本
  const getPriorityInfo = () => {
    switch (task.priority) {
      case 'High':
        return {
          color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
          text: t('task:priority.high'),
        };
      case 'Medium':
        return {
          color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
          text: t('task:priority.medium'),
        };
      case 'Low':
        return {
          color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
          text: t('task:priority.low'),
        };
      default:
        return {
          color: 'text-gray-500 bg-gray-50 dark:bg-gray-800/20',
          text: t('task:priority.none'),
        };
    }
  };

  const { color, text } = getPriorityInfo();

  return (
    <>
      <CardAnimation variant="hover" className="w-full">
        <Card
          variant="default"
          className="cursor-pointer relative group"
          isHoverable
          isInteractive
          style={{
            background: task.color || undefined,
          }}
        >
          {/* 更多按钮 - 悬停时显示 */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-[100] task-more-button">
            <MoreButton items={moreMenuItems} size="sm" placement="bottom-right" />
          </div>

          <div onClick={() => onClick(task.id)} className="w-full" data-task-id={task.id}>
            {/* 任务标题 */}
            <div className="flex items-center justify-between pr-8">
              <h3 className="font-medium text-text-primary">{task.title}</h3>
              {task.dueDate && (
                <span className="text-xs text-text-secondary">{formatDate(task.dueDate)}</span>
              )}
            </div>

            {/* 任务描述 (如果有) */}
            {task.description && (
              <p className="mt-1.5 text-sm text-text-secondary line-clamp-2">{task.description}</p>
            )}

            {/* 底部信息栏 */}
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {/* 优先级标签 */}
                <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{text}</span>

                {/* 任务标签 (显示第一个) */}
                {task.tags && task.tags.length > 0 && (
                  <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                    {typeof task.tags[0] === 'string'
                      ? task.tags[0]
                      : (task.tags[0] as any)?.name || t('task:fields.tag')}
                    {task.tags.length > 1 ? ` +${task.tags.length - 1}` : ''}
                  </span>
                )}
              </div>

              {/* 任务ID */}
              <span className="text-xs text-text-secondary">{task.id.substring(0, 6)}</span>
            </div>

            {/* 负责人 */}
            {task.assignee && (
              <div className="mt-1.5 flex items-center">
                <span className="inline-block w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                  {task.assignee.substring(0, 1).toUpperCase()}
                </span>
                <span className="ml-1 text-xs text-text-secondary">{task.assignee}</span>
              </div>
            )}
          </div>
        </Card>
      </CardAnimation>

      {/* 颜色选择器模态框 - 移到Card外部以避免z-index问题 */}
      <ColorPickerModal
        currentColor={task.color}
        onColorChange={(newColor) => {
          onColorChange?.(newColor);
          setShowColorPicker(false);
        }}
        onClose={() => setShowColorPicker(false)}
        isOpen={showColorPicker}
        title={t('task:actions.setTaskColor')}
      />
    </>
  );
};

export default TaskCard;
