/*
 * @Author: XItools Team
 * @Date: 2025-07-01 14:15:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 14:15:00
 * @FilePath: \XItools\frontend\src\hooks\useFormValidation.ts
 * @Description: 表单验证Hook，提供统一的表单验证和多语言支持
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 验证规则接口
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  number?: boolean;
  integer?: boolean;
  positive?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
  message?: string; // 自定义错误消息
}

/**
 * 验证规则集合
 */
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

/**
 * 验证错误集合
 */
export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * 表单验证Hook
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  rules: ValidationRules<T>
) {
  const { t } = useTranslation(['auth', 'error']);
  
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  /**
   * 验证单个字段
   */
  const validateField = useCallback((
    fieldName: keyof T,
    value: any,
    rule: ValidationRule
  ): string | null => {
    // 必填验证
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || t('error:validation.required');
    }

    // 如果值为空且不是必填，跳过其他验证
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    const stringValue = String(value);

    // 最小长度验证
    if (rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || t('error:validation.minLength', { min: rule.minLength });
    }

    // 最大长度验证
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || t('error:validation.maxLength', { max: rule.maxLength });
    }

    // 正则表达式验证
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || t('error:validation.invalid');
    }

    // 邮箱验证
    if (rule.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(stringValue)) {
        return rule.message || t('error:validation.email');
      }
    }

    // URL验证
    if (rule.url) {
      try {
        new URL(stringValue);
      } catch {
        return rule.message || t('error:validation.url');
      }
    }

    // 数字验证
    if (rule.number) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return rule.message || t('error:validation.number');
      }

      // 整数验证
      if (rule.integer && !Number.isInteger(numValue)) {
        return rule.message || t('error:validation.integer');
      }

      // 正数验证
      if (rule.positive && numValue <= 0) {
        return rule.message || t('error:validation.positive');
      }

      // 最小值验证
      if (rule.min !== undefined && numValue < rule.min) {
        return rule.message || t('error:validation.range', { min: rule.min, max: rule.max || '∞' });
      }

      // 最大值验证
      if (rule.max !== undefined && numValue > rule.max) {
        return rule.message || t('error:validation.range', { min: rule.min || '-∞', max: rule.max });
      }
    }

    // 自定义验证
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [t]);

  /**
   * 验证所有字段
   */
  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors<T> = {};
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const rule = rules[fieldName as keyof T];
      if (rule) {
        const error = validateField(fieldName as keyof T, data[fieldName as keyof T], rule);
        if (error) {
          newErrors[fieldName as keyof T] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [data, rules, validateField]);

  /**
   * 验证单个字段并更新错误状态
   */
  const validateSingleField = useCallback((fieldName: keyof T): boolean => {
    const rule = rules[fieldName];
    if (!rule) return true;

    const error = validateField(fieldName, data[fieldName], rule);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || undefined
    }));

    return !error;
  }, [data, rules, validateField]);

  /**
   * 更新字段值
   */
  const updateField = useCallback((fieldName: keyof T, value: any) => {
    setData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // 如果字段已经被触摸过，立即验证
    if (touched[fieldName]) {
      const rule = rules[fieldName];
      if (rule) {
        const error = validateField(fieldName, value, rule);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || undefined
        }));
      }
    }
  }, [touched, rules, validateField]);

  /**
   * 标记字段为已触摸
   */
  const touchField = useCallback((fieldName: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // 触摸时验证字段
    validateSingleField(fieldName);
  }, [validateSingleField]);

  /**
   * 重置表单
   */
  const reset = useCallback((newData?: T) => {
    setData(newData || initialData);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialData]);

  /**
   * 清除错误
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * 清除特定字段的错误
   */
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: undefined
    }));
  }, []);

  /**
   * 获取字段错误
   */
  const getFieldError = useCallback((fieldName: keyof T): string | undefined => {
    return errors[fieldName];
  }, [errors]);

  /**
   * 检查字段是否有错误
   */
  const hasFieldError = useCallback((fieldName: keyof T): boolean => {
    return !!errors[fieldName];
  }, [errors]);

  /**
   * 检查表单是否有错误
   */
  const hasErrors = useCallback((): boolean => {
    return Object.values(errors).some(error => !!error);
  }, [errors]);

  return {
    // 数据状态
    data,
    errors,
    touched,

    // 验证方法
    validateAll,
    validateSingleField,
    validateField,

    // 数据操作
    updateField,
    touchField,
    reset,

    // 错误操作
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
    hasErrors,

    // 便捷方法
    isValid: !hasErrors(),
    setData,
    setErrors
  };
}

export default useFormValidation;
