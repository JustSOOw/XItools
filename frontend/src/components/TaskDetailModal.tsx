import React, { useState, useEffect } from 'react';
import { Task, TaskUpdate } from '../types/Task';
import Modal from './Modal';
import taskService from '../services/taskService';
import useTaskStore from '../store/taskStore';
import { toast } from './ui/Toast';
import {
  InlineEdit,
  MarkdownEditor,
  Timeline,
  QuickActions,
  generateTimelineEvents,
} from './enhanced';
import { useI18n } from '../hooks/useI18n';

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, taskId, onClose }) => {
  const { t } = useI18n();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'actions'>('details');
  const { columns, updateTask: updateTaskInStore } = useTaskStore();

  // 加载任务详情
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId || !isOpen) return;

      setIsLoading(true);
      try {
        const taskDetails = await taskService.getTaskDetails(taskId);
        setTask(taskDetails);
      } catch (error) {
        console.error('获取任务详情失败:', error);
        toast.error('获取任务详情失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, isOpen]);

  // 内联编辑保存处理函数
  const handleInlineUpdate = async (field: keyof TaskUpdate, value: any) => {
    if (!taskId || !task) return;

    setIsSaving(true);
    try {
      const updateData = { [field]: value };
      const updatedTask = await taskService.updateTask(taskId, updateData);
      if (updatedTask) {
        // 同时更新本地状态和全局状态
        setTask(updatedTask);
        updateTaskInStore(updatedTask);
        toast.success(t('feedback:messages.taskUpdated'));
      }
    } catch (error) {
      console.error('更新任务失败:', error);
      toast.error(t('feedback:messages.taskUpdateFailed'));
      throw error; // 重新抛出错误，让InlineEdit组件处理
    } finally {
      setIsSaving(false);
    }
  };

  // 处理关闭模态框
  const handleClose = () => {
    setActiveTab('details');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? `${t('task:detail.title')} - ${task.title}` : t('task:detail.title')}
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-text-secondary">{t('common:loading')}</span>
        </div>
      ) : !task ? (
        <div className="py-8 text-center text-text-secondary">{t('task:detail.notFound')}</div>
      ) : (
        <div className="flex flex-col max-h-[80vh]">
          {/* 标签页导航 */}
          <div className="flex border-b border-border mb-4 flex-shrink-0">
            {[
              { key: 'details', label: t('task:detail.tabs.details'), icon: '📋' },
              { key: 'timeline', label: t('task:detail.tabs.timeline'), icon: '📅' },
              { key: 'actions', label: t('task:detail.tabs.actions'), icon: '⚡' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 标签页内容 */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {activeTab === 'details' && (
              <TaskDetailsTab
                task={task}
                columns={columns}
                onUpdate={handleInlineUpdate}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'timeline' && <TimelineTab task={task} />}
            {activeTab === 'actions' && (
              <ActionsTab
                task={task}
                columns={columns}
                onUpdate={handleInlineUpdate}
                isSaving={isSaving}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

// 任务详情标签页组件
const TaskDetailsTab: React.FC<{
  task: Task;
  columns: Array<{ id: string; name: string }>;
  onUpdate: (field: keyof TaskUpdate, value: any) => Promise<void>;
  isSaving: boolean;
}> = ({ task, columns, onUpdate, isSaving }) => {
  const { t } = useI18n();
  const [localDescription, setLocalDescription] = useState(task.description || '');

  // 当task.description变化时，更新本地状态
  useEffect(() => {
    setLocalDescription(task.description || '');
  }, [task.description]);

  return (
    <div className="space-y-6 overflow-y-auto pr-2 pb-4">
      {/* 基本信息区域 */}
      <div className="bg-accent/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('task:detail.sections.basicInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 标题 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('task:fields.title')}
            </label>
            <InlineEdit
              key={`title-${task.id}`}
              value={task.title}
              onSave={(value) => onUpdate('title', value)}
              placeholder={t('task:placeholders.title')}
              required
              className="text-lg font-medium"
            />
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('task:fields.status')}
            </label>
            <InlineEdit
              key={`status-${task.id}-${task.status}`}
              value={columns.find((col) => col.id === task.status)?.name || task.status}
              onSave={(value) => {
                const column = columns.find((col) => col.name === value);
                const newStatusId = column?.id || value;
                // 只有当状态真的发生变化时才更新
                if (newStatusId !== task.status) {
                  return onUpdate('status', newStatusId);
                }
                return Promise.resolve();
              }}
              type="select"
              options={columns.map((col) => ({ value: col.name, label: col.name }))}
            />
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('task:fields.priority')}
            </label>
            <InlineEdit
              key={`priority-${task.id}-${task.priority}`}
              value={
                task.priority === 'High'
                  ? t('task:priority.high')
                  : task.priority === 'Medium'
                    ? t('task:priority.medium')
                    : task.priority === 'Low'
                      ? t('task:priority.low')
                      : t('task:priority.none')
              }
              onSave={(value) => {
                const priorityMap: Record<string, string | null> = {
                  [t('task:priority.high')]: 'High',
                  [t('task:priority.medium')]: 'Medium',
                  [t('task:priority.low')]: 'Low',
                  [t('task:priority.none')]: null,
                };
                const newPriority = priorityMap[value];
                // 只有当优先级真的发生变化时才更新
                if (newPriority !== task.priority) {
                  return onUpdate('priority', newPriority);
                }
                return Promise.resolve();
              }}
              type="select"
              options={[
                { value: t('task:priority.high'), label: t('task:priority.high') },
                { value: t('task:priority.medium'), label: t('task:priority.medium') },
                { value: t('task:priority.low'), label: t('task:priority.low') },
                { value: t('task:priority.none'), label: t('task:priority.none') },
              ]}
            />
          </div>

          {/* 负责人 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('task:fields.assignee')}
            </label>
            <InlineEdit
              value={task.assignee || ''}
              onSave={(value) => onUpdate('assignee', value || null)}
              placeholder={t('task:placeholders.assignee')}
            />
          </div>

          {/* 截止日期 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('task:fields.dueDate')}
            </label>
            <InlineEdit
              value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''}
              onSave={(value) => onUpdate('dueDate', value ? new Date(value).toISOString() : null)}
              type="date"
              placeholder={t('task:placeholders.dueDate')}
            />
          </div>
        </div>
      </div>
      {/* 描述区域 */}
      <div className="bg-accent/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('task:detail.sections.description')}
        </h3>
        <MarkdownEditor
          key={`description-${task.id}`}
          value={localDescription}
          onChange={(value) => {
            // 实时更新本地状态，用于预览
            setLocalDescription(value);
          }}
          onSave={(value) => {
            // 只有当描述真的发生变化时才保存
            if (value !== task.description) {
              return onUpdate('description', value);
            }
            return Promise.resolve();
          }}
          placeholder={t('task:placeholders.description')}
          autoSave
          autoSaveDelay={3000}
          minHeight="200px"
        />
      </div>

      {/* 验收标准 */}
      <div className="bg-accent/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('task:detail.sections.acceptanceCriteria')}
        </h3>
        <InlineEdit
          value={task.acceptanceCriteria || ''}
          onSave={(value) => onUpdate('acceptanceCriteria', value)}
          type="textarea"
          multiline
          placeholder={t('task:placeholders.acceptanceCriteria')}
          className="min-h-[100px]"
        />
      </div>

      {/* 工时和标签 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 工时信息 */}
        <div className="bg-accent/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {t('task:detail.sections.timeTracking')}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('task:fields.estimatedEffort')}
              </label>
              <InlineEdit
                value={task.estimatedEffort?.toString() || ''}
                onSave={(value) => onUpdate('estimatedEffort', value ? parseFloat(value) : null)}
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('task:fields.loggedTime')}
              </label>
              <InlineEdit
                value={task.loggedTime?.toString() || ''}
                onSave={(value) => onUpdate('loggedTime', value ? parseFloat(value) : null)}
                type="number"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* 标签管理 */}
        <div className="bg-accent/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">{t('task:fields.tags')}</h3>
          <div className="space-y-3">
            <InlineEdit
              value={(task.tags || [])
                .map((tag) => (typeof tag === 'string' ? tag : tag.name))
                .join(', ')}
              onSave={(value) => {
                const tags = value
                  ? value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  : [];
                return onUpdate('tags', tags);
              }}
              placeholder={t('task:placeholders.tags')}
            />
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    {typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 元数据信息 */}
      <div className="bg-accent/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('task:detail.sections.metadata')}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">{t('task:fields.id')}:</span>
            <span className="ml-2 font-mono text-text-primary">{task.id}</span>
          </div>
          <div>
            <span className="text-text-secondary">{t('task:fields.createdAt')}:</span>
            <span className="ml-2 text-text-primary">
              {new Date(task.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">{t('task:fields.updatedAt')}:</span>
            <span className="ml-2 text-text-primary">
              {new Date(task.updatedAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">{t('task:fields.sortOrder')}:</span>
            <span className="ml-2 text-text-primary">
              {task.sortOrder || t('task:fields.notSet')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 时间线标签页组件
const TimelineTab: React.FC<{ task: Task }> = ({ task }) => {
  const { t } = useI18n();
  const timelineEvents = generateTimelineEvents(task, t);

  return (
    <div className="h-full overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {t('task:detail.tabs.timeline')}
        </h3>
        <p className="text-sm text-text-secondary">{t('task:detail.timelineDescription')}</p>
      </div>
      <Timeline events={timelineEvents} maxHeight="50vh" showUserAvatars />
    </div>
  );
};

// 快捷操作标签页组件
const ActionsTab: React.FC<{
  task: Task;
  columns: Array<{ id: string; name: string }>;
  onUpdate: (field: keyof TaskUpdate, value: any) => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
}> = ({ task, columns, onUpdate, isSaving, onClose }) => {
  const { t } = useI18n();
  const { deleteTask: deleteTaskFromStore } = useTaskStore();

  const handleStatusChange = async (statusId: string) => {
    await onUpdate('status', statusId);
  };

  const handlePriorityChange = async (priority: 'High' | 'Medium' | 'Low' | null) => {
    await onUpdate('priority', priority);
  };

  const handleAssigneeChange = async (assignee: string) => {
    await onUpdate('assignee', assignee);
  };

  const handleDuplicate = async () => {
    // 这里可以实现复制任务的逻辑
    toast.success(t('task:actions.duplicateNotImplemented'));
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(task.id);
      // 同时更新全局状态
      deleteTaskFromStore(task.id);
      toast.success(t('feedback:messages.taskDeleted'));
      // 关闭模态框
      onClose();
    } catch (error) {
      toast.error(t('feedback:messages.taskDeleteFailed'));
    }
  };

  return (
    <div className="h-full overflow-y-auto px-1">
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-text-primary">{t('task:detail.tabs.actions')}</h3>
        <p className="text-sm text-text-secondary">{t('task:detail.actionsDescription')}</p>
      </div>
      <div className="pb-4">
        <QuickActions
          task={task}
          columns={columns}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onAssigneeChange={handleAssigneeChange}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

export default TaskDetailModal;
