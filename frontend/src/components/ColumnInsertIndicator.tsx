import React from 'react';

/**
 * 列插入指示器组件
 *
 * 隐藏虚线样式，保持功能性但不显示视觉指示器
 */

interface ColumnInsertIndicatorProps {
  isVisible: boolean;
  position: 'left' | 'right';
  className?: string;
}

const ColumnInsertIndicator: React.FC<ColumnInsertIndicatorProps> = ({
  isVisible,
  position,
  className = '',
}) => {
  // 完全隐藏插入指示器，不显示任何视觉元素
  return null;
};

export default ColumnInsertIndicator;
