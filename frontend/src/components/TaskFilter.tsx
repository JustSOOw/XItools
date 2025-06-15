/*
 * 任务筛选器组件 - 提供多维度任务筛选功能
 * 支持按状态、优先级、负责人、标签等条件筛选
 */

import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { FilterOptions, BoardColumn } from '../store/taskStore';
import { Task } from '../types/Task';
import Button from './Button';
import { useI18n } from '../hooks/useI18n';

interface TaskFilterProps {
  filterOptions: FilterOptions;
  onFilterChange: (options: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
  columns: BoardColumn[];
  tasks: Task[];
  displayTasks: Task[]; // 添加显示任务列表用于统计
  className?: string;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  filterOptions,
  onFilterChange,
  onClearFilters,
  columns,
  tasks,
  displayTasks,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  // 点击外部关闭下拉面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // 获取所有可用的优先级选项
  const priorityOptions = ['High', 'Medium', 'Low'];

  // 获取所有可用的负责人选项
  const assigneeOptions = Array.from(
    new Set(
      tasks
        .map(task => task.assignee)
        .filter(assignee => assignee && assignee.trim())
    )
  ).sort();

  // 检查是否有活动的筛选条件（排除搜索文本）
  const hasActiveFilters = Object.keys(filterOptions).some(key => {
    // 排除搜索文本，只检查筛选器面板中的条件
    if (key === 'searchText') return false;

    const value = filterOptions[key as keyof FilterOptions];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });

  const handlePriorityChange = (priority: string) => {
    onFilterChange({
      priority: priority === filterOptions.priority ? undefined : priority
    });
  };

  const handleAssigneeChange = (assignee: string) => {
    onFilterChange({
      assignee: assignee === filterOptions.assignee ? undefined : assignee
    });
  };

  return (
    <div ref={containerRef} className={classNames('relative', className)}>
      {/* 筛选器按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={classNames(
          'flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-colors',
          {
            'bg-primary text-white border-primary': hasActiveFilters,
            'bg-surface text-text-secondary border-border hover:border-primary/50': !hasActiveFilters,
          }
        )}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
          />
        </svg>
        <span>{t('common:actions.filter')}</span>
        {hasActiveFilters && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-white/20 rounded-full">
            {Object.keys(filterOptions).filter(key => {
              // 排除搜索文本，只计算筛选器面板中的条件
              if (key === 'searchText') return false;

              const value = filterOptions[key as keyof FilterOptions];
              if (Array.isArray(value)) {
                return value.length > 0;
              }
              return value !== undefined && value !== null && value !== '';
            }).length}
          </span>
        )}
        <svg
          className={classNames('h-4 w-4 transition-transform', {
            'rotate-180': isExpanded,
          })}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 筛选器下拉面板 */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            {/* 筛选器头部 */}
            <div className="pb-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">{t('task:filters.title', { defaultValue: '筛选条件' })}</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-xs"
                  >
                    {t('common:actions.clearAll')}
                  </Button>
                )}
              </div>

              {/* 任务统计 */}
              <div className="text-xs text-text-secondary">
                {displayTasks.length !== tasks.length ? (
                  <>{t('task:statistics.showing', {
                    displayed: displayTasks.length,
                    total: tasks.length,
                    defaultValue: `显示 ${displayTasks.length} / ${tasks.length} 个任务`
                  })}</>
                ) : (
                  <>{t('task:statistics.total', {
                    count: tasks.length,
                    defaultValue: `共 ${tasks.length} 个任务`
                  })}</>
                )}
              </div>
            </div>

            {/* 优先级筛选 */}
            <div>
              <label className="block text-xs font-medium text-text-primary mb-2">
                {t('task:fields.priority')}
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map(priority => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityChange(priority)}
                    className={classNames(
                      'px-3 py-1 text-xs rounded-full border transition-colors',
                      {
                        'bg-primary text-white border-primary': filterOptions.priority === priority,
                        'bg-surface text-text-secondary border-border hover:border-primary/50': filterOptions.priority !== priority,
                      }
                    )}
                  >
                    {t(`task:priority.${priority.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* 负责人筛选 */}
            {assigneeOptions.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-text-primary mb-2">
                  {t('task:fields.assignee')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {assigneeOptions.map(assignee => (
                    <button
                      key={assignee}
                      onClick={() => handleAssigneeChange(assignee)}
                      className={classNames(
                        'px-3 py-1 text-xs rounded-full border transition-colors',
                        {
                          'bg-primary text-white border-primary': filterOptions.assignee === assignee,
                          'bg-surface text-text-secondary border-border hover:border-primary/50': filterOptions.assignee !== assignee,
                        }
                      )}
                    >
                      {assignee}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilter;
