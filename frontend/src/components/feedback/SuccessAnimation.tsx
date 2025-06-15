/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\feedback\SuccessAnimation.tsx
 * @Description: 成功反馈动画组件 - 提供操作成功的视觉反馈
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessAnimationProps {
  isVisible: boolean;
  message?: string;
  duration?: number;
  onComplete?: () => void;
  variant?: 'checkmark' | 'celebration' | 'simple';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 成功反馈动画组件
 * 为操作成功提供视觉反馈动画
 */
const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  isVisible,
  message = '操作成功！',
  duration = 2000,
  onComplete,
  variant = 'checkmark',
  size = 'md',
}) => {
  // 自动隐藏
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  // 尺寸配置
  const sizeConfig = {
    sm: { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-sm' },
    md: { container: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-base' },
    lg: { container: 'w-24 h-24', icon: 'w-12 h-12', text: 'text-lg' },
  };

  const config = sizeConfig[size];

  // 对勾动画组件
  const CheckmarkIcon = () => (
    <motion.svg
      className={`${config.icon} text-success`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
    </motion.svg>
  );

  // 庆祝动画组件
  const CelebrationIcon = () => (
    <motion.div
      className={`${config.icon} relative`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
    >
      <span className="text-2xl">🎉</span>
      {/* 粒子效果 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-success rounded-full"
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * 40],
            y: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: 1,
            delay: 0.3 + i * 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );

  // 简单图标组件
  const SimpleIcon = () => (
    <motion.div
      className={`${config.icon} bg-success rounded-full flex items-center justify-center`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </motion.div>
  );

  const renderIcon = () => {
    switch (variant) {
      case 'celebration':
        return <CelebrationIcon />;
      case 'simple':
        return <SimpleIcon />;
      default:
        return <CheckmarkIcon />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-background/90 backdrop-blur-sm rounded-lg shadow-xl p-6 flex flex-col items-center space-y-3"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            {/* 图标容器 */}
            <div className={`${config.container} flex items-center justify-center`}>
              {renderIcon()}
            </div>

            {/* 消息文本 */}
            {message && (
              <motion.p
                className={`${config.text} text-text-primary font-medium text-center`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {message}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 成功反馈Hook
 * 提供便捷的成功反馈调用方式
 */
export const useSuccessAnimation = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<SuccessAnimationProps>>({});

  const showSuccess = React.useCallback((
    options: Partial<SuccessAnimationProps> = {}
  ) => {
    setConfig(options);
    setIsVisible(true);
  }, []);

  const hideSuccess = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  const SuccessAnimationComponent = React.useMemo(() => (
    <SuccessAnimation
      {...config}
      isVisible={isVisible}
      onComplete={hideSuccess}
    />
  ), [config, isVisible, hideSuccess]);

  return {
    showSuccess,
    hideSuccess,
    SuccessAnimation: SuccessAnimationComponent,
  };
};

export default SuccessAnimation;
