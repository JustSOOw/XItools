import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { Task } from '../types/Task';

interface DraggableTaskCardProps {
  task: Task;
  onClick: (taskId: string) => void;
  isDragging?: boolean;
  onColorChange?: (color: string) => void;
  onDelete?: () => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onClick,
  isDragging = false,
  onColorChange,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        transition-all duration-200 ease-in-out
        ${isSortableDragging ? 'z-50 rotate-3 scale-105' : ''}
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <TaskCard
        task={task}
        onClick={onClick}
        onColorChange={onColorChange}
        onDelete={onDelete}
      />
    </div>
  );
};

export default DraggableTaskCard;
