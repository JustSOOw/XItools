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
  onSort?: (sortOption: string) => void; // 新增：排序回调
  isDeletable?: boolean;
  isEditable?: boolean;
  dragHandleProps?: any;
  isDraggingTask?: boolean; // 新增：是否正在拖拽任务
  color?: string; // 列的背景颜色
  sortOption?: string; // 新增：当前排序方式
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
  onSort,
  isDeletable = true,
  isEditable = true,
  dragHandleProps,
  isDraggingTask = false,
  color,
  sortOption = 'manual',
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'column',
      columnId: id,
    },
  });

  // 排序选项定义 - 精简为最常用的几种
  const sortOptions = [
    { value: 'manual', label: '手动排序', icon: '🔧', desc: '通过拖拽自定义顺序' },
    { value: 'priority', label: '按优先级', icon: '⭐', desc: '高优先级在前' },
    { value: 'created_desc', label: '按创建时间', icon: '🆕', desc: '最新创建在前' },
    { value: 'title_asc', label: '按标题排序', icon: '🔤', desc: '按字母顺序排列' },
  ];

  // 更多按钮菜单项 - 简化菜单
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
      id: 'sort-tasks',
      label: '任务排序',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      ),
      onClick: () => {
        setShowSortMenu(true);
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
        minHeight: '120px', // 最小高度
        maxHeight: 'calc(100vh - 240px)', // 精确调整最大高度以匹配看板背景
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
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-1.5" style={{
          scrollbarWidth: 'none', /* Firefox隐藏滚动条 */
          msOverflowStyle: 'none' /* IE隐藏滚动条 */
        }}>
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

      {/* 排序选择器弹窗 */}
      {showSortMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80 max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                任务排序
              </h3>
              <button
                onClick={() => setShowSortMenu(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (onSort) {
                      onSort(option.value);
                    }
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    sortOption === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {option.desc}
                        </div>
                      </div>
                    </div>
                    {sortOption === option.value && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroppableColumn;
