/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 20:10:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 20:10:00
 * @FilePath: \XItools\frontend\src\components\ui\Loading\SkeletonCalendar.tsx
 * @Description: 日历视图骨架屏组件 - 用于日历视图加载时的占位显示
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import classNames from 'classnames';

interface SkeletonCalendarProps {
  className?: string;
  viewType?: 'month' | 'week';
  animate?: boolean;
}

/**
 * 日历视图骨架屏组件
 * 模拟日历布局，提供日历视图加载时的占位显示
 */
const SkeletonCalendar: React.FC<SkeletonCalendarProps> = ({
  className = '',
  viewType = 'month',
  animate = true,
}) => {
  const animateClasses = animate ? 'animate-pulse' : '';

  return (
    <div className={classNames('modern-container', animateClasses, className)}>
      {/* 日历头部 - 月份导航和视图切换 */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        {/* 左侧导航 */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-text-secondary/20 rounded-md"></div>
          <div className="h-6 bg-text-secondary/20 rounded-md w-32"></div>
          <div className="w-8 h-8 bg-text-secondary/20 rounded-md"></div>
        </div>

        {/* 右侧视图切换 */}
        <div className="flex items-center space-x-2">
          <div className="w-16 h-8 bg-text-secondary/20 rounded-md"></div>
          <div className="w-16 h-8 bg-text-secondary/20 rounded-md"></div>
        </div>
      </div>

      {/* 星期标题行 */}
      <div className="grid grid-cols-7 border-b border-border/20">
        {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
          <div key={index} className="p-3 text-center">
            <div className="h-4 bg-text-secondary/20 rounded-md w-4 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      {viewType === 'month' ? (
        <SkeletonMonthGrid />
      ) : (
        <SkeletonWeekGrid />
      )}
    </div>
  );
};

/**
 * 月视图网格骨架
 */
const SkeletonMonthGrid: React.FC = () => {
  const weeks = 6; // 标准月视图显示6周
  const daysPerWeek = 7;

  return (
    <div className="grid grid-rows-6 flex-1">
      {Array.from({ length: weeks }, (_, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 border-b border-border/10 last:border-b-0">
          {Array.from({ length: daysPerWeek }, (_, dayIndex) => (
            <SkeletonCalendarDay 
              key={dayIndex} 
              hasEvents={Math.random() > 0.6}
              isCurrentMonth={Math.random() > 0.2}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * 周视图网格骨架
 */
const SkeletonWeekGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-7 flex-1">
      {Array.from({ length: 7 }, (_, dayIndex) => (
        <SkeletonCalendarDay 
          key={dayIndex} 
          hasEvents={Math.random() > 0.4}
          isCurrentMonth={true}
          isWeekView={true}
        />
      ))}
    </div>
  );
};

/**
 * 单个日期格子骨架
 */
const SkeletonCalendarDay: React.FC<{
  hasEvents?: boolean;
  isCurrentMonth?: boolean;
  isWeekView?: boolean;
}> = ({ hasEvents = false, isCurrentMonth = true, isWeekView = false }) => {
  const dayHeight = isWeekView ? 'min-h-32' : 'min-h-24';
  const opacity = isCurrentMonth ? 'opacity-100' : 'opacity-50';

  return (
    <div className={classNames(
      'border-r border-border/10 last:border-r-0 p-2',
      dayHeight,
      opacity
    )}>
      {/* 日期数字骨架 */}
      <div className="flex justify-between items-start mb-2">
        <div className="w-6 h-6 bg-text-secondary/20 rounded-full"></div>
        {isWeekView && (
          <div className="w-4 h-4 bg-text-secondary/15 rounded"></div>
        )}
      </div>

      {/* 任务事件骨架 */}
      {hasEvents && (
        <div className="space-y-1">
          <div className="h-4 bg-primary/20 rounded-sm w-full"></div>
          {Math.random() > 0.5 && (
            <div className="h-4 bg-secondary/20 rounded-sm w-3/4"></div>
          )}
          {isWeekView && Math.random() > 0.7 && (
            <div className="h-4 bg-accent/20 rounded-sm w-1/2"></div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 日历侧边栏骨架 - 用于显示当日任务列表
 */
export const SkeletonCalendarSidebar: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={classNames('p-4 animate-pulse', className)}>
      {/* 日期标题 */}
      <div className="mb-4">
        <div className="h-6 bg-text-secondary/20 rounded-md w-32 mb-2"></div>
        <div className="h-4 bg-text-secondary/15 rounded-md w-24"></div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-primary/20 rounded-full mt-1"></div>
            <div className="flex-1">
              <div className="h-4 bg-text-secondary/20 rounded-md w-full mb-1"></div>
              <div className="h-3 bg-text-secondary/15 rounded-md w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonCalendar;
