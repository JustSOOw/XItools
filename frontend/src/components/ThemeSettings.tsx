/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 15:35:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 15:35:00
 * @FilePath: \XItools\frontend\src\components\ThemeSettings.tsx
 * @Description: 主题设置组件
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';
import { useThemeStore, ThemeType, ThemeConfig } from '../store/themeStore';

interface ThemeSettingsProps {
  className?: string;
}

// 主题预览卡片组件
const ThemePreviewCard: React.FC<{
  config: ThemeConfig;
  isActive: boolean;
  onClick: () => void;
}> = ({ config, isActive, onClick }) => {
  return (
    <div
      className={`
        relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:scale-105
        ${isActive 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50'
        }
      `}
      onClick={onClick}
    >
      {/* 主题预览区域 */}
      <div className="p-4">
        {/* 颜色预览条 */}
        <div className="flex h-6 rounded-md overflow-hidden mb-2">
          <div
            className="flex-1"
            style={{ backgroundColor: config.preview.primary }}
          />
          <div
            className="flex-1"
            style={{ backgroundColor: config.preview.secondary }}
          />
          <div
            className="flex-1"
            style={{ backgroundColor: config.preview.accent }}
          />
        </div>

        {/* 模拟界面预览 */}
        <div
          className="rounded-md p-2 mb-2"
          style={{ backgroundColor: config.preview.background }}
        >
          <div
            className="h-1.5 rounded mb-1"
            style={{ backgroundColor: config.preview.surface }}
          />
          <div
            className="h-1 rounded w-3/4"
            style={{ backgroundColor: config.preview.surface }}
          />
        </div>
        
        {/* 主题信息 */}
        <div>
          <h3 className="font-medium text-text-primary mb-1">
            {config.name}
          </h3>
          <p className="text-sm text-text-secondary">
            {config.description}
          </p>
        </div>
      </div>
      
      {/* 选中指示器 */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-white" 
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
          </div>
        </div>
      )}
    </div>
  );
};

// 主题设置组件
export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ className = '' }) => {
  const {
    currentTheme,
    followSystemTheme,
    configs,
    setTheme,
    setFollowSystemTheme,
  } = useThemeStore();

  const handleThemeChange = (theme: ThemeType) => {
    setTheme(theme);
  };

  const handleSystemThemeToggle = (enabled: boolean) => {
    setFollowSystemTheme(enabled);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 标题 */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          主题设置
        </h2>
        <p className="text-sm text-text-secondary">
          选择您喜欢的界面主题，让XItools更符合您的使用习惯
        </p>
      </div>

      {/* 系统主题跟随选项 */}
      <div className="bg-surface rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-text-primary mb-1">
              跟随系统主题
            </h3>
            <p className="text-sm text-text-secondary">
              自动根据系统的深色/浅色模式切换主题
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={followSystemTheme}
              onChange={(e) => handleSystemThemeToggle(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* 主题选择 */}
      <div>
        <h3 className="font-medium text-text-primary mb-3">
          选择主题
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(configs).map((config) => (
            <ThemePreviewCard
              key={config.id}
              config={config}
              isActive={currentTheme === config.id && !followSystemTheme}
              onClick={() => handleThemeChange(config.id)}
            />
          ))}
        </div>
      </div>

      {/* 当前主题信息 */}
      <div className="bg-surface rounded-lg p-4">
        <h3 className="font-medium text-text-primary mb-2">
          当前主题
        </h3>
        <div className="flex items-center space-x-3">
          <div className="flex h-6 rounded overflow-hidden">
            <div 
              className="w-6" 
              style={{ backgroundColor: configs[currentTheme].preview.primary }}
            />
            <div 
              className="w-6" 
              style={{ backgroundColor: configs[currentTheme].preview.secondary }}
            />
            <div 
              className="w-6" 
              style={{ backgroundColor: configs[currentTheme].preview.accent }}
            />
          </div>
          <div>
            <span className="font-medium text-text-primary">
              {configs[currentTheme].name}
            </span>
            {followSystemTheme && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                系统跟随
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
