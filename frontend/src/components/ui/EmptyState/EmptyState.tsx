/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\ui\EmptyState\EmptyState.tsx
 * @Description: 空状态组件 - 为各种空状态提供引导性的用户体验
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import classNames from 'classnames';
import Button from '../../Button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  actions?: EmptyStateAction[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 空状态组件
 * 提供友好的空状态展示，包含插画、描述和操作引导
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  illustration,
  actions = [],
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-12 h-12 mb-3',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-2',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-16 h-16 mb-4',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-3',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-20 h-20 mb-6',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-4',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={classNames(
      'flex flex-col items-center justify-center text-center',
      classes.container,
      className
    )}>
      {/* 插画或图标 */}
      {illustration ? (
        <div className="mb-6">
          {illustration}
        </div>
      ) : icon ? (
        <div className={classNames(
          'flex items-center justify-center rounded-full bg-surface border border-border/30',
          classes.icon
        )}>
          {icon}
        </div>
      ) : null}

      {/* 内容区域 */}
      <div className={classes.spacing}>
        {/* 标题 */}
        <h3 className={classNames(
          'font-semibold text-text-primary',
          classes.title
        )}>
          {title}
        </h3>

        {/* 描述 */}
        {description && (
          <p className={classNames(
            'text-text-secondary max-w-md',
            classes.description
          )}>
            {description}
          </p>
        )}

        {/* 操作按钮 */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                className="min-w-32"
              >
                {action.icon && (
                  <span className="mr-2">{action.icon}</span>
                )}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
