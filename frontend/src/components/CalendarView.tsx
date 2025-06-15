/*
 * 日历视图组件 - 以日历形式展示任务
 * 参考Todoist、Asana等应用的日历视图设计
 * 支持月视图和周视图，任务按截止日期显示
 */

import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { Task } from '../types/Task';
import { BoardColumn } from '../store/taskStore';
import SmartEmptyState from './SmartEmptyState';
import { useI18n } from '../hooks/useI18n';

interface CalendarViewProps {
  tasks: Task[];
  columns: BoardColumn[];
  onTaskClick: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask?: () => void;
  // 用于智能空状态
  totalTasks?: number;
  hasFilters?: boolean;
  searchTerm?: string;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  className?: string;
}

type CalendarViewType = 'month' | 'week';

// 获取月份的所有日期
const getMonthDates = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);
  
  // 调整到周的开始和结束
  startDate.setDate(startDate.getDate() - startDate.getDay());
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const dates = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

// 获取周的所有日期
const getWeekDates = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + i);
    dates.push(current);
  }
  
  return dates;
};

// 格式化日期为字符串
const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// 检查是否为今天
const isToday = (date: Date) => {
  const today = new Date();
  return formatDateKey(date) === formatDateKey(today);
};

// 检查是否为当前月份
const isCurrentMonth = (date: Date, currentMonth: number) => {
  return date.getMonth() === currentMonth;
};

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  columns,
  onTaskClick,
  onTaskUpdate,
  onCreateTask,
  totalTasks = tasks.length,
  hasFilters = false,
  searchTerm,
  onClearFilters,
  onClearSearch,
  className,
}) => {
  const { t } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 获取列名映射
  const columnMap = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.id] = col.name;
      return acc;
    }, {} as Record<string, string>);
  }, [columns]);

  // 按日期组织任务
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = formatDateKey(new Date(task.dueDate));
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  // 获取要显示的日期
  const displayDates = useMemo(() => {
    if (viewType === 'month') {
      return getMonthDates(currentYear, currentMonth);
    } else {
      return getWeekDates(currentDate);
    }
  }, [currentDate, viewType, currentYear, currentMonth]);

  // 导航到上一个时间段
  const navigatePrevious = () => {
    if (viewType === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  // 导航到下一个时间段
  const navigateNext = () => {
    if (viewType === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  // 导航到今天
  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // 获取当前时间段的标题
  const getTitle = () => {
    if (viewType === 'month') {
      const date = new Date(currentYear, currentMonth, 1);
      return new Intl.DateTimeFormat(t('common:locale'), {
        year: 'numeric',
        month: 'long'
      }).format(date);
    } else {
      const startOfWeek = displayDates[0];
      const endOfWeek = displayDates[6];
      const startFormat = new Intl.DateTimeFormat(t('common:locale'), {
        month: 'short',
        day: 'numeric'
      }).format(startOfWeek);
      const endFormat = new Intl.DateTimeFormat(t('common:locale'), {
        month: 'short',
        day: 'numeric'
      }).format(endOfWeek);
      return `${startFormat} - ${endFormat}`;
    }
  };

  // 渲染任务卡片
  const renderTaskCard = (task: Task) => {
    const priorityColors = {
      'High': 'border-l-red-500 bg-red-50',
      'Medium': 'border-l-yellow-500 bg-yellow-50',
      'Low': 'border-l-green-500 bg-green-50',
    };

    return (
      <div
        key={task.id}
        onClick={() => onTaskClick(task.id)}
        className={classNames(
          'p-2 mb-1 rounded text-xs cursor-pointer border-l-4 transition-colors hover:shadow-sm',
          task.priority ? priorityColors[task.priority as keyof typeof priorityColors] : 'border-l-gray-300 bg-gray-50'
        )}
      >
        <div className="font-medium text-text-primary truncate">
          {task.title}
        </div>
        <div className="text-text-secondary text-xs mt-1">
          {columnMap[task.status] || task.status}
        </div>
      </div>
    );
  };

  return (
    <div className={classNames('flex flex-col h-full modern-container', className)}>
      <div className="flex flex-col h-full p-6 min-h-0">
        {/* 日历头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border rounded-t-lg bg-surface flex-shrink-0">
        {/* 左侧：导航和标题 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={navigatePrevious}
              className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-xl font-semibold text-text-primary min-w-[200px] text-center">
              {getTitle()}
            </h2>
            
            <button
              onClick={navigateNext}
              className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            onClick={navigateToday}
            className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-surface transition-colors"
          >
            {t('calendar:navigation.today')}
          </button>
        </div>

        {/* 右侧：视图切换 */}
        <div className="flex items-center space-x-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewType('month')}
              className={classNames(
                'px-3 py-1 text-sm transition-colors',
                viewType === 'month'
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-secondary hover:text-text-primary'
              )}
            >
              {t('calendar:views.month')}
            </button>
            <button
              onClick={() => setViewType('week')}
              className={classNames(
                'px-3 py-1 text-sm transition-colors',
                viewType === 'week'
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-secondary hover:text-text-primary'
              )}
            >
              {t('calendar:views.week')}
            </button>
          </div>
        </div>
      </div>

        {/* 日历内容 */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-b-lg border border-t-0 border-border bg-surface relative">
          <div className="h-full overflow-auto">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 border-b border-border sticky top-0 bg-surface z-10">
            {[
              t('calendar:weekdaysShort.sunday'),
              t('calendar:weekdaysShort.monday'),
              t('calendar:weekdaysShort.tuesday'),
              t('calendar:weekdaysShort.wednesday'),
              t('calendar:weekdaysShort.thursday'),
              t('calendar:weekdaysShort.friday'),
              t('calendar:weekdaysShort.saturday')
            ].map((day, index) => (
              <div
                key={index}
                className="p-3 text-center text-sm font-medium text-text-secondary"
              >
                {day}
              </div>
            ))}
          </div>

            {/* 日期网格 */}
            <div className={classNames(
              'grid grid-cols-7',
              viewType === 'month' ? 'auto-rows-fr' : 'h-full'
            )}>
            {displayDates.map((date, index) => {
              const dateKey = formatDateKey(date);
              const dayTasks = tasksByDate[dateKey] || [];
              const isCurrentMonthDate = viewType === 'month' ? isCurrentMonth(date, currentMonth) : true;
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={classNames(
                    'border-r border-b border-border p-2',
                    viewType === 'month' ? 'min-h-[120px]' : 'h-full',
                    {
                      'bg-surface/30': !isCurrentMonthDate,
                      'bg-primary/5': isTodayDate,
                    }
                  )}
                >
                  {/* 日期标题 */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={classNames(
                        'text-sm font-medium',
                        {
                          'text-text-secondary': !isCurrentMonthDate,
                          'text-text-primary': isCurrentMonthDate && !isTodayDate,
                          'text-primary font-bold': isTodayDate,
                        }
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-xs text-text-secondary">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* 任务列表 */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, viewType === 'month' ? 3 : 10).map(task => renderTaskCard(task))}
                    {dayTasks.length > (viewType === 'month' ? 3 : 10) && (
                      <div className="text-xs text-text-secondary text-center py-1">
                        +{dayTasks.length - (viewType === 'month' ? 3 : 10)} {t('calendar:messages.more')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 无截止日期任务提示 - 改为非阻塞式提示 */}
          {tasks.filter(task => task.dueDate).length === 0 && tasks.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-surface border border-border rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-text-secondary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('calendar:messages.tip')}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {t('calendar:messages.noTasksWithDueDate')}
                    <br />
                    {t('calendar:messages.setDueDateHint')}
                  </p>
                </div>
              </div>
            </div>
          )}

            {/* 完全无任务的空状态 - 添加蒙版遮盖背景日期 */}
            {tasks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <SmartEmptyState
                  totalTasks={totalTasks}
                  displayTasks={tasks.length}
                  hasFilters={hasFilters}
                  searchTerm={searchTerm}
                  onCreateTask={onCreateTask}
                  onClearFilters={onClearFilters}
                  onClearSearch={onClearSearch}
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
