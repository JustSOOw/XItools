import React, { ReactNode } from 'react';
import classNames from 'classnames';

export interface ColumnProps {
  title: string;
  count?: number;
  children: ReactNode;
  className?: string;
  onAddCard?: () => void;
  id?: string;
  isDropDisabled?: boolean;
}

const Column: React.FC<ColumnProps> = ({
  title,
  count,
  children,
  className,
  onAddCard,
  id,
  isDropDisabled,
}) => {
  return (
    <div
      id={id}
      className={classNames(
        'flex flex-col h-full min-h-[500px] w-72 bg-surface rounded-lg shadow',
        isDropDisabled ? 'opacity-60' : '',
        className
      )}
    >
      {/* 列标题 */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-medium text-text-primary">{title}</h3>
          {typeof count === 'number' && (
            <span className="ml-2 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
              {count}
            </span>
          )}
        </div>
        {onAddCard && (
          <button
            onClick={onAddCard}
            className="p-1 rounded-md hover:bg-black/5 text-text-secondary hover:text-primary transition-colors"
            aria-label="添加任务"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* 列内容区 */}
      <div className="flex-1 p-2 overflow-y-auto space-y-2">
        {children}
      </div>
    </div>
  );
};

export default Column; 