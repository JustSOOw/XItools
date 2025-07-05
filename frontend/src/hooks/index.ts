/*
 * @Author: XItools Team
 * @Date: 2025-07-01 14:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 14:00:00
 * @FilePath: \XItools\frontend\src\hooks\index.ts
 * @Description: Hooks导出文件
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

// 认证相关Hooks
export { useAuthError, default as useAuthErrorDefault } from './useAuthError';

// 表单验证Hooks
export { useFormValidation, default as useFormValidationDefault } from './useFormValidation';

// 国际化Hooks
export { 
  useI18n, 
  useTaskTranslation, 
  useBoardTranslation, 
  useCalendarTranslation, 
  useSettingsTranslation, 
  useFeedbackTranslation 
} from './useI18n';

// 主题Hooks
export { useTheme } from './useTheme';

// MCP连接Hooks
export { useMcpConnection } from './useMcpConnection';
