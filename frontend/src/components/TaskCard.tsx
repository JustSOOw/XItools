import React, { useState } from 'react';
import { Task } from '../types/Task';
import Card from './Card';
import MoreButton, { MoreMenuItem } from './MoreButton';
import ColorPickerModal from './ColorPickerModal';

interface TaskCardProps {
  task: Task;
  onClick: (taskId: string) => void;
  onColorChange?: (color: string) => void;
  onDelete?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onColorChange,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 更多按钮菜单项
  const moreMenuItems: MoreMenuItem[] = [
    {
      id: 'set-color',
      label: '设置颜色',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      onClick: () => {
        setShowColorPicker(true);
      },
    },
    {
      id: 'delete',
      label: '删除任务',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => setShowDeleteConfirm(true),
      danger: true,
    },
  ];

  // 日期格式化函数
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return null;
    }
  };
  
  // 获取优先级对应的颜色和文本
  const getPriorityInfo = () => {
    switch (task.priority) {
      case 'High':
        return { color: 'text-red-500 bg-red-50 dark:bg-red-900/20', text: '高' };
      case 'Medium':
        return { color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20', text: '中' };
      case 'Low':
        return { color: 'text-green-500 bg-green-50 dark:bg-green-900/20', text: '低' };
      default:
        return { color: 'text-gray-500 bg-gray-50 dark:bg-gray-800/20', text: '普通' };
    }
  };
  
  const { color, text } = getPriorityInfo();
  
  return (
    <>
    <Card
      variant="default"
      className="cursor-pointer transition-all transform hover:shadow-md hover:-translate-y-0.5 relative group"
      isHoverable
      isInteractive
      style={{
        backgroundColor: task.color || undefined,
      }}
    >
      {/* 更多按钮 - 悬停时显示 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <MoreButton
          items={moreMenuItems}
          size="sm"
          placement="bottom-right"
        />
      </div>

      <div
        onClick={() => onClick(task.id)}
        className="w-full"
        data-task-id={task.id}
      >
        {/* 任务标题 */}
        <div className="flex items-center justify-between pr-8">
          <h3 className="font-medium text-text-primary">{task.title}</h3>
          {task.dueDate && (
            <span className="text-xs text-text-secondary">
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        
        {/* 任务描述 (如果有) */}
        {task.description && (
          <p className="mt-2 text-sm text-text-secondary line-clamp-2">
            {task.description}
          </p>
        )}
        
        {/* 底部信息栏 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* 优先级标签 */}
            <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>
              {text}
            </span>
            
            {/* 任务标签 (显示第一个) */}
            {task.tags && task.tags.length > 0 && (
              <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                {task.tags[0]}{task.tags.length > 1 ? ` +${task.tags.length - 1}` : ''}
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
          <div className="mt-2 flex items-center">
            <span className="inline-block w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
              {task.assignee.substring(0, 1).toUpperCase()}
            </span>
            <span className="ml-1 text-xs text-text-secondary">
              {task.assignee}
            </span>
          </div>
        )}

        {/* 删除确认对话框 */}
        {showDeleteConfirm && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <p className="text-red-800 mb-2">确定要删除此任务吗？此操作不可撤销。</p>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
              >
                确定删除
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>

    {/* 颜色选择器模态框 - 移到Card外部以避免z-index问题 */}
    <ColorPickerModal
      currentColor={task.color}
      onColorChange={(newColor) => {
        onColorChange?.(newColor);
        setShowColorPicker(false);
      }}
      onClose={() => setShowColorPicker(false)}
      isOpen={showColorPicker}
      title="设置任务颜色"
    />
  </>
  );
};

export default TaskCard; 