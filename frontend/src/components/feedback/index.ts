/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\feedback\index.ts
 * @Description: 反馈组件导出文件 - 统一导出所有反馈相关组件
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

// 确认对话框
export { default as ConfirmDialog, useConfirmDialog } from './ConfirmDialog';

// 成功反馈动画
export { default as SuccessAnimation, useSuccessAnimation } from './SuccessAnimation';

// 快捷键系统
export {
  default as KeyboardShortcuts,
  KeyboardShortcutsHelp,
  KeyboardShortcutHint,
  useKeyboardShortcuts,
} from './KeyboardShortcuts';

// 状态指示器
export {
  default as StatusIndicator,
  ConnectionStatus,
  OperationStatus,
  TaskStatusIndicator,
} from './StatusIndicator';
