import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import Portal from './Portal';
import { useI18n } from '../hooks/useI18n';

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
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
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
        setButtonRect(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setButtonRect(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /**
   * 处理菜单项点击事件
   * @param item 被点击的菜单项
   */
  const handleItemClick = (item: MoreMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  /**
   * 处理更多按钮点击事件
   * 计算按钮位置并切换菜单显示状态
   */
  const handleButtonClick = () => {
    if (!isOpen && buttonRef.current) {
      // 获取按钮的位置信息，用于Portal菜单定位
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
    setIsOpen(!isOpen);
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

  // 注意：由于使用Portal渲染，不再需要CSS类来控制位置
  // 位置完全通过JavaScript计算的绝对坐标控制

  /**
   * 计算Portal菜单的绝对位置样式
   * 根据按钮位置、菜单尺寸和视口边界智能计算菜单的最佳显示位置
   * @returns CSS样式对象，包含position、left、top、zIndex等属性
   */
  const getPortalMenuStyle = (): React.CSSProperties => {
    if (!buttonRect) return {};

    const menuWidth = 192; // min-w-48 = 12rem = 192px
    const menuHeight = items.length * 40 + 8; // 估算菜单高度：每项40px + 8px padding

    let left = buttonRect.left;
    let top = buttonRect.bottom + 4; // 默认显示在按钮下方，间距4px

    // 根据placement属性调整菜单位置
    switch (placement) {
      case 'bottom-right':
        left = buttonRect.right - menuWidth; // 右对齐
        break;
      case 'top-left':
        top = buttonRect.top - menuHeight - 4; // 显示在按钮上方
        break;
      case 'top-right':
        left = buttonRect.right - menuWidth; // 右对齐
        top = buttonRect.top - menuHeight - 4; // 显示在按钮上方
        break;
      default: // bottom-left
        // 使用默认位置
        break;
    }

    // 视口边界检测和自动调整，确保菜单完全可见
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 水平方向边界检测
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 8; // 右边界调整
    }
    if (left < 8) {
      left = 8; // 左边界调整
    }

    // 垂直方向边界检测
    if (top + menuHeight > viewportHeight) {
      top = buttonRect.top - menuHeight - 4; // 超出底部时显示在按钮上方
    }
    if (top < 8) {
      top = buttonRect.bottom + 4; // 超出顶部时显示在按钮下方
    }

    return {
      position: 'fixed', // 固定定位，相对于视口
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 9999, // 最高层级，确保不被遮挡
    };
  };

  return (
    <div className="relative">
      {/* 更多按钮 */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={classNames(
          'rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          buttonSizeClasses[size],
          className,
        )}
        title={t('common:actions.more')}
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

      {/* 下拉菜单 - 使用Portal渲染到body */}
      {isOpen && buttonRect && (
        <Portal>
          <div
            ref={dropdownRef}
            className="min-w-48 bg-surface border border-border rounded-lg shadow-xl py-1 dropdown-menu animate-in fade-in-0 zoom-in-95 duration-100"
            style={getPortalMenuStyle()}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={classNames(
                  'w-full px-3 py-2 text-left text-sm flex items-center space-x-2 transition-colors',
                  {
                    'text-text-primary hover:bg-black/5 dark:hover:bg-white/5':
                      !item.danger && !item.disabled,
                    'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20':
                      item.danger && !item.disabled,
                    'text-text-secondary cursor-not-allowed opacity-50': item.disabled,
                  },
                )}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
};

export default MoreButton;
