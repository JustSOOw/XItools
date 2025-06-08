import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

export interface MoreMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean; // 危险操作，如删除
}

interface MoreButtonProps {
  items: MoreMenuItem[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

const MoreButton: React.FC<MoreButtonProps> = ({
  items,
  className,
  size = 'sm',
  placement = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: MoreMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const buttonSizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const dropdownPlacementClasses = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1',
  };

  return (
    <div className="relative">
      {/* 更多按钮 */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          'rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          buttonSizeClasses[size],
          className
        )}
        title="更多操作"
      >
        <svg
          className={classNames('text-current', iconSizeClasses[size])}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={classNames(
            'absolute z-50 min-w-48 bg-surface border border-border rounded-lg shadow-lg py-1',
            'animate-in fade-in-0 zoom-in-95 duration-100',
            dropdownPlacementClasses[placement]
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={classNames(
                'w-full px-3 py-2 text-left text-sm flex items-center space-x-2 transition-colors',
                {
                  'text-text-primary hover:bg-black/5 dark:hover:bg-white/5': !item.danger && !item.disabled,
                  'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20': item.danger && !item.disabled,
                  'text-text-secondary cursor-not-allowed opacity-50': item.disabled,
                }
              )}
            >
              {item.icon && (
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoreButton;
