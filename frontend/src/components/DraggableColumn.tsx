import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DroppableColumn from './DroppableColumn';
import ColumnPlaceholder from './ColumnPlaceholder';
import { BoardColumn } from '../store/taskStore';

interface DraggableColumnProps {
  column: BoardColumn;
  taskIds: string[];
  children: React.ReactNode;
  onAddCard?: () => void;
  onTitleEdit?: (newTitle: string) => void;
  onDelete?: () => void;
  onColorChange?: (color: string) => void;
  isDeletable?: boolean;
  isEditable?: boolean;
  isDragging?: boolean;
  isDraggingTask?: boolean; // 新增：是否正在拖拽任务
}

const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column,
  taskIds,
  children,
  onAddCard,
  onTitleEdit,
  onDelete,
  onColorChange,
  isDeletable = true,
  isEditable = true,
  isDragging = false,
  isDraggingTask = false,
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
    transition,
  };

  // 如果正在被拖拽，显示占位符
  if (isSortableDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="transition-all duration-200 ease-in-out"
      >
        <ColumnPlaceholder />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        transition-all duration-200 ease-in-out
        ${isDragging ? 'opacity-60' : ''}
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
        isDeletable={isDeletable}
        isEditable={isEditable}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDraggingTask={isDraggingTask}
        color={column.color}
      >
        {children}
      </DroppableColumn>
    </div>
  );
};

export default DraggableColumn;
