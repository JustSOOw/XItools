/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:30:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:30:00
 * @FilePath: \XItools\frontend\src\components\SmartEmptyState.tsx
 * @Description: 智能空状态组件 - 根据不同情况显示相应的空状态
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React from 'react';
import { EmptyTasks, EmptySearchResults, EmptyFilterResults } from './ui/EmptyState';

interface SmartEmptyStateProps {
  totalTasks: number;
  displayTasks: number;
  hasFilters: boolean;
  searchTerm?: string;
  onCreateTask?: () => void;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 智能空状态组件
 * 根据任务数量、筛选条件等自动选择合适的空状态显示
 */
const SmartEmptyState: React.FC<SmartEmptyStateProps> = ({
  totalTasks,
  displayTasks,
  hasFilters,
  searchTerm,
  onCreateTask,
  onClearFilters,
  onClearSearch,
  size = 'md',
  className,
}) => {
  // 如果完全没有任务，显示创建任务的空状态
  if (totalTasks === 0) {
    return <EmptyTasks onAction={onCreateTask} size={size} className={className} />;
  }

  // 如果有任务但搜索无结果
  if (displayTasks === 0 && searchTerm) {
    return (
      <EmptySearchResults
        searchTerm={searchTerm}
        onAction={onClearSearch}
        size={size}
        className={className}
      />
    );
  }

  // 如果有任务但筛选无结果
  if (displayTasks === 0 && hasFilters) {
    return <EmptyFilterResults onAction={onClearFilters} size={size} className={className} />;
  }

  // 如果有任务但显示为空（其他情况）
  if (displayTasks === 0) {
    return <EmptyTasks onAction={onCreateTask} size={size} className={className} />;
  }

  // 如果有任务显示，则不显示空状态
  return null;
};

export default SmartEmptyState;
