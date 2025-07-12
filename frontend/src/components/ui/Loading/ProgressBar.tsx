/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 20:20:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 20:20:00
 * @FilePath: \XItools\frontend\src\components\ui\Loading\ProgressBar.tsx
 * @Description: 进度条组件 - 用于显示操作进度和加载状态
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

interface ProgressBarProps {
  value?: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'striped' | 'animated';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
  indeterminate?: boolean; // 不确定进度的加载条
}

/**
 * 进度条组件
 * 支持确定和不确定进度显示，多种样式和动画效果
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  color = 'primary',
  showLabel = false,
  label,
  className = '',
  indeterminate = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // 平滑动画效果
  useEffect(() => {
    if (!indeterminate) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, indeterminate]);

  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const trackClasses = 'bg-surface border border-border/30 rounded-full overflow-hidden';

  const getBarClasses = () => {
    const baseClasses = classNames(
      'h-full transition-all duration-500 ease-out',
      colorClasses[color],
    );

    switch (variant) {
      case 'gradient':
        return classNames(baseClasses, 'bg-gradient-to-r from-current to-current/80');

      case 'striped':
        return classNames(
          baseClasses,
          'bg-gradient-to-r from-transparent via-white/20 to-transparent',
          'bg-size-[20px_20px] bg-repeat-x',
        );

      case 'animated':
        return classNames(
          baseClasses,
          'bg-gradient-to-r from-current via-current/60 to-current',
          'animate-pulse',
        );

      default:
        return baseClasses;
    }
  };

  const getIndeterminateClasses = () => {
    return classNames(
      'h-full rounded-full',
      colorClasses[color],
      'animate-pulse',
      'bg-gradient-to-r from-transparent via-current to-transparent',
    );
  };

  return (
    <div className={classNames('w-full', className)}>
      {/* 标签 */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-primary">{label || '进度'}</span>
          {!indeterminate && showLabel && (
            <span className="text-sm text-text-secondary">{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      {/* 进度条 */}
      <div className={classNames(trackClasses, sizeClasses[size])}>
        {indeterminate ? (
          <div className={getIndeterminateClasses()} />
        ) : (
          <div className={getBarClasses()} style={{ width: `${percentage}%` }} />
        )}
      </div>
    </div>
  );
};

/**
 * 圆形进度条组件
 */
export const CircularProgress: React.FC<{
  value?: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressBarProps['color'];
  showLabel?: boolean;
  className?: string;
}> = ({
  value = 0,
  size = 40,
  strokeWidth = 4,
  color = 'primary',
  showLabel = false,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    secondary: 'stroke-secondary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500',
  };

  return (
    <div className={classNames('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-border opacity-30"
        />
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={classNames('transition-all duration-500 ease-out', colorClasses[color])}
        />
      </svg>

      {/* 中心标签 */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-text-primary">{Math.round(value)}%</span>
        </div>
      )}
    </div>
  );
};

/**
 * 步骤进度条组件
 */
export const StepProgress: React.FC<{
  steps: string[];
  currentStep: number;
  className?: string;
}> = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={classNames('w-full', className)}>
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* 步骤圆点 */}
            <div className="flex flex-col items-center">
              <div
                className={classNames(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  {
                    'bg-primary text-white': index <= currentStep,
                    'bg-surface border-2 border-border text-text-secondary': index > currentStep,
                  },
                )}
              >
                {index + 1}
              </div>
              <span className="mt-2 text-xs text-center text-text-secondary max-w-20">{step}</span>
            </div>

            {/* 连接线 */}
            {index < steps.length - 1 && (
              <div
                className={classNames('flex-1 h-0.5 mx-4 transition-all duration-300', {
                  'bg-primary': index < currentStep,
                  'bg-border': index >= currentStep,
                })}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
