/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\animations\PageTransition.tsx
 * @Description: 页面切换动画组件 - 提供流畅的视图切换过渡效果
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'fade' | 'slide' | 'scale' | 'slideUp';
  duration?: number;
  className?: string;
}

/**
 * 页面切换动画组件
 * 为不同视图间的切换提供流畅的过渡动画
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = 'fade',
  duration = 0.3,
  className = '',
}) => {
  // 动画变体配置
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
  };

  const transition = {
    duration,
    ease: [0.4, 0.0, 0.2, 1], // ease-out
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[mode]}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

/**
 * 视图切换容器组件
 * 用于包装需要切换动画的视图内容
 */
export const ViewTransition: React.FC<{
  children: React.ReactNode;
  viewKey: string;
  mode?: PageTransitionProps['mode'];
  className?: string;
}> = ({ children, viewKey, mode = 'fade', className = '' }) => {
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={viewKey} mode={mode} className={className}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
};

export default PageTransition;
