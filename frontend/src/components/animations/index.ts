/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\animations\index.ts
 * @Description: 动画组件导出文件 - 统一导出所有动画组件
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

// 页面切换动画
export { default as PageTransition, ViewTransition } from './PageTransition';

// 卡片动画
export { default as CardAnimation, CardListAnimation } from './CardAnimation';

// 列表动画
export { 
  default as ListAnimation, 
  ListItemAnimation, 
  DraggableListItem, 
  ListLoadingAnimation 
} from './ListAnimation';

// 模态框动画
export { 
  default as ModalAnimation, 
  ModalContentAnimation, 
  ModalHeaderAnimation, 
  ModalFooterAnimation, 
  ConfirmDialogAnimation 
} from './ModalAnimation';
