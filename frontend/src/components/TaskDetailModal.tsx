import React, { useState, useEffect } from 'react';
import { Task, TaskUpdate } from '../types/Task';
import Modal from './Modal';
import mcpService from '../services/mcpService';
import useTaskStore from '../store/taskStore';
import { toast } from './ui/Toast';
import { InlineEdit, MarkdownEditor, Timeline, QuickActions, generateTimelineEvents } from './enhanced';

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, taskId, onClose }) => {
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
        const taskDetails = await mcpService.getTaskDetails(taskId);
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
      const updatedTask = await mcpService.updateTask(taskId, updateData);
      if (updatedTask) {
        // 同时更新本地状态和全局状态
        setTask(updatedTask);
        updateTaskInStore(updatedTask);
        toast.success('任务更新成功');
      }
    } catch (error) {
      console.error('更新任务失败:', error);
      toast.error('更新任务失败，请重试');
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
      title={task ? `任务详情 - ${task.title}` : "任务详情"}
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-text-secondary">加载中...</span>
        </div>
      ) : !task ? (
        <div className="py-8 text-center text-text-secondary">
          未找到任务或加载失败
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* 标签页导航 */}
          <div className="flex border-b border-border mb-4">
            {[
              { key: 'details', label: '详细信息', icon: '📋' },
              { key: 'timeline', label: '操作历史', icon: '📅' },
              { key: 'actions', label: '快捷操作', icon: '⚡' },
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
          <div className="flex-1 overflow-hidden">
            {activeTab === 'details' && (
              <TaskDetailsTab
                task={task}
                columns={columns}
                onUpdate={handleInlineUpdate}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelineTab task={task} />
            )}
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
  const [localDescription, setLocalDescription] = useState(task.description || '');

  // 当task.description变化时，更新本地状态
  useEffect(() => {
    setLocalDescription(task.description || '');
  }, [task.description]);

  return (
    <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
      {/* 基本信息区域 */}
      <div className="bg-accent/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 标题 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              标题
            </label>
            <InlineEdit
              value={task.title}
              onSave={(value) => onUpdate('title', value)}
              placeholder="输入任务标题"
              required
              className="text-lg font-medium"
            />
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              状态
            </label>
            <InlineEdit
              value={columns.find(col => col.id === task.status)?.name || task.status}
              onSave={(value) => {
                const column = columns.find(col => col.name === value);
                return onUpdate('status', column?.id || value);
              }}
              type="select"
              options={columns.map(col => ({ value: col.name, label: col.name }))}
            />
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              优先级
            </label>
            <InlineEdit
              value={task.priority === 'High' ? '高' : task.priority === 'Medium' ? '中' : task.priority === 'Low' ? '低' : '未设置'}
              onSave={(value) => {
                const priorityMap: Record<string, string | null> = {
                  '高': 'High',
                  '中': 'Medium',
                  '低': 'Low',
                  '未设置': null
                };
                return onUpdate('priority', priorityMap[value]);
              }}
              type="select"
              options={[
                { value: '高', label: '高' },
                { value: '中', label: '中' },
                { value: '低', label: '低' },
                { value: '未设置', label: '未设置' }
              ]}
            />
          </div>

          {/* 负责人 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              负责人
            </label>
            <InlineEdit
              value={task.assignee || ''}
              onSave={(value) => onUpdate('assignee', value || null)}
              placeholder="输入负责人"
            />
          </div>

          {/* 截止日期 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              截止日期
            </label>
            <InlineEdit
              value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''}
              onSave={(value) => onUpdate('dueDate', value ? new Date(value).toISOString() : null)}
              type="date"
              placeholder="设置截止日期"
            />
          </div>
        </div>
      </div>
      {/* 描述区域 */}
      <div className="bg-accent/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">任务描述</h3>
        <MarkdownEditor
          value={localDescription}
          onChange={(value) => {
            // 实时更新本地状态，用于预览
            setLocalDescription(value);
          }}
          onSave={(value) => {
            // 保存到后端并更新全局状态
            return onUpdate('description', value);
          }}
          placeholder="输入任务描述..."
          autoSave
          autoSaveDelay={1500}
          minHeight="200px"
        />
      </div>

      {/* 验收标准 */}
      <div className="bg-accent/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">验收标准</h3>
        <InlineEdit
          value={task.acceptanceCriteria || ''}
          onSave={(value) => onUpdate('acceptanceCriteria', value)}
          type="textarea"
          multiline
          placeholder="输入验收标准..."
          className="min-h-[100px]"
        />
      </div>

      {/* 工时和标签 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 工时信息 */}
        <div className="bg-accent/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">工时信息</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                估算工时 (小时)
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
                实际工时 (小时)
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
          <h3 className="text-lg font-semibold text-text-primary mb-4">标签</h3>
          <div className="space-y-3">
            <InlineEdit
              value={(task.tags || []).map(tag => typeof tag === 'string' ? tag : tag.name).join(', ')}
              onSave={(value) => {
                const tags = value ? value.split(',').map(tag => tag.trim()).filter(Boolean) : [];
                return onUpdate('tags', tags);
              }}
              placeholder="用逗号分隔多个标签"
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
        <h3 className="text-lg font-semibold text-text-primary mb-4">元数据</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">任务ID:</span>
            <span className="ml-2 font-mono text-text-primary">{task.id}</span>
          </div>
          <div>
            <span className="text-text-secondary">创建时间:</span>
            <span className="ml-2 text-text-primary">{new Date(task.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-text-secondary">最后更新:</span>
            <span className="ml-2 text-text-primary">{new Date(task.updatedAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-text-secondary">排序顺序:</span>
            <span className="ml-2 text-text-primary">{task.sortOrder || '未设置'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 时间线标签页组件
const TimelineTab: React.FC<{ task: Task }> = ({ task }) => {
  const timelineEvents = generateTimelineEvents(task);

  return (
    <div className="h-full overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">操作历史</h3>
        <p className="text-sm text-text-secondary">查看任务的所有变更记录</p>
      </div>
      <Timeline
        events={timelineEvents}
        maxHeight="50vh"
        showUserAvatars
      />
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
    toast.success('复制功能待实现');
  };

  const handleDelete = async () => {
    try {
      await mcpService.deleteTask(task.id);
      // 同时更新全局状态
      deleteTaskFromStore(task.id);
      toast.success('任务已删除');
      // 关闭模态框
      onClose();
    } catch (error) {
      toast.error('删除任务失败');
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">快捷操作</h3>
        <p className="text-sm text-text-secondary">快速修改任务状态和属性</p>
      </div>
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
  );
};

export default TaskDetailModal;