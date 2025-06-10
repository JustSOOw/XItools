/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 15:45:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 15:45:00
 * @FilePath: \XItools\frontend\src\components\ThemeToggle.tsx
 * @Description: 主题切换按钮组件
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React, { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import ThemeSettingsModal from './ThemeSettingsModal';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  className?: string;
}

// 主题图标组件
const ThemeIcon: React.FC<{ theme: string; size: string }> = ({ theme, size }) => {
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  
  switch (theme) {
    case 'light':
      return (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
        </svg>
      );
    case 'dark':
      return (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      );
    case 'cherry':
      return (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    case 'ocean':
      return (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1a1 1 0 001 1h1a1 1 0 010 2H7a3 3 0 01-3-3V3a1 1 0 011-1zm0 10a1 1 0 011 1v1a1 1 0 001 1h1a1 1 0 110 2H7a3 3 0 01-3-3v-1a1 1 0 011-1zm10 0a1 1 0 011 1v1a3 3 0 01-3 3h-1a1 1 0 110-2h1a1 1 0 001-1v-1a1 1 0 011-1zm0-10a1 1 0 011 1v1a3 3 0 01-3 3h-1a1 1 0 110-2h1a1 1 0 001-1V3a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
  }
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  size = 'md',
  variant = 'button',
  className = '',
}) => {
  const { currentTheme, toggleTheme, configs } = useThemeStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentConfig = configs[currentTheme] || configs.light;

  const handleQuickToggle = () => {
    toggleTheme();
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleQuickToggle}
          onDoubleClick={handleOpenSettings}
          className={`
            inline-flex items-center justify-center rounded-md transition-colors
            hover:bg-primary/10 text-text-primary hover:text-primary
            ${size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2'}
            ${className}
          `}
          title={`当前: ${currentConfig.name} (双击打开设置)`}
        >
          <ThemeIcon theme={currentTheme} size={size} />
        </button>
        
        <ThemeSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* 快速切换按钮 */}
        <button
          onClick={handleQuickToggle}
          className={`
            inline-flex items-center space-x-2 px-3 py-2 rounded-md transition-colors
            bg-primary/10 hover:bg-primary/20 text-primary
            ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
          `}
          title="快速切换主题"
        >
          <ThemeIcon theme={currentTheme} size={size} />
          {showLabel && <span>{currentConfig.name}</span>}
        </button>
        
        {/* 设置按钮 */}
        <button
          onClick={handleOpenSettings}
          className={`
            inline-flex items-center justify-center rounded-md transition-colors
            hover:bg-surface text-text-secondary hover:text-text-primary
            ${size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2'}
          `}
          title="主题设置"
        >
          <svg className={size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      <ThemeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default ThemeToggle;
