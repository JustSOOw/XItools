import React from 'react';

/**
 * 列插入指示器组件
 *
 * 使用与占位符一致的虚线样式，保持视觉协调性
 */

interface ColumnInsertIndicatorProps {
  isVisible: boolean;
  position: 'left' | 'right';
  className?: string;
}

const ColumnInsertIndicator: React.FC<ColumnInsertIndicatorProps> = ({
  isVisible,
  position,
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`
        absolute top-0 bottom-0 w-1 z-50
        border-l-2 border-dashed border-gray-300 dark:border-gray-600
        transition-all duration-200 ease-in-out
        ${position === 'left' ? '-left-1' : '-right-1'}
        ${className}
      `}
    />
  );
};

export default ColumnInsertIndicator;
