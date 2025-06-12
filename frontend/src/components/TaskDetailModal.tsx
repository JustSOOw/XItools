import React, { useState, useEffect } from 'react';
import { Task, TaskUpdate } from '../types/Task';
import Modal, { ModalFooter } from './Modal';
import mcpService from '../services/mcpService';
import useTaskStore from '../store/taskStore';
import { toast } from './ui/Toast';

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, taskId, onClose }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState<TaskUpdate>({});
  const [isSaving, setIsSaving] = useState(false);
  const { columns } = useTaskStore();

  // 加载任务详情
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId || !isOpen) return;
      
      setIsLoading(true);
      try {
        const taskDetails = await mcpService.getTaskDetails(taskId);
        setTask(taskDetails);
        // 初始化编辑表单
        if (taskDetails) {
          setEditForm({
            title: taskDetails.title,
            description: taskDetails.description || '',
            status: taskDetails.status,
            priority: taskDetails.priority || null,
            dueDate: taskDetails.dueDate || null,
            assignee: taskDetails.assignee || '',
            tags: Array.isArray(taskDetails.tags)
              ? taskDetails.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
              : [],
            acceptanceCriteria: taskDetails.acceptanceCriteria || '',
            estimatedEffort: taskDetails.estimatedEffort || null,
            loggedTime: taskDetails.loggedTime || null,
          });
        }
      } catch (error) {
        console.error('获取任务详情失败:', error);
        toast.error('获取任务详情失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, isOpen]);

  // 处理表单字段变化
  const handleFormChange = (field: keyof TaskUpdate, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // 保存任务更新
  const handleSaveTask = async () => {
    if (!taskId || !task) return;
    
    setIsSaving(true);
    try {
      const updatedTask = await mcpService.updateTask(taskId, editForm);
      if (updatedTask) {
        setTask(updatedTask);
        // 更新完成后退出编辑模式
        setIsEditing(false);
        toast.success('任务更新成功');
      }
    } catch (error) {
      console.error('更新任务失败:', error);
      toast.error('更新任务失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 处理关闭模态框
  const handleClose = () => {
    // 如果正在编辑，弹出确认
    if (isEditing) {
      if (window.confirm('您有未保存的更改，确定要关闭吗？')) {
        setIsEditing(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "编辑任务" : "任务详情"}
      size="lg"
      footer={
        isEditing ? (
          <ModalFooter
            onCancel={() => setIsEditing(false)}
            onConfirm={handleSaveTask}
            isConfirmLoading={isSaving}
            confirmText="保存"
          />
        ) : (
          <ModalFooter
            onCancel={onClose}
            onConfirm={() => setIsEditing(true)}
            confirmText="编辑"
          />
        )
      }
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
        <div className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              标题
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={editForm.title || ''}
                onChange={(e) => handleFormChange('title', e.target.value)}
              />
            ) : (
              <p className="text-text-primary">{task.title}</p>
            )}
          </div>

          {/* ID和创建日期 (只读) */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                ID
              </label>
              <p className="text-text-secondary text-sm">{task.id}</p>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                创建时间
              </label>
              <p className="text-text-secondary text-sm">
                {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              描述
            </label>
            {isEditing ? (
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                value={editForm.description || ''}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            ) : (
              <p className="text-text-primary whitespace-pre-wrap">{task.description || '无描述'}</p>
            )}
          </div>

          {/* 状态和优先级 */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-1">
                状态
              </label>
              {isEditing ? (
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editForm.status || ''}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  {columns.map(column => (
                    <option key={column.id} value={column.id}>
                      {column.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-text-primary">{
                  columns.find(column => column.id === task.status)?.name || task.status
                }</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-1">
                优先级
              </label>
              {isEditing ? (
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editForm.priority || ''}
                  onChange={(e) => handleFormChange('priority', e.target.value || null)}
                >
                  <option value="">未设置</option>
                  <option value="High">高</option>
                  <option value="Medium">中</option>
                  <option value="Low">低</option>
                </select>
              ) : (
                <p className="text-text-primary">{
                  task.priority === 'High' ? '高' : 
                  task.priority === 'Medium' ? '中' : 
                  task.priority === 'Low' ? '低' : '未设置'
                }</p>
              )}
            </div>
          </div>

          {/* 截止日期和负责人 */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-1">
                截止日期
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editForm.dueDate ? new Date(editForm.dueDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleFormChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              ) : (
                <p className="text-text-primary">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : '无截止日期'}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-1">
                负责人
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editForm.assignee || ''}
                  onChange={(e) => handleFormChange('assignee', e.target.value || null)}
                  placeholder="输入负责人"
                />
              ) : (
                <p className="text-text-primary">{task.assignee || '未分配'}</p>
              )}
            </div>
          </div>

          {/* 验收标准 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              验收标准
            </label>
            {isEditing ? (
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                value={editForm.acceptanceCriteria || ''}
                onChange={(e) => handleFormChange('acceptanceCriteria', e.target.value)}
                placeholder="输入任务验收标准"
              />
            ) : (
              <p className="text-text-primary whitespace-pre-wrap">
                {task.acceptanceCriteria || '无验收标准'}
              </p>
            )}
          </div>

          {/* 工时信息 */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-1">
                估算工时
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editForm.estimatedEffort || ''}
                  onChange={(e) => handleFormChange('estimatedEffort', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="小时"
                />
              ) : (
                <p className="text-text-primary">
                  {task.estimatedEffort ? `${task.estimatedEffort} 小时` : '未估算'}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-1">
                实际工时
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editForm.loggedTime || ''}
                  onChange={(e) => handleFormChange('loggedTime', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="小时"
                />
              ) : (
                <p className="text-text-primary">
                  {task.loggedTime ? `${task.loggedTime} 小时` : '未记录'}
                </p>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              标签
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={(editForm.tags || []).join(', ')}
                onChange={(e) => {
                  const tags = e.target.value
                    ? e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    : [];
                  handleFormChange('tags', tags);
                }}
                placeholder="用逗号分隔多个标签"
              />
            ) : (
              <div className="flex flex-wrap gap-1">
                {(task.tags && task.tags.length > 0) ? task.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                    {typeof tag === 'string' ? tag : (tag as any)?.name || '标签'}
                  </span>
                )) : <span className="text-text-secondary">无标签</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TaskDetailModal; 