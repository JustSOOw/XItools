/*
 * 日历视图组件 - 以日历形式展示任务
 * MVP版本：简单的月视图，按创建日期显示任务
 */

import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { Task } from '../types/Task';
import { BoardColumn } from '../store/taskStore';

interface CalendarViewProps {
  tasks: Task[];
  columns: BoardColumn[];
  onTaskClick: (taskId: string) => void;
  className?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  columns,
  onTaskClick,
  className,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取状态名称映射
  const statusMap = useMemo(() => {
    return columns.reduce((map, column) => {
      map[column.id] = column.name;
      return map;
    }, {} as Record<string, string>);
  }, [columns]);

  // 获取当前月份的日期信息
  const monthInfo = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取第一天是星期几（0=周日，1=周一...）
    const firstDayOfWeek = firstDay.getDay();
    
    // 获取当月天数
    const daysInMonth = lastDay.getDate();
    
    // 计算需要显示的日期（包括上月末尾和下月开头）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    const days = [];
    for (let i = 0; i < 42; i++) { // 6周 * 7天
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return {
      year,
      month,
      firstDay,
      lastDay,
      daysInMonth,
      days,
    };
  }, [currentDate]);

  // 按日期分组任务
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      const createdDate = task.createdAt ? new Date(task.createdAt) : new Date();
      const dateKey = createdDate.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    
    return grouped;
  }, [tasks]);

  // 导航到上个月
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 导航到下个月
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 导航到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 获取优先级颜色
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  // 检查是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 检查是否是当前月份
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === monthInfo.month;
  };

  return (
    <div className={classNames('bg-surface border border-border rounded-lg overflow-hidden', className)}>
      {/* 日历头部 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {monthInfo.year}年{monthInfo.month + 1}月
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            今天
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded-md transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded-md transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 border-b border-border">
        {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
          <div
            key={index}
            className="p-3 text-center text-sm font-medium text-text-secondary bg-background"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7">
        {monthInfo.days.map((date, index) => {
          const dateKey = date.toDateString();
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          
          return (
            <div
              key={index}
              className={classNames(
                'min-h-[120px] p-2 border-r border-b border-border',
                {
                  'bg-background': isCurrentMonthDay,
                  'bg-surface': !isCurrentMonthDay,
                }
              )}
            >
              {/* 日期数字 */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={classNames(
                    'text-sm font-medium',
                    {
                      'text-text-primary': isCurrentMonthDay,
                      'text-text-secondary': !isCurrentMonthDay,
                      'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center': isTodayDate,
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
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task.id)}
                    className="flex items-center space-x-2 p-1 rounded text-xs cursor-pointer hover:bg-surface transition-colors"
                    title={task.title}
                  >
                    <div
                      className={classNames(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        getPriorityColor(task.priority)
                      )}
                    />
                    <span className="text-text-primary truncate flex-1">
                      {task.title}
                    </span>
                  </div>
                ))}
                
                {/* 显示更多任务的指示器 */}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-text-secondary text-center py-1">
                    +{dayTasks.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-text-primary">暂无任务</h3>
            <p className="mt-1 text-sm text-text-secondary">开始创建您的第一个任务吧</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
