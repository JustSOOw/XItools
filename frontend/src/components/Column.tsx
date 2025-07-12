import React, { ReactNode } from 'react';
import classNames from 'classnames';

export interface ColumnProps {
  title: string;
  count?: number;
  children: ReactNode;
  className?: string;
  onAddCard?: () => void;
  id?: string;
}

const Column: React.FC<ColumnProps> = ({ title, count, children, className, onAddCard, id }) => {
  // 计算子元素数量
  const childrenCount = React.Children.count(children);

  return (
    <div
      id={id}
      className={classNames(
        'flex flex-col w-56 rounded-lg shadow transition-colors duration-200',
        'bg-surface',
        className,
      )}
      style={{ minHeight: '120px' }}
      data-column-id={id}
    >
      {/* 列标题 */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-medium text-text-primary flex items-center">
            <span>{title}</span>
            {typeof count === 'number' && (
              <span className="ml-2 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                {count}
              </span>
            )}
          </h3>
        </div>
        {onAddCard && (
          <button
            onClick={onAddCard}
            className="p-1 rounded-md hover:bg-black/5 text-text-secondary hover:text-primary transition-colors"
            aria-label="添加任务"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 列内容区 */}
      <div className="flex-1 p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {/* 如果列为空，显示提示 */}
        {React.Children.count(children) === 0 ? (
          <div className="h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-text-secondary text-sm">
            暂无任务
          </div>
        ) : (
          /* 卡片容器 */
          <div className="space-y-2 min-h-full" data-column-cards-container={id}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
