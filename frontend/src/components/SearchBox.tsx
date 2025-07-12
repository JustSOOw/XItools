/*
 * 搜索框组件 - 提供任务搜索功能
 * 支持实时搜索和清空功能
 */

import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  onSearch: (searchText: string) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
  debounceMs?: number; // 防抖延迟时间，默认300ms
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value = '',
  placeholder = '搜索任务...',
  onSearch,
  onClear,
  className,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 当外部value变化时同步本地值（比如清空操作）
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的防抖定时器
    timeoutRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={classNames('relative', className)}>
      <div className="relative">
        {/* 搜索图标 */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* 搜索输入框 */}
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={classNames(
            'w-full pl-10 pr-10 py-2 text-sm',
            'border border-border rounded-lg',
            'bg-surface text-text-primary placeholder-text-secondary',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'transition-colors duration-200',
            {
              'opacity-50 cursor-not-allowed': disabled,
              'hover:border-primary/30': !disabled,
            },
          )}
        />

        {/* 清空按钮 */}
        {localValue && (
          <button
            onClick={handleClear}
            disabled={disabled}
            className={classNames(
              'absolute inset-y-0 right-0 pr-3 flex items-center',
              'text-text-secondary hover:text-text-primary',
              'transition-colors duration-200',
              {
                'cursor-not-allowed': disabled,
              },
            )}
            title="清空搜索"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
