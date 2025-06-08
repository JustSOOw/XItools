import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

interface AddColumnButtonProps {
  onAdd: (name: string) => void;
  className?: string;
  maxLength?: number;
}

const AddColumnButton: React.FC<AddColumnButtonProps> = ({
  onAdd,
  className,
  maxLength = 50,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [columnName, setColumnName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 进入添加模式时聚焦输入框
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleStartAdding = () => {
    setIsAdding(true);
    setColumnName('');
    setError(null);
  };

  const handleSave = () => {
    const trimmedName = columnName.trim();
    
    // 验证输入
    if (!trimmedName) {
      setError('列名不能为空');
      return;
    }
    
    if (trimmedName.length > maxLength) {
      setError(`列名不能超过${maxLength}个字符`);
      return;
    }
    
    try {
      onAdd(trimmedName);
      setIsAdding(false);
      setColumnName('');
      setError(null);
    } catch (error) {
      setError('添加失败，请重试');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setColumnName('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(e.target.value);
    if (error) {
      setError(null);
    }
  };

  if (isAdding) {
    return (
      <div className={classNames(
        'flex flex-col w-72 rounded-lg shadow bg-surface border border-border p-3',
        className
      )}>
        <div className="flex items-center space-x-2 mb-2">
          <input
            ref={inputRef}
            type="text"
            value={columnName}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={classNames(
              'flex-1 px-3 py-2 text-sm border rounded',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'bg-surface text-text-primary border-border',
              {
                'border-red-500 focus:ring-red-500': error,
              }
            )}
            maxLength={maxLength}
            placeholder="输入新列名..."
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={!columnName.trim()}
              className={classNames(
                'px-3 py-1 text-sm rounded transition-colors',
                'bg-primary text-white hover:bg-primary/90',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              添加列
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm rounded transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              取消
            </button>
          </div>
          
          <div className="text-xs text-text-secondary">
            Enter保存 • Esc取消
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-xs text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleStartAdding}
      className={classNames(
        'flex items-center justify-center w-72 h-32 rounded-lg border-2 border-dashed',
        'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5',
        'transition-all duration-200 group',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-2 text-text-secondary group-hover:text-primary">
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
          />
        </svg>
        <span className="text-sm font-medium">添加新列</span>
      </div>
    </button>
  );
};

export default AddColumnButton;
