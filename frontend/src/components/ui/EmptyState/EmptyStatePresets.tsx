/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:05:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:05:00
 * @FilePath: \XItools\frontend\src\components\ui\EmptyState\EmptyStatePresets.tsx
 * @Description: 预设的空状态组件 - 常用场景的空状态组件
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React from 'react';
import EmptyState, { EmptyStateAction } from './EmptyState';
import { useI18n } from '../../../hooks/useI18n';

// 空状态图标组件
const TasksIcon = () => (
  <svg
    className="w-8 h-8 text-text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-8 h-8 text-text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const NetworkIcon = () => (
  <svg
    className="w-8 h-8 text-text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-8 h-8 text-text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    className="w-8 h-8 text-text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
    />
  </svg>
);

// 预设组件接口
interface PresetEmptyStateProps {
  onAction?: () => void;
  secondaryAction?: EmptyStateAction;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 无任务空状态
 */
export const EmptyTasks: React.FC<PresetEmptyStateProps> = ({
  onAction,
  secondaryAction,
  size = 'md',
  className,
}) => {
  const { t } = useI18n();
  const actions: EmptyStateAction[] = [];

  if (onAction) {
    actions.push({
      label: t('task:actions.createFirst'),
      onClick: onAction,
      variant: 'primary',
      icon: <span className="text-lg">+</span>,
    });
  }

  if (secondaryAction) {
    actions.push(secondaryAction);
  }

  return (
    <EmptyState
      icon={<TasksIcon />}
      title={t('task:messages.noTasks')}
      description={t('task:messages.noTasksDescription')}
      actions={actions}
      size={size}
      className={className}
    />
  );
};

/**
 * 搜索无结果空状态
 */
export const EmptySearchResults: React.FC<PresetEmptyStateProps & { searchTerm?: string }> = ({
  searchTerm,
  onAction,
  size = 'md',
  className,
}) => {
  const { t } = useI18n();
  const actions: EmptyStateAction[] = [];

  if (onAction) {
    actions.push({
      label: t('common:actions.clearSearch'),
      onClick: onAction,
      variant: 'secondary',
    });
  }

  return (
    <EmptyState
      icon={<SearchIcon />}
      title={t('common:messages.noResults')}
      description={
        searchTerm
          ? t('task:messages.noSearchResults', { searchTerm })
          : t('task:messages.noFilterResults')
      }
      actions={actions}
      size={size}
      className={className}
    />
  );
};

/**
 * 网络连接错误空状态
 */
export const EmptyNetworkError: React.FC<PresetEmptyStateProps> = ({
  onAction,
  size = 'md',
  className,
}) => {
  const { t } = useI18n();
  const actions: EmptyStateAction[] = [];

  if (onAction) {
    actions.push({
      label: t('common:actions.reconnect'),
      onClick: onAction,
      variant: 'primary',
    });
  }

  return (
    <EmptyState
      icon={<NetworkIcon />}
      title={t('error:networkError')}
      description={t('common:messages.noConnection')}
      actions={actions}
      size={size}
      className={className}
    />
  );
};

/**
 * 日历无事件空状态
 */
export const EmptyCalendar: React.FC<PresetEmptyStateProps> = ({
  onAction,
  size = 'md',
  className,
}) => {
  const { t } = useI18n();
  const actions: EmptyStateAction[] = [];

  if (onAction) {
    actions.push({
      label: t('task:actions.create'),
      onClick: onAction,
      variant: 'primary',
    });
  }

  return (
    <EmptyState
      icon={<CalendarIcon />}
      title={t('calendar:messages.noTasksInPeriod')}
      description={t('calendar:messages.noTasksInPeriodDescription')}
      actions={actions}
      size={size}
      className={className}
    />
  );
};

/**
 * 筛选无结果空状态
 */
export const EmptyFilterResults: React.FC<PresetEmptyStateProps> = ({
  onAction,
  size = 'md',
  className,
}) => {
  const { t } = useI18n();
  const actions: EmptyStateAction[] = [];

  if (onAction) {
    actions.push({
      label: t('common:actions.clearFilters'),
      onClick: onAction,
      variant: 'secondary',
    });
  }

  return (
    <EmptyState
      icon={<FilterIcon />}
      title={t('task:messages.noFilterResults')}
      description={t('task:messages.noFilterResultsDescription')}
      actions={actions}
      size={size}
      className={className}
    />
  );
};

/**
 * 列为空状态
 */
export const EmptyColumn: React.FC<PresetEmptyStateProps> = ({
  onAction,
  size = 'sm',
  className,
}) => {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={<TasksIcon />}
      title={t('task:messages.noTasksInColumn')}
      description={t('task:messages.noTasksInColumnDescription')}
      size={size}
      className={className}
    />
  );
};
