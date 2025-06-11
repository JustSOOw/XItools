/*
 * 视图切换器组件 - 提供看板、列表、日历视图切换功能
 * 支持快捷键切换和视觉反馈
 */

import React from 'react';
import classNames from 'classnames';
import { ViewType } from '../store/taskStore';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  className,
}) => {
  const viewOptions = [
    {
      id: 'board' as ViewType,
      name: '看板',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      ),
      shortcut: 'B',
    },
    {
      id: 'list' as ViewType,
      name: '列表',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
      shortcut: 'L',
    },
    {
      id: 'calendar' as ViewType,
      name: '日历',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      shortcut: 'C',
    },
  ];

  // 处理键盘快捷键
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否按下了 Ctrl/Cmd + Shift + 快捷键
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        const key = event.key.toUpperCase();
        const viewOption = viewOptions.find(option => option.shortcut === key);
        if (viewOption) {
          event.preventDefault();
          onViewChange(viewOption.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onViewChange]);

  return (
    <div className={classNames('flex items-center bg-surface border border-border rounded-lg p-1', className)}>
      {viewOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onViewChange(option.id)}
          className={classNames(
            'flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200',
            {
              'bg-primary text-white shadow-sm': currentView === option.id,
              'text-text-secondary hover:text-text-primary hover:bg-background': currentView !== option.id,
            }
          )}
          title={`切换到${option.name}视图 (Ctrl+Shift+${option.shortcut})`}
        >
          {option.icon}
          <span>{option.name}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
