/*
 * @Author: XItools Team
 * @Date: 2025-07-01 11:15:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 11:15:00
 * @FilePath: \XItools\frontend\src\components\ui\PasswordStrengthIndicator.tsx
 * @Description: 密码强度指示器组件
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  checkPasswordStrength,
  getPasswordStrengthColor,
  type PasswordStrengthResult
} from '../../utils/passwordStrength';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showDetails = true,
  className = ''
}) => {
  const { t } = useTranslation();
  
  // 如果密码为空，不显示指示器
  if (!password) {
    return null;
  }
  
  const result: PasswordStrengthResult = checkPasswordStrength(password);
  const strengthColor = getPasswordStrengthColor(result.strength);
  
  return (
    <div className={`password-strength ${className}`}>
      {/* 强度标签和进度条 */}
      <div className="strength-header">
        <span className="strength-label">
          {t('auth:password.strength')}:
          <span
            className={`strength-text ${result.strength}`}
            style={{ color: strengthColor }}
          >
            {t(`auth:password.${result.strength}`)}
          </span>
        </span>
        <span className="strength-score">
          {result.score}/100
        </span>
      </div>
      
      <div className="strength-bar">
        <div 
          className={`strength-fill ${result.strength}`}
          style={{ 
            width: `${result.score}%`,
            backgroundColor: strengthColor 
          }}
        />
      </div>
      
      {/* 详细信息 */}
      {showDetails && (
        <div className="strength-details">
          {/* 要求检查 - 简化显示 */}
          <div className="requirements-check">
            <div className="requirement-item">
              <i className={`icon-${result.requirements.length ? 'check' : 'x'} ${result.requirements.length ? 'success' : 'error'}`}></i>
              <span>至少6个字符</span>
            </div>
            {(result.requirements.lowercase || result.requirements.uppercase) && (
              <div className="requirement-item">
                <i className={`icon-check success`}></i>
                <span>包含字母</span>
              </div>
            )}
            {result.requirements.number && (
              <div className="requirement-item">
                <i className={`icon-check success`}></i>
                <span>包含数字</span>
              </div>
            )}
            {result.requirements.special && (
              <div className="requirement-item">
                <i className={`icon-check success`}></i>
                <span>包含特殊字符</span>
              </div>
            )}
          </div>
          
          {/* 改进建议 */}
          {result.feedback.length > 0 && (
            <div className="strength-feedback">
              <h4 className="feedback-title">改进建议：</h4>
              <ul className="feedback-list">
                {result.feedback.map((suggestion, index) => (
                  <li key={index} className="feedback-item">
                    <i className="icon-info"></i>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
