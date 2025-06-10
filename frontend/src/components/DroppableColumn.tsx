import React, { ReactNode, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import classNames from 'classnames';
import EditableColumnTitle from './EditableColumnTitle';
import MoreButton, { MoreMenuItem } from './MoreButton';
import ColorPickerModal from './ColorPickerModal';

export interface DroppableColumnProps {
  id: string;
  title: string;
  count?: number;
  children: ReactNode;
  className?: string;
  onAddCard?: () => void;
  taskIds: string[];
  onTitleEdit?: (newTitle: string) => void;
  onDelete?: () => void;
  onColorChange?: (color: string) => void;
  isDeletable?: boolean;
  isEditable?: boolean;
  dragHandleProps?: any;
  isDraggingTask?: boolean; // 新增：是否正在拖拽任务
  color?: string; // 列的背景颜色
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  title,
  count,
  children,
  className,
  onAddCard,
  taskIds,
  onTitleEdit,
  onDelete,
  onColorChange,
  isDeletable = true,
  isEditable = true,
  dragHandleProps,
  isDraggingTask = false,
  color,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'column',
      columnId: id,
    },
  });

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
    ...(isDeletable ? [{
      id: 'delete',
      label: '删除列',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => setShowDeleteConfirm(true),
      danger: true,
    }] : []),
  ];

  return (
    <div
      ref={setNodeRef}
      className={classNames(
        'flex flex-col w-56 rounded-card shadow-sm transition-all duration-200 border border-border/30',
        {
          'ring-2 ring-primary ring-opacity-50': isOver,
          'scale-105': isOver,
        },
        className
      )}
      style={{
        minHeight: '120px',
        background: color || 'var(--color-surface)',
      }}
      data-column-id={id}
    >
      {/* 列标题 */}
      <div className="p-2.5 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center flex-1">
            {/* 拖拽手柄 */}
            {dragHandleProps && (
              <div
                {...dragHandleProps}
                className="mr-2 p-1 cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5 rounded-small transition-colors"
                title="拖拽重排序列"
              >
                <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            )}

            <EditableColumnTitle
              title={title}
              onSave={onTitleEdit || (() => {})}
              disabled={!isEditable}
              className="font-medium text-text-primary"
            />
            {typeof count === 'number' && (
              <span className="ml-2 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                {count}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {onAddCard && (
              <button
                onClick={onAddCard}
                className="p-1 rounded-small hover:bg-black/5 text-text-secondary hover:text-primary transition-colors"
                aria-label="添加任务"
                title="添加任务"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* 更多按钮 */}
            <MoreButton
              items={moreMenuItems}
              size="sm"
              placement="bottom-right"
            />
          </div>
        </div>

        {/* 删除确认对话框 */}
        {showDeleteConfirm && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <p className="text-red-800 mb-2">确定要删除此列吗？此操作不可撤销。</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
              >
                确定删除
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 列内容区 */}
      <div className="flex-1 p-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {/* 移除内部SortableContext，现在由App.tsx中的多容器架构管理 */}
        {/* 如果列为空，显示提示 - 确保有足够的拖拽区域 */}
        {React.Children.count(children) === 0 ? (
          <div
            className={classNames(
              'h-20 border-2 border-dashed rounded-element flex items-center justify-center text-text-secondary text-sm transition-all duration-200',
              {
                'border-primary bg-primary/5': isOver && isDraggingTask,
                'border-gray-200 dark:border-gray-700': !isOver || !isDraggingTask,
              }
            )}
          >
            {isOver && isDraggingTask ? '放置任务到这里' : '暂无任务'}
          </div>
        ) : (
          /* 卡片容器 */
          <div className="space-y-1.5 min-h-full" data-column-cards-container={id}>
            {children}
          </div>
        )}
      </div>

      {/* 颜色选择器模态框 */}
      <ColorPickerModal
        currentColor={color}
        onColorChange={(newColor) => {
          onColorChange?.(newColor);
          setShowColorPicker(false);
        }}
        onClose={() => setShowColorPicker(false)}
        isOpen={showColorPicker}
        title="设置列颜色"
      />
    </div>
  );
};

export default DroppableColumn;
