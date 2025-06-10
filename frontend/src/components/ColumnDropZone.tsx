import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ColumnDropZoneProps {
  id: string;
  position: 'before' | 'after';
  columnId: string;
  isActive: boolean;
  children?: React.ReactNode;
}

const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({
  id,
  position,
  columnId,
  isActive,
  children
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'column-drop-zone',
      position,
      columnId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative transition-all duration-300 ease-in-out
        ${isActive ? 'w-6' : 'w-2'}
        ${isOver ? 'bg-primary/8' : 'bg-transparent'}
        hover:bg-primary/3
      `}
      style={{
        minHeight: '400px',
        zIndex: isOver ? 50 : 20,
      }}
    >
      {children}

      {/* 调试模式：显示拖拽区域边界 - 透明效果 */}
      {process.env.NODE_ENV === 'development' && isActive && (
        <div className="absolute inset-0 border-2 border-dashed border-transparent bg-transparent flex items-center justify-center opacity-0">
          {/* 完全透明的指示器 */}
        </div>
      )}

      {/* 悬停状态提示 - 隐藏文字，保持功能 */}
      {/* {isOver && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs bg-primary text-white px-2 py-1 rounded z-50">
          {position} {columnId.substring(0, 8)}
        </div>
      )} */}
    </div>
  );
};

export default ColumnDropZone;
