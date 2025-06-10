import React from 'react';
import Card from './Card';
import { Task } from '../types/Task';

interface TaskDragOverlayProps {
  task: Task;
}

const TaskDragOverlay: React.FC<TaskDragOverlayProps> = ({ task }) => {
  // 优先级颜色映射
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', text: '高' };
      case 'Medium':
        return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', text: '中' };
      case 'Low':
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', text: '低' };
      default:
        return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300', text: '无' };
    }
  };

  const { color, text } = getPriorityStyle(task.priority || '');

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="transform rotate-3 scale-105 shadow-2xl opacity-95">
      <Card
        variant="default"
        className="cursor-pointer transition-all transform hover:shadow-md hover:-translate-y-0.5"
        isHoverable
        isInteractive
        style={{
          background: task.color || undefined,
        }}
      >
        <div className="w-full">
          {/* 任务标题 - 移除右内边距，因为拖拽预览不需要更多按钮 */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-text-primary">{task.title}</h3>
            {task.dueDate && (
              <span className="text-xs text-text-secondary">
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {/* 任务描述 (如果有) */}
          {task.description && (
            <p className="mt-1.5 text-sm text-text-secondary line-clamp-2">
              {task.description}
            </p>
          )}

          {/* 底部信息栏 */}
          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* 优先级标签 */}
              <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>
                {text}
              </span>

              {/* 任务标签 (显示第一个) */}
              {task.tags && task.tags.length > 0 && (
                <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                  {typeof task.tags[0] === 'string' ? task.tags[0] : (task.tags[0] as any)?.name || '标签'}
                  {task.tags.length > 1 ? ` +${task.tags.length - 1}` : ''}
                </span>
              )}
            </div>

            {/* 任务ID */}
            <span className="text-xs text-text-secondary">
              {task.id.substring(0, 6)}
            </span>
          </div>

          {/* 负责人 */}
          {task.assignee && (
            <div className="mt-1.5 flex items-center">
              <span className="inline-block w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                {task.assignee.substring(0, 1).toUpperCase()}
              </span>
              <span className="ml-1 text-xs text-text-secondary">
                {task.assignee}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TaskDragOverlay;
