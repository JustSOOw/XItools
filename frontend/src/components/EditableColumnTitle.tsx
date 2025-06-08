import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

interface EditableColumnTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  onCancel?: () => void;
  className?: string;
  maxLength?: number;
  disabled?: boolean;
}

const EditableColumnTitle: React.FC<EditableColumnTitleProps> = ({
  title,
  onSave,
  onCancel,
  className,
  maxLength = 50,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当title prop变化时，更新editValue
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  // 进入编辑模式时聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
      setError(null);
    }
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    
    // 验证输入
    if (!trimmedValue) {
      setError('列名不能为空');
      return;
    }
    
    if (trimmedValue.length > maxLength) {
      setError(`列名不能超过${maxLength}个字符`);
      return;
    }
    
    // 如果值没有变化，直接取消编辑
    if (trimmedValue === title) {
      handleCancel();
      return;
    }
    
    try {
      onSave(trimmedValue);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError('保存失败，请重试');
    }
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
    setError(null);
    onCancel?.();
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

  const handleBlur = () => {
    // 延迟处理blur事件，以便点击保存按钮时不会立即触发
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (error) {
      setError(null);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={classNames(
              'px-2 py-1 text-sm border rounded',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'bg-surface text-text-primary border-border',
              {
                'border-red-500 focus:ring-red-500': error,
              }
            )}
            maxLength={maxLength}
            placeholder="输入列名..."
          />
          <div className="flex space-x-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
              title="保存 (Enter)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="取消 (Esc)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-1 text-xs text-red-600">
            {error}
          </div>
        )}
        <div className="mt-1 text-xs text-text-secondary">
          双击编辑 • Enter保存 • Esc取消
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'cursor-pointer select-none transition-colors',
        'hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 py-0.5',
        {
          'cursor-not-allowed opacity-50': disabled,
        },
        className
      )}
      onDoubleClick={handleDoubleClick}
      title={disabled ? '此列不可编辑' : '双击编辑列名'}
    >
      {title}
    </div>
  );
};

export default EditableColumnTitle;
