import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DroppableColumn from './DroppableColumn';
import { BoardColumn } from '../store/taskStore';

interface DraggableColumnProps {
  column: BoardColumn;
  taskIds: string[];
  children: React.ReactNode;
  onAddCard?: () => void;
  onTitleEdit?: (newTitle: string) => void;
  onDelete?: () => void;
  onColorChange?: (color: string) => void;
  onSort?: (sortOption: string) => void; // 新增：排序回调
  isDeletable?: boolean;
  isEditable?: boolean;
  isDragging?: boolean;
  isDraggingTask?: boolean; // 新增：是否正在拖拽任务
  isColumnDragging?: boolean; // 新增：是否有列正在拖拽
}

const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column,
  taskIds,
  children,
  onAddCard,
  onTitleEdit,
  onDelete,
  onColorChange,
  onSort,
  isDeletable = true,
  isEditable = true,
  isDragging = false,
  isDraggingTask = false,
  isColumnDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isColumnDragging ? 'transform 200ms ease-in-out, width 200ms ease-in-out' : transition,
  };

  // 如果正在被拖拽，显示完全透明占位符（保持布局稳定）
  if (isSortableDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-72 min-h-[400px] opacity-0 transition-all duration-200 ease-in-out"
      >
        {/* 完全透明的占位符，保持原有尺寸但不可见 */}
        <div className="w-full h-full rounded-lg border-2 border-dashed border-transparent bg-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        transition-all duration-200 ease-in-out
        ${isDragging ? 'opacity-60 scale-105 rotate-2' : ''}
        ${isColumnDragging && !isDragging ? 'scale-95' : ''}
      `}
    >
      <DroppableColumn
        id={column.id}
        title={column.name}
        count={taskIds.length}
        taskIds={taskIds}
        onAddCard={onAddCard}
        onTitleEdit={onTitleEdit}
        onDelete={onDelete}
        onColorChange={onColorChange}
        onSort={onSort}
        isDeletable={isDeletable}
        isEditable={isEditable}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDraggingTask={isDraggingTask}
        color={column.color}
        sortOption={column.sortOption}
      >
        {children}
      </DroppableColumn>
    </div>
  );
};

export default DraggableColumn;
