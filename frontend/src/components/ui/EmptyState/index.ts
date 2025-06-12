/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:15:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:15:00
 * @FilePath: \XItools\frontend\src\components\ui\EmptyState\index.ts
 * @Description: 空状态组件库统一导出文件
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

// 基础空状态组件
export { default as EmptyState } from './EmptyState';
export type { EmptyStateAction } from './EmptyState';

// 预设空状态组件
export {
  EmptyTasks,
  EmptySearchResults,
  EmptyNetworkError,
  EmptyCalendar,
  EmptyFilterResults,
  EmptyColumn,
} from './EmptyStatePresets';

// 插画组件
export {
  TaskManagementIllustration,
  SearchIllustration,
  NetworkIllustration,
  CalendarIllustration,
  FilterIllustration,
} from './EmptyStateIllustrations';
