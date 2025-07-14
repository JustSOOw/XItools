/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-06-10 22:54:35
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-06-11 13:50:28
 * @FilePath: \XItools\frontend\src\components\Portal.tsx
 * @Description:
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */
/**
 * Portal组件 - 用于将子组件渲染到DOM树的其他位置
 *
 * 主要用途：
 * - 解决下拉菜单、模态框等组件的层级遮挡问题
 * - 将组件渲染到document.body或指定容器，突破父容器的层叠上下文限制
 * - 确保弹出组件始终显示在最顶层
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode; // 要渲染的子组件
  container?: Element; // 可选的目标容器，默认为document.body
}

/**
 * Portal组件 - 将子组件渲染到指定的DOM容器中
 * @param children 要渲染的React节点
 * @param container 目标容器元素，默认为document.body
 * @returns 渲染到指定容器的Portal组件
 */
const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mounted, setMounted] = useState(false);

  // 确保组件在客户端挂载后才渲染，避免SSR问题
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 在服务端渲染或组件未挂载时不渲染任何内容
  if (!mounted) {
    return null;
  }

  // 使用React Portal将children渲染到指定容器
  return createPortal(children, container || document.body);
};

export default Portal;
