/*
 * 列表视图组件 - 以表格形式展示任务列表
 * 支持排序、筛选和快速操作
 */

import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { Task } from '../types/Task';
import { BoardColumn } from '../store/taskStore';

interface ListViewProps {
  tasks: Task[];
  columns: BoardColumn[];
  onTaskClick: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskColorChange: (taskId: string, color: string) => void;
  className?: string;
}

type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const ListView: React.FC<ListViewProps> = ({
  tasks,
  columns,
  onTaskClick,
  onTaskDelete,
  onTaskColorChange,
  className,
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 获取状态名称映射
  const statusMap = useMemo(() => {
    return columns.reduce((map, column) => {
      map[column.id] = column.name;
      return map;
    }, {} as Record<string, string>);
  }, [columns]);

  // 排序后的任务列表
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = statusMap[a.status] || a.status;
          bValue = statusMap[b.status] || b.status;
          break;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'assignee':
          aValue = a.assignee || '';
          bValue = b.assignee || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || '').getTime();
          bValue = new Date(b.createdAt || '').getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt || '').getTime();
          bValue = new Date(b.updatedAt || '').getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortField, sortDirection, statusMap]);

  // 处理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 获取优先级显示
  const getPriorityDisplay = (priority?: string) => {
    switch (priority) {
      case 'High':
        return { text: '高', color: 'text-red-600 bg-red-50' };
      case 'Medium':
        return { text: '中', color: 'text-yellow-600 bg-yellow-50' };
      case 'Low':
        return { text: '低', color: 'text-green-600 bg-green-50' };
      default:
        return { text: '-', color: 'text-text-secondary bg-background' };
    }
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染排序图标
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  return (
    <div className={classNames('bg-surface border border-border rounded-lg overflow-hidden', className)}>
      {/* 表格头部 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>标题</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>状态</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface transition-colors"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center space-x-1">
                  <span>优先级</span>
                  {renderSortIcon('priority')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface transition-colors"
                onClick={() => handleSort('assignee')}
              >
                <div className="flex items-center space-x-1">
                  <span>负责人</span>
                  {renderSortIcon('assignee')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>创建时间</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedTasks.map((task) => {
              const priorityDisplay = getPriorityDisplay(task.priority);
              
              return (
                <tr
                  key={task.id}
                  className="hover:bg-background transition-colors cursor-pointer"
                  onClick={() => onTaskClick(task.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {task.color && (
                        <div
                          className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: task.color }}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-text-primary">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {statusMap[task.status] || task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={classNames('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', priorityDisplay.color)}>
                      {priorityDisplay.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">
                    {task.assignee || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(task.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskDelete(task.id);
                        }}
                        className="text-text-secondary hover:text-red-600 transition-colors"
                        title="删除任务"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 空状态 */}
      {sortedTasks.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-text-primary">暂无任务</h3>
          <p className="mt-1 text-sm text-text-secondary">开始创建您的第一个任务吧</p>
        </div>
      )}
    </div>
  );
};

export default ListView;
