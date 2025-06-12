/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 20:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 20:00:00
 * @FilePath: \XItools\frontend\src\components\ui\Loading\SkeletonCard.tsx
 * @Description: 任务卡片骨架屏组件 - 用于任务卡片加载时的占位显示
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import classNames from 'classnames';

interface SkeletonCardProps {
  className?: string;
  showPriority?: boolean;
  showTags?: boolean;
  showDueDate?: boolean;
  animate?: boolean;
}

/**
 * 任务卡片骨架屏组件
 * 模拟真实任务卡片的布局结构，提供加载时的占位显示
 */
const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showPriority = true,
  showTags = true,
  showDueDate = true,
  animate = true,
}) => {
  const baseClasses = 'bg-surface rounded-card p-3 border border-border/30';
  const animateClasses = animate ? 'animate-pulse' : '';

  return (
    <div className={classNames(baseClasses, animateClasses, className)}>
      {/* 卡片头部 - 标题区域 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* 任务标题骨架 */}
          <div className="h-4 bg-text-secondary/20 rounded-md w-3/4 mb-2"></div>
          <div className="h-3 bg-text-secondary/15 rounded-md w-1/2"></div>
        </div>
        
        {/* 更多按钮骨架 */}
        <div className="w-6 h-6 bg-text-secondary/20 rounded-full ml-2"></div>
      </div>

      {/* 描述区域骨架 */}
      <div className="mb-3">
        <div className="h-3 bg-text-secondary/15 rounded-md w-full mb-1"></div>
        <div className="h-3 bg-text-secondary/15 rounded-md w-4/5"></div>
      </div>

      {/* 优先级指示器骨架 */}
      {showPriority && (
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 bg-text-secondary/20 rounded-full mr-2"></div>
          <div className="h-3 bg-text-secondary/15 rounded-md w-12"></div>
        </div>
      )}

      {/* 标签区域骨架 */}
      {showTags && (
        <div className="flex flex-wrap gap-1 mb-2">
          <div className="h-5 bg-text-secondary/15 rounded-full w-12"></div>
          <div className="h-5 bg-text-secondary/15 rounded-full w-16"></div>
        </div>
      )}

      {/* 底部信息骨架 */}
      <div className="flex items-center justify-between text-xs">
        {/* 创建时间骨架 */}
        <div className="h-3 bg-text-secondary/15 rounded-md w-20"></div>
        
        {/* 截止日期骨架 */}
        {showDueDate && (
          <div className="h-3 bg-text-secondary/15 rounded-md w-16"></div>
        )}
      </div>
    </div>
  );
};

/**
 * 多个骨架卡片组件 - 用于列表加载
 */
export const SkeletonCardList: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 3, className = '' }) => {
  return (
    <div className={classNames('space-y-3', className)}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard 
          key={index} 
          animate={true}
          showPriority={Math.random() > 0.3}
          showTags={Math.random() > 0.4}
          showDueDate={Math.random() > 0.5}
        />
      ))}
    </div>
  );
};

export default SkeletonCard;
