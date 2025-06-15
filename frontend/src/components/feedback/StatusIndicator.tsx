/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\feedback\StatusIndicator.tsx
 * @Description: 状态指示器组件 - 提供各种状态的视觉指示
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';

export type StatusType = 'loading' | 'success' | 'error' | 'warning' | 'info' | 'idle';

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showMessage?: boolean;
  className?: string;
  animated?: boolean;
}

/**
 * 状态指示器组件
 * 为不同状态提供统一的视觉指示
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  showIcon = true,
  showMessage = true,
  className = '',
  animated = true,
}) => {
  // 状态配置
  const statusConfig = {
    loading: {
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      icon: '⏳',
      defaultMessage: '加载中...',
    },
    success: {
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      icon: '✅',
      defaultMessage: '操作成功',
    },
    error: {
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/20',
      icon: '❌',
      defaultMessage: '操作失败',
    },
    warning: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      icon: '⚠️',
      defaultMessage: '警告',
    },
    info: {
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      icon: 'ℹ️',
      defaultMessage: '信息',
    },
    idle: {
      color: 'text-text-secondary',
      bgColor: 'bg-surface',
      borderColor: 'border-border',
      icon: '⭕',
      defaultMessage: '就绪',
    },
  };

  // 尺寸配置
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'text-sm',
      spacing: 'space-x-1',
    },
    md: {
      container: 'px-3 py-2 text-sm',
      icon: 'text-base',
      spacing: 'space-x-2',
    },
    lg: {
      container: 'px-4 py-3 text-base',
      icon: 'text-lg',
      spacing: 'space-x-3',
    },
  };

  const config = statusConfig[status];
  const sizeConf = sizeConfig[size];
  const displayMessage = message || config.defaultMessage;

  // 加载动画组件
  const LoadingSpinner = () => (
    <motion.div
      className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full ${config.color}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  // 脉冲动画组件
  const PulseIcon = ({ children }: { children: React.ReactNode }) => (
    <motion.span
      className={sizeConf.icon}
      animate={animated ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.span>
  );

  return (
    <motion.div
      className={classNames(
        'inline-flex items-center rounded-lg border',
        sizeConf.container,
        sizeConf.spacing,
        config.bgColor,
        config.borderColor,
        config.color,
        className
      )}
      initial={animated ? { opacity: 0, scale: 0.9 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.2 }}
    >
      {showIcon && (
        <span className="flex-shrink-0">
          {status === 'loading' ? (
            <LoadingSpinner />
          ) : (
            <PulseIcon>{config.icon}</PulseIcon>
          )}
        </span>
      )}
      
      {showMessage && displayMessage && (
        <span className="font-medium">
          {displayMessage}
        </span>
      )}
    </motion.div>
  );
};

/**
 * 连接状态指示器
 * 专门用于显示连接状态
 */
export const ConnectionStatus: React.FC<{
  isConnected: boolean;
  className?: string;
}> = ({ isConnected, className = '' }) => {
  return (
    <StatusIndicator
      status={isConnected ? 'success' : 'error'}
      message={isConnected ? '已连接' : '连接断开'}
      size="sm"
      className={className}
    />
  );
};

/**
 * 操作状态指示器
 * 用于显示操作的进行状态
 */
export const OperationStatus: React.FC<{
  isLoading: boolean;
  error?: string | null;
  success?: boolean;
  className?: string;
}> = ({ isLoading, error, success, className = '' }) => {
  if (isLoading) {
    return (
      <StatusIndicator
        status="loading"
        message="处理中..."
        size="sm"
        className={className}
      />
    );
  }

  if (error) {
    return (
      <StatusIndicator
        status="error"
        message={error}
        size="sm"
        className={className}
      />
    );
  }

  if (success) {
    return (
      <StatusIndicator
        status="success"
        message="操作成功"
        size="sm"
        className={className}
      />
    );
  }

  return null;
};

/**
 * 任务状态指示器
 * 专门用于显示任务状态
 */
export const TaskStatusIndicator: React.FC<{
  status: string;
  className?: string;
}> = ({ status, className = '' }) => {
  const getStatusType = (status: string): StatusType => {
    switch (status.toLowerCase()) {
      case 'completed':
      case '已完成':
        return 'success';
      case 'in-progress':
      case '进行中':
        return 'info';
      case 'todo':
      case '待办':
        return 'warning';
      default:
        return 'idle';
    }
  };

  return (
    <StatusIndicator
      status={getStatusType(status)}
      message={status}
      size="sm"
      showIcon={false}
      className={className}
    />
  );
};

export default StatusIndicator;
