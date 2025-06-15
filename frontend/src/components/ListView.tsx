/*
 * 列表视图组件 - 以表格形式展示任务
 * 参考Asana、ClickUp等应用的列表视图设计
 * 提供紧凑的表格布局，支持排序和批量操作
 */

import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { Task } from '../types/Task';
import { BoardColumn } from '../store/taskStore';
import Button from './Button';
import SmartEmptyState from './SmartEmptyState';
import { useI18n } from '../hooks/useI18n';

interface ListViewProps {
  tasks: Task[];
  columns: BoardColumn[];
  onTaskClick: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskColorChange: (taskId: string, color: string) => void;
  onCreateTask?: () => void;
  // 用于智能空状态
  totalTasks?: number;
  hasFilters?: boolean;
  searchTerm?: string;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  className?: string;
}

// 排序选项
type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// 优先级映射
const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
const priorityLabels = { 'High': '高', 'Medium': '中', 'Low': '低' };
const priorityColors = { 
  'High': 'text-red-600 bg-red-50', 
  'Medium': 'text-yellow-600 bg-yellow-50', 
  'Low': 'text-green-600 bg-green-50' 
};

// 格式化日期函数将移到组件内部

const ListView: React.FC<ListViewProps> = ({
  tasks,
  columns,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onTaskColorChange,
  onCreateTask,
  totalTasks = tasks.length,
  hasFilters = false,
  searchTerm,
  onClearFilters,
  onClearSearch,
  className,
}) => {
  const { t } = useI18n();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(t('common:locale'), {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };



  // 获取列名映射
  const columnMap = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.id] = col.name;
      return acc;
    }, {} as Record<string, string>);
  }, [columns]);

  // 排序任务
  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      const { field, direction } = sortConfig;
      let aValue: any = a[field];
      let bValue: any = b[field];

      // 特殊处理不同字段的排序
      switch (field) {
        case 'priority':
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          aValue = columnMap[a.status] || a.status;
          bValue = columnMap[b.status] || b.status;
          break;
        case 'dueDate':
        case 'createdAt':
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
          break;
        default:
          aValue = aValue || '';
          bValue = bValue || '';
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [tasks, sortConfig, columnMap]);

  // 处理排序
  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(tasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  // 处理单个任务选择
  const handleTaskSelect = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // 处理状态更改
  const handleStatusChange = (taskId: string, newStatus: string) => {
    onTaskUpdate(taskId, { status: newStatus });
  };

  // 处理优先级更改
  const handlePriorityChange = (taskId: string, newPriority: string) => {
    onTaskUpdate(taskId, { priority: newPriority as any });
  };

  // 渲染排序图标
  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return (
        <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  const isAllSelected = tasks.length > 0 && selectedTasks.size === tasks.length;
  const isIndeterminate = selectedTasks.size > 0 && selectedTasks.size < tasks.length;

  return (
    <div className={classNames('flex flex-col h-full modern-container', className)}>
      <div className="flex flex-col h-full p-6 min-h-0">
        {/* 批量操作工具栏 */}
        {selectedTasks.size > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex items-center justify-between flex-shrink-0">
            <span className="text-sm text-primary font-medium">
              {t('task:messages.selectedTasks', { count: selectedTasks.size })}
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedTasks(new Set())}>
                {t('task:actions.cancelSelection')}
              </Button>
              <Button variant="danger" size="sm">
                {t('task:actions.batchDelete')}
              </Button>
            </div>
          </div>
        )}

        {/* 表格容器 */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-border bg-surface">
          <div className="h-full overflow-auto">
            <table className="w-full border-collapse">
            {/* 表头 */}
            <thead className="sticky top-0 bg-surface border-b border-border z-10">
            <tr>
              {/* 选择列 */}
              <th className="w-12 p-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-border focus:ring-primary"
                />
              </th>

              {/* 任务标题 */}
              <th className="p-3 text-left min-w-[300px]">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>{t('task:fields.title')}</span>
                  {renderSortIcon('title')}
                </button>
              </th>

              {/* 状态 */}
              <th className="p-3 text-left w-32">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>{t('task:fields.status')}</span>
                  {renderSortIcon('status')}
                </button>
              </th>

              {/* 优先级 */}
              <th className="p-3 text-left w-24">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>{t('task:fields.priority')}</span>
                  {renderSortIcon('priority')}
                </button>
              </th>

              {/* 负责人 */}
              <th className="p-3 text-left w-32">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>{t('task:fields.assignee')}</span>
                  {renderSortIcon('assignee')}
                </button>
              </th>

              {/* 截止日期 */}
              <th className="p-3 text-left w-32">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-primary hover:text-primary"
                >
                  <span>{t('task:fields.dueDate')}</span>
                  {renderSortIcon('dueDate')}
                </button>
              </th>

              {/* 操作 */}
              <th className="p-3 text-left w-24">
                <span className="text-sm font-medium text-text-primary">{t('common:actions.actions')}</span>
              </th>
            </tr>
          </thead>

          {/* 表体 */}
          <tbody>
            {sortedTasks.map((task) => (
              <tr
                key={task.id}
                className={classNames(
                  'border-b border-border hover:bg-surface/50 transition-colors',
                  {
                    'bg-primary/5': selectedTasks.has(task.id),
                  }
                )}
              >
                {/* 选择框 */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={(e) => handleTaskSelect(task.id, e.target.checked)}
                    className="rounded border-border focus:ring-primary"
                  />
                </td>

                {/* 任务标题 */}
                <td className="p-3">
                  <div
                    className="cursor-pointer"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <div className="font-medium text-text-primary hover:text-primary transition-colors">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-sm text-text-secondary mt-1 line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>

                {/* 状态 */}
                <td className="p-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="text-sm border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {columns.map(column => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* 优先级 */}
                <td className="p-3">
                  {task.priority ? (
                    <select
                      value={task.priority}
                      onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                      className={classNames(
                        'text-xs px-2 py-1 rounded-full border-0 font-medium',
                        priorityColors[task.priority as keyof typeof priorityColors]
                      )}
                    >
                      <option value="High">{t('task:priority.high')}</option>
                      <option value="Medium">{t('task:priority.medium')}</option>
                      <option value="Low">{t('task:priority.low')}</option>
                    </select>
                  ) : (
                    <select
                      value=""
                      onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-border bg-background"
                    >
                      <option value="">{t('task:priority.none')}</option>
                      <option value="High">{t('task:priority.high')}</option>
                      <option value="Medium">{t('task:priority.medium')}</option>
                      <option value="Low">{t('task:priority.low')}</option>
                    </select>
                  )}
                </td>

                {/* 负责人 */}
                <td className="p-3">
                  <span className="text-sm text-text-secondary">
                    {task.assignee || '-'}
                  </span>
                </td>

                {/* 截止日期 */}
                <td className="p-3">
                  <span className="text-sm text-text-secondary">
                    {task.dueDate ? formatDate(task.dueDate) : '-'}
                  </span>
                </td>

                {/* 操作 */}
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onTaskClick(task.id)}
                      className="p-1 text-text-secondary hover:text-primary transition-colors"
                      title={t('common:actions.edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="p-1 text-text-secondary hover:text-red-500 transition-colors"
                      title={t('common:actions.delete')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
            </table>

            {/* 空状态 */}
            {tasks.length === 0 && (
              <div className="py-8">
                <SmartEmptyState
                  totalTasks={totalTasks}
                  displayTasks={tasks.length}
                  hasFilters={hasFilters}
                  searchTerm={searchTerm}
                  onCreateTask={onCreateTask}
                  onClearFilters={onClearFilters}
                  onClearSearch={onClearSearch}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListView;
