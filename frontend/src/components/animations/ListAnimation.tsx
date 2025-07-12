/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\animations\ListAnimation.tsx
 * @Description: 列表动画组件 - 提供列表项的添加、删除、排序动画效果
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface ListAnimationProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

/**
 * 列表动画容器
 * 为列表项提供统一的进入、退出和重排动画
 */
const ListAnimation: React.FC<ListAnimationProps> = ({
  children,
  className = '',
  staggerDelay = 0.05,
}) => {
  return (
    <LayoutGroup>
      <motion.div
        className={className}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
            },
          },
        }}
      >
        <AnimatePresence mode="popLayout">{children}</AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};

/**
 * 列表项动画组件
 * 为单个列表项提供进入、退出动画
 */
export const ListItemAnimation: React.FC<{
  children: React.ReactNode;
  itemKey: string | number;
  className?: string;
  variant?: 'slide' | 'fade' | 'scale';
}> = ({ children, itemKey, className = '', variant = 'slide' }) => {
  const variants = {
    slide: {
      hidden: { opacity: 0, x: -20, height: 0 },
      visible: { opacity: 1, x: 0, height: 'auto' },
      exit: { opacity: 0, x: 20, height: 0 },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
  };

  return (
    <motion.div
      key={itemKey}
      className={className}
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants[variant]}
      transition={{
        duration: 0.2,
        ease: [0.4, 0.0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 可拖拽列表项动画组件
 * 为可拖拽的列表项提供拖拽状态动画
 */
export const DraggableListItem: React.FC<{
  children: React.ReactNode;
  itemKey: string | number;
  className?: string;
  isDragging?: boolean;
}> = ({ children, itemKey, className = '', isDragging = false }) => {
  return (
    <motion.div
      key={itemKey}
      className={className}
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
      }}
      whileDrag={{
        scale: 1.05,
        rotate: 2,
        zIndex: 1000,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 列表加载动画组件
 * 为列表加载状态提供骨架屏动画
 */
export const ListLoadingAnimation: React.FC<{
  itemCount?: number;
  className?: string;
}> = ({ itemCount = 5, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <motion.div
          key={index}
          className="h-16 bg-surface rounded-lg mb-2"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1],
          }}
        >
          <div className="animate-pulse h-full bg-gradient-to-r from-surface via-border to-surface bg-[length:200%_100%] rounded-lg" />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ListAnimation;
