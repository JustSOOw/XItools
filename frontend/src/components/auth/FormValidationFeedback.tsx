/*
 * @Author: XItools Team
 * @Date: 2025-07-01 16:30:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 16:30:00
 * @FilePath: \XItools\frontend\src\components\auth\FormValidationFeedback.tsx
 * @Description: 表单验证反馈组件 - 提供优雅的表单验证视觉反馈
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface FormValidationFeedbackProps {
  /** 反馈类型 */
  type: 'success' | 'error' | 'warning' | 'info';
  /** 反馈消息 */
  message: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否显示动画 */
  animated?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 点击关闭回调 */
  onClose?: () => void;
}

export const FormValidationFeedback: React.FC<FormValidationFeedbackProps> = ({
  type,
  message,
  showIcon = true,
  animated = true,
  className = '',
  onClose
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'feedback-success';
      case 'error':
        return 'feedback-error';
      case 'warning':
        return 'feedback-warning';
      case 'info':
        return 'feedback-info';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`
        form-validation-feedback 
        ${getTypeClass()} 
        ${animated ? 'feedback-animated' : ''} 
        ${className}
      `}
    >
      {showIcon && (
        <div className="feedback-icon">
          {getIcon()}
        </div>
      )}
      
      <div className="feedback-content">
        <p className="feedback-message">{message}</p>
      </div>
      
      {onClose && (
        <button
          type="button"
          className="feedback-close"
          onClick={onClose}
          aria-label="关闭"
        >
          <XCircleIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default FormValidationFeedback;
