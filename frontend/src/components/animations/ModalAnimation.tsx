/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\animations\ModalAnimation.tsx
 * @Description: 模态框动画组件 - 提供模态框的进入、退出动画效果
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalAnimationProps {
  children: React.ReactNode;
  isOpen: boolean;
  variant?: 'fade' | 'scale' | 'slideUp' | 'slideDown';
  className?: string;
  overlayClassName?: string;
  onOverlayClick?: () => void;
}

/**
 * 模态框动画组件
 * 为模态框提供流畅的进入和退出动画
 */
const ModalAnimation: React.FC<ModalAnimationProps> = ({
  children,
  isOpen,
  variant = 'scale',
  className = '',
  overlayClassName = '',
  onOverlayClick,
}) => {
  // 背景遮罩动画变体
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // 模态框内容动画变体
  const modalVariants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    slideDown: {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 },
    },
  };

  const transition = {
    duration: 0.3,
    ease: [0.4, 0.0, 0.2, 1], // ease-out
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          transition={transition}
          onClick={onOverlayClick}
        >
          <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants[variant]}
            transition={transition}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 模态框内容动画组件
 * 为模态框内部内容提供渐进式显示动画
 */
export const ModalContentAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0.1 }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.4, 0.0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 模态框头部动画组件
 */
export const ModalHeaderAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: 0.1,
        ease: [0.4, 0.0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 模态框底部动画组件
 */
export const ModalFooterAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: 0.2,
        ease: [0.4, 0.0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 确认对话框动画组件
 * 专门为确认对话框设计的动画效果
 */
export const ConfirmDialogAnimation: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  onOverlayClick?: () => void;
}> = ({ children, isOpen, className = '', onOverlayClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onOverlayClick}
        >
          <motion.div
            className={`bg-background rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalAnimation;
