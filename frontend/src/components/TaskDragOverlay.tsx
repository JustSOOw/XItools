import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '../types/Task';

interface TaskDragOverlayProps {
  task: Task;
}

const TaskDragOverlay: React.FC<TaskDragOverlayProps> = ({ task }) => {
  return (
    <div className="transform rotate-3 scale-105 shadow-2xl opacity-95">
      <TaskCard 
        task={task} 
        onClick={() => {}} // 拖拽预览不需要点击事件
      />
    </div>
  );
};

export default TaskDragOverlay;
