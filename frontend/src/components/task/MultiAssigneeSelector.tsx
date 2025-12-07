/**
 * 多负责人选择器组件
 * 支持选择多个负责人，并以头像堆叠方式显示
 */

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import TeamAvatar from '../team/TeamAvatar';
import { CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface AssigneeOption {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
}

interface MultiAssigneeSelectorProps {
  assigneeOptions: AssigneeOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

const MultiAssigneeSelector: React.FC<MultiAssigneeSelectorProps> = ({
  assigneeOptions,
  selectedIds,
  onChange,
  isLoading = false,
  disabled = false,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleAssignee = async (assigneeId: string) => {
    if (disabled || isSaving) return;

    const newSelectedIds = selectedIds.includes(assigneeId)
      ? selectedIds.filter(id => id !== assigneeId)
      : [...selectedIds, assigneeId];

    setIsSaving(true);
    try {
      await onChange(newSelectedIds);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAssignee = async (assigneeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isSaving) return;

    const newSelectedIds = selectedIds.filter(id => id !== assigneeId);
    setIsSaving(true);
    try {
      await onChange(newSelectedIds);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedAssignees = assigneeOptions.filter(a => selectedIds.includes(a.id));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 已选择的负责人显示 */}
      <div
        className={`
          min-h-[40px] p-2 border border-border rounded-lg bg-surface
          flex flex-wrap items-center gap-2 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          ${isOpen ? 'border-primary ring-1 ring-primary/20' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedAssignees.length === 0 ? (
          <span className="text-text-tertiary text-sm">
            {t('task:placeholders.assignee', { defaultValue: '未分配' })}
          </span>
        ) : (
          selectedAssignees.map(assignee => (
            <div
              key={assignee.id}
              className="flex items-center gap-1.5 bg-surface-hover rounded-full pl-1 pr-2 py-0.5"
            >
              <TeamAvatar
                name={assignee.username}
                avatarUrl={assignee.avatar || undefined}
                size="sm"
                className="w-5 h-5"
              />
              <span className="text-sm text-text-primary">{assignee.username}</span>
              <button
                onClick={(e) => handleRemoveAssignee(assignee.id, e)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-text-secondary hover:text-red-500 transition-colors"
                disabled={disabled || isSaving}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
        <div className="ml-auto flex items-center gap-1">
          {(isLoading || isSaving) && (
            <svg className="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <ChevronDownIcon className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* 下拉选项列表 */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {assigneeOptions.length === 0 ? (
            <div className="p-3 text-center text-text-secondary text-sm">
              {t('task:assignee.noOptions', { defaultValue: '暂无可选负责人' })}
            </div>
          ) : (
            assigneeOptions.map(assignee => {
              const isSelected = selectedIds.includes(assignee.id);
              return (
                <div
                  key={assignee.id}
                  className={`
                    flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors
                    ${isSelected ? 'bg-primary/10' : 'hover:bg-surface-hover'}
                  `}
                  onClick={() => handleToggleAssignee(assignee.id)}
                >
                  <TeamAvatar
                    name={assignee.username}
                    avatarUrl={assignee.avatar || undefined}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {assignee.username}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {assignee.email}
                    </p>
                  </div>
                  <span className="text-xs text-text-tertiary px-2 py-0.5 bg-surface-hover rounded-full">
                    {assignee.role}
                  </span>
                  {isSelected && (
                    <CheckIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiAssigneeSelector;
