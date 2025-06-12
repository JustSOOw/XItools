/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 20:05:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 20:05:00
 * @FilePath: \XItools\frontend\src\components\ui\Loading\SkeletonList.tsx
 * @Description: 列表视图骨架屏组件 - 用于列表视图加载时的占位显示
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import classNames from 'classnames';

interface SkeletonListProps {
  rows?: number;
  className?: string;
  showHeader?: boolean;
  animate?: boolean;
}

/**
 * 列表视图骨架屏组件
 * 模拟表格布局，提供列表视图加载时的占位显示
 */
const SkeletonList: React.FC<SkeletonListProps> = ({
  rows = 5,
  className = '',
  showHeader = true,
  animate = true,
}) => {
  const animateClasses = animate ? 'animate-pulse' : '';

  return (
    <div className={classNames('modern-container', animateClasses, className)}>
      {/* 表头骨架 */}
      {showHeader && (
        <div className="border-b border-border/30 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <div className="h-4 bg-text-secondary/20 rounded-md w-16"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-text-secondary/20 rounded-md w-12"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-text-secondary/20 rounded-md w-14"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-text-secondary/20 rounded-md w-12"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-text-secondary/20 rounded-md w-16"></div>
            </div>
          </div>
        </div>
      )}

      {/* 表格内容骨架 */}
      <div className="divide-y divide-border/20">
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonListRow key={index} isEven={index % 2 === 0} />
        ))}
      </div>
    </div>
  );
};

/**
 * 单行骨架组件
 */
const SkeletonListRow: React.FC<{ isEven: boolean }> = ({ isEven }) => {
  return (
    <div className={classNames(
      'p-4 hover:bg-surface/50 transition-colors',
      isEven ? 'bg-surface/20' : 'bg-transparent'
    )}>
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* 任务标题列 */}
        <div className="col-span-4">
          <div className="h-4 bg-text-secondary/20 rounded-md w-3/4 mb-1"></div>
          <div className="h-3 bg-text-secondary/15 rounded-md w-1/2"></div>
        </div>

        {/* 状态列 */}
        <div className="col-span-2">
          <div className="h-6 bg-text-secondary/20 rounded-full w-16"></div>
        </div>

        {/* 优先级列 */}
        <div className="col-span-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-text-secondary/20 rounded-full mr-2"></div>
            <div className="h-3 bg-text-secondary/15 rounded-md w-8"></div>
          </div>
        </div>

        {/* 负责人列 */}
        <div className="col-span-2">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-text-secondary/20 rounded-full mr-2"></div>
            <div className="h-3 bg-text-secondary/15 rounded-md w-12"></div>
          </div>
        </div>

        {/* 截止日期列 */}
        <div className="col-span-2">
          <div className="h-3 bg-text-secondary/15 rounded-md w-20"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * 紧凑型列表骨架 - 用于侧边栏或小空间
 */
export const SkeletonListCompact: React.FC<{
  rows?: number;
  className?: string;
}> = ({ rows = 3, className = '' }) => {
  return (
    <div className={classNames('space-y-2 animate-pulse', className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center space-x-3 p-2">
          <div className="w-4 h-4 bg-text-secondary/20 rounded"></div>
          <div className="flex-1">
            <div className="h-3 bg-text-secondary/20 rounded-md w-3/4 mb-1"></div>
            <div className="h-2 bg-text-secondary/15 rounded-md w-1/2"></div>
          </div>
          <div className="w-12 h-5 bg-text-secondary/15 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonList;
