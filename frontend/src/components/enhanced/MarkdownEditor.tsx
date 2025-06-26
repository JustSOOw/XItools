/**
 * Markdown编辑器组件
 * 支持实时预览和编辑模式切换
 */
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = '输入任务描述...',
  className = '',
  minHeight = '120px',
  autoSave = false,
  autoSaveDelay = 2000,
}) => {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialValue, setInitialValue] = useState(value); // 记录初始值
  const [lastSavedValue, setLastSavedValue] = useState(value); // 记录上次保存的值
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // 当value从外部更新时，更新初始值和上次保存的值
  useEffect(() => {
    setInitialValue(value);
    setLastSavedValue(value);
  }, [value]);

  // 自动保存逻辑
  useEffect(() => {
    if (autoSave && onSave && value !== '' && value !== lastSavedValue) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await onSave(value);
          setLastSaved(new Date());
          setLastSavedValue(value); // 更新上次保存的值
        } catch (error) {
          console.error('自动保存失败:', error);
        } finally {
          setIsSaving(false);
        }
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [value, autoSave, onSave, autoSaveDelay, lastSavedValue]);

  const handleManualSave = async () => {
    if (!onSave || value === lastSavedValue) return;

    try {
      setIsSaving(true);
      await onSave(value);
      setLastSaved(new Date());
      setLastSavedValue(value); // 更新上次保存的值
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // 设置光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleManualSave();
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = 
      value.substring(0, start) + 
      before + selectedText + after + 
      value.substring(end);
    
    onChange(newValue);
    
    // 设置光标位置
    setTimeout(() => {
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  const toolbarButtons = [
    { icon: '**B**', title: '粗体', action: () => insertMarkdown('**', '**') },
    { icon: '*I*', title: '斜体', action: () => insertMarkdown('*', '*') },
    { icon: '# H', title: '标题', action: () => insertMarkdown('## ') },
    { icon: '• L', title: '列表', action: () => insertMarkdown('- ') },
    { icon: '[]', title: '链接', action: () => insertMarkdown('[', '](url)') },
    { icon: '``', title: '代码', action: () => insertMarkdown('`', '`') },
  ];

  return (
    <div className={classNames('border border-border rounded-lg overflow-hidden', className)}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-3 py-2 bg-accent/5 border-b border-border">
        <div className="flex items-center space-x-1">
          {/* 模式切换 */}
          <div className="flex rounded-md overflow-hidden border border-border">
            <button
              className={classNames(
                'px-3 py-1 text-xs font-medium transition-colors',
                mode === 'edit' 
                  ? 'bg-primary text-white' 
                  : 'bg-background text-text-secondary hover:text-text-primary'
              )}
              onClick={() => setMode('edit')}
            >
              编辑
            </button>
            <button
              className={classNames(
                'px-3 py-1 text-xs font-medium transition-colors',
                mode === 'preview' 
                  ? 'bg-primary text-white' 
                  : 'bg-background text-text-secondary hover:text-text-primary'
              )}
              onClick={() => setMode('preview')}
            >
              预览
            </button>
            <button
              className={classNames(
                'px-3 py-1 text-xs font-medium transition-colors',
                mode === 'split' 
                  ? 'bg-primary text-white' 
                  : 'bg-background text-text-secondary hover:text-text-primary'
              )}
              onClick={() => setMode('split')}
            >
              分屏
            </button>
          </div>

          {/* 格式化工具 */}
          {mode !== 'preview' && (
            <div className="flex items-center space-x-1 ml-2">
              {toolbarButtons.map((button, index) => (
                <button
                  key={index}
                  className="px-2 py-1 text-xs font-mono bg-background hover:bg-accent/10 rounded border border-border transition-colors"
                  onClick={button.action}
                  title={button.title}
                >
                  {button.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 保存状态 */}
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          {isSaving && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
              <span>保存中...</span>
            </div>
          )}
          {lastSaved && !isSaving && (
            <span>已保存 {lastSaved.toLocaleTimeString()}</span>
          )}
          {onSave && !autoSave && (
            <button
              className="px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              onClick={handleManualSave}
              disabled={isSaving}
            >
              保存
            </button>
          )}
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex" style={{ minHeight }}>
        {/* 编辑区域 */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={classNames('flex-1', mode === 'split' && 'border-r border-border')}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-full p-3 bg-background text-text-primary resize-none focus:outline-none"
              style={{ minHeight }}
            />
          </div>
        )}

        {/* 预览区域 */}
        {(mode === 'preview' || mode === 'split') && (
          <div className="flex-1 p-3 bg-background overflow-y-auto">
            {value ? (
              <ReactMarkdown 
                className="prose prose-sm max-w-none text-text-primary
                  prose-headings:text-text-primary prose-p:text-text-primary
                  prose-strong:text-text-primary prose-em:text-text-primary
                  prose-code:text-text-primary prose-code:bg-accent/10
                  prose-pre:bg-accent/10 prose-pre:text-text-primary
                  prose-blockquote:text-text-secondary prose-blockquote:border-accent
                  prose-ul:text-text-primary prose-ol:text-text-primary
                  prose-li:text-text-primary"
              >
                {value}
              </ReactMarkdown>
            ) : (
              <div className="text-text-secondary italic">
                {placeholder}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 帮助提示 */}
      {mode !== 'preview' && (
        <div className="px-3 py-2 bg-accent/5 border-t border-border text-xs text-text-secondary">
          支持 Markdown 语法 • Ctrl+S 保存 • Tab 缩进
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
