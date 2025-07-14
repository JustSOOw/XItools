/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 20:25:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 20:25:00
 * @FilePath: \XItools\frontend\src\components\ui\Loading\index.ts
 * @Description: 加载状态组件库统一导出文件
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

// 骨架屏组件
export { default as SkeletonCard, SkeletonCardList } from './SkeletonCard';
export { default as SkeletonList, SkeletonListCompact } from './SkeletonList';
export { default as SkeletonCalendar, SkeletonCalendarSidebar } from './SkeletonCalendar';

// 加载旋转器组件
export {
  default as LoadingSpinner,
  FullScreenLoader,
  InlineLoader,
  CardLoader,
} from './LoadingSpinner';

// 进度条组件
export { default as ProgressBar, CircularProgress, StepProgress } from './ProgressBar';

// 类型定义
export type { default as LoadingSpinnerProps } from './LoadingSpinner';
export type { default as ProgressBarProps } from './ProgressBar';
