/**
 * 快捷操作面板组件
 * 提供任务的快速操作功能
 */
import React from 'react';
import classNames from 'classnames';
import { Task } from '../../types/Task';
import Button from '../Button';
import { useI18n } from '../../hooks/useI18n';
import globalConfirmDialog from '../../services/globalConfirmDialog';

interface QuickActionsProps {
  task: Task;
  columns: Array<{ id: string; name: string }>;
  onStatusChange: (statusId: string) => Promise<void>;
  onPriorityChange: (priority: 'High' | 'Medium' | 'Low' | null) => Promise<void>;
  onAssigneeChange: (assignee: string) => Promise<void>;
  onDuplicate?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
  isLoading?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  task,
  columns,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDuplicate,
  onDelete,
  className = '',
  isLoading = false,
}) => {
  const { t } = useI18n();
  const priorityOptions = [
    { value: 'High', label: t('task:priority.high'), color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
    { value: 'Medium', label: t('task:priority.medium'), color: 'text-yellow-600', bgColor: 'bg-yellow-50 hover:bg-yellow-100' },
    { value: 'Low', label: t('task:priority.low'), color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100' },
    { value: null, label: t('task:priority.none'), color: 'text-gray-600', bgColor: 'bg-gray-50 hover:bg-gray-100' },
  ];

  const getCurrentPriority = () => {
    return priorityOptions.find(option => option.value === task.priority) || priorityOptions[3];
  };



  return (
    <div className={classNames('space-y-4', className)}>
      {/* 状态快速切换 */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-2">{t('task:actions.statusChange')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {columns.map((column) => (
            <button
              key={column.id}
              onClick={() => onStatusChange(column.id)}
              disabled={isLoading || task.status === column.id}
              className={classNames(
                'px-3 py-2 text-sm rounded-md transition-colors text-left',
                task.status === column.id
                  ? 'bg-primary text-white cursor-default'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50'
              )}
            >
              {column.name}
              {task.status === column.id && (
                <span className="ml-2 text-xs">{t('task:status.current')}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 优先级快速切换 */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-2">{t('task:actions.priorityChange')}</h4>
        <div className="space-y-1">
          {priorityOptions.map((option) => (
            <button
              key={option.value || 'none'}
              onClick={() => onPriorityChange(option.value as any)}
              disabled={isLoading || task.priority === option.value}
              className={classNames(
                'w-full px-3 py-2 text-sm rounded-md transition-colors text-left flex items-center justify-between',
                task.priority === option.value
                  ? 'bg-primary text-white cursor-default'
                  : `${option.bgColor} ${option.color} disabled:opacity-50`
              )}
            >
              <span>{option.label}</span>
              {task.priority === option.value && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 负责人快速设置 */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-2">{t('task:fields.assignee')}</h4>
        <div className="space-y-2">
          <input
            type="text"
            value={task.assignee || ''}
            onChange={(e) => onAssigneeChange(e.target.value)}
            placeholder={t('task:placeholders.assignee')}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          
          {/* 常用负责人快捷按钮 */}
          <div className="flex flex-wrap gap-1">
            {['张三', '李四', '王五', '赵六'].map((name) => (
              <button
                key={name}
                onClick={() => onAssigneeChange(name)}
                disabled={isLoading || task.assignee === name}
                className={classNames(
                  'px-2 py-1 text-xs rounded border transition-colors',
                  task.assignee === name
                    ? 'bg-primary text-white border-primary cursor-default'
                    : 'bg-background text-text-secondary border-border hover:border-primary hover:text-primary'
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 其他操作 */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-2">{t('task:actions.otherActions')}</h4>
        <div className="space-y-2">
          {onDuplicate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              disabled={isLoading}
              className="w-full justify-start"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('task:actions.duplicate')}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}?task=${task.id}`;
              navigator.clipboard.writeText(url);
              // 这里可以添加toast提示
            }}
            disabled={isLoading}
            className="w-full justify-start"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            {t('task:actions.copyLink')}
          </Button>

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                globalConfirmDialog.show(
                  {
                    title: t('task:actions.deleteTask', { defaultValue: '删除任务' }),
                    message: t('task:actions.deleteConfirm', { defaultValue: '确定要删除这个任务吗？此操作不可撤销。' }),
                    type: 'danger',
                    confirmText: t('common:actions.delete'),
                    cancelText: t('common:actions.cancel'),
                  },
                  () => {
                    onDelete();
                  }
                );
              }}
              disabled={isLoading}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t('task:actions.delete')}
            </Button>
          )}
        </div>
      </div>

      {/* 任务统计信息 */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-text-primary mb-2">{t('task:detail.sections.taskInfo')}</h4>
        <div className="space-y-1 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>{t('task:fields.createdAt')}:</span>
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('task:fields.updatedAt')}:</span>
            <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
          </div>
          {task.estimatedEffort && (
            <div className="flex justify-between">
              <span>{t('task:fields.estimatedEffort')}:</span>
              <span>{task.estimatedEffort}{t('task:units.hours')}</span>
            </div>
          )}
          {task.loggedTime && (
            <div className="flex justify-between">
              <span>{t('task:fields.loggedTime')}:</span>
              <span>{task.loggedTime}{t('task:units.hours')}</span>
            </div>
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="flex justify-between">
              <span>{t('task:fields.tagCount')}:</span>
              <span>{task.tags.length}{t('task:units.count')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
