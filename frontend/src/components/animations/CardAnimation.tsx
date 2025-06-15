/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\animations\CardAnimation.tsx
 * @Description: 卡片动画组件 - 提供任务卡片的各种微动画效果
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface CardAnimationProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  variant?: 'hover' | 'tap' | 'drag' | 'appear' | 'remove';
  disabled?: boolean;
  className?: string;
}

/**
 * 卡片动画组件
 * 为任务卡片提供悬停、点击、拖拽等微动画效果
 */
const CardAnimation: React.FC<CardAnimationProps> = ({
  children,
  variant = 'hover',
  disabled = false,
  className = '',
  ...motionProps
}) => {
  // 动画变体配置
  const variants = {
    hover: {
      rest: { scale: 1, y: 0 },
      hover: { scale: 1.02, y: -2 },
      tap: { scale: 0.98 },
    },
    tap: {
      rest: { scale: 1 },
      tap: { scale: 0.95 },
    },
    drag: {
      rest: { scale: 1, rotate: 0 },
      drag: { scale: 1.05, rotate: 2, zIndex: 1000 },
    },
    appear: {
      hidden: { opacity: 0, scale: 0.8, y: 20 },
      visible: { opacity: 1, scale: 1, y: 0 },
    },
    remove: {
      visible: { opacity: 1, scale: 1, x: 0 },
      hidden: { opacity: 0, scale: 0.8, x: -100 },
    },
  };

  // 过渡配置
  const transition = {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  // 根据变体类型返回不同的动画配置
  switch (variant) {
    case 'appear':
      return (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          variants={variants.appear}
          transition={transition}
          {...motionProps}
        >
          {children}
        </motion.div>
      );

    case 'remove':
      return (
        <motion.div
          className={className}
          initial="visible"
          animate="hidden"
          variants={variants.remove}
          transition={transition}
          {...motionProps}
        >
          {children}
        </motion.div>
      );

    case 'drag':
      return (
        <motion.div
          className={className}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          whileDrag="drag"
          variants={variants.drag}
          transition={transition}
          {...motionProps}
        >
          {children}
        </motion.div>
      );

    case 'tap':
      return (
        <motion.div
          className={className}
          initial="rest"
          whileTap="tap"
          variants={variants.tap}
          transition={transition}
          {...motionProps}
        >
          {children}
        </motion.div>
      );

    default: // hover
      return (
        <motion.div
          className={className}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          variants={variants.hover}
          transition={transition}
          {...motionProps}
        >
          {children}
        </motion.div>
      );
  }
};

/**
 * 卡片列表动画容器
 * 为卡片列表提供统一的动画效果
 */
export const CardListAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
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
      {children}
    </motion.div>
  );
};

export default CardAnimation;
