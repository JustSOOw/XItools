/**
 * 内联编辑组件
 * 支持点击即编辑，实时保存功能
 */
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'textarea' | 'select' | 'date' | 'number';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  displayClassName?: string;
  editClassName?: string;
  multiline?: boolean;
  disabled?: boolean;
  required?: boolean;
  validation?: (value: string) => string | null;
}

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  type = 'text',
  placeholder = '点击编辑...',
  options = [],
  className = '',
  displayClassName = '',
  editClassName = '',
  multiline = false,
  disabled = false,
  required = false,
  validation,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  // 开始编辑时聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text' || type === 'textarea') {
        (inputRef.current as HTMLInputElement | HTMLTextAreaElement).select();
      }
    }
  }, [isEditing, type]);

  // 重置编辑值当外部值改变时
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  };

  const handleSave = async () => {
    // 检查值是否真的发生了变化
    if (editValue === value) {
      // 值没有变化，直接退出编辑模式
      setIsEditing(false);
      setError(null);
      return;
    }

    // 验证
    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (required && !editValue.trim()) {
      setError('此字段为必填项');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const renderInput = () => {
    const baseInputClass = classNames(
      'w-full px-2 py-1 border border-border rounded bg-background text-text-primary',
      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
      error && 'border-red-500 focus:ring-red-500/50',
      editClassName
    );

    switch (type) {
      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={classNames(baseInputClass, 'min-h-[80px] resize-vertical')}
            placeholder={placeholder}
            disabled={isSaving}
          />
        );

      case 'select':
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={baseInputClass}
            disabled={isSaving}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="datetime-local"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={baseInputClass}
            disabled={isSaving}
          />
        );

      case 'number':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={baseInputClass}
            placeholder={placeholder}
            disabled={isSaving}
            step="0.5"
            min="0"
          />
        );

      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={baseInputClass}
            placeholder={placeholder}
            disabled={isSaving}
          />
        );
    }
  };

  if (isEditing) {
    return (
      <div className={classNames('relative', className)}>
        {renderInput()}
        {isSaving && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-xs mt-1">{error}</div>
        )}
        <div className="text-xs text-text-secondary mt-1">
          {multiline ? 'Ctrl+Enter 保存，Esc 取消' : 'Enter 保存，Esc 取消'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'cursor-pointer hover:bg-accent/5 rounded px-2 py-1 transition-colors',
        'border border-transparent hover:border-border',
        disabled && 'cursor-not-allowed opacity-50',
        displayClassName,
        className
      )}
      onClick={handleStartEdit}
      title={disabled ? '不可编辑' : '点击编辑'}
    >
      {value || (
        <span className="text-text-secondary italic">{placeholder}</span>
      )}
    </div>
  );
};

export default InlineEdit;
