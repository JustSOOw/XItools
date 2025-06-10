/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 16:30:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 16:30:00
 * @FilePath: \XItools\frontend\src\store\boardStore.ts
 * @Description: 看板设置状态管理
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themeEventEmitter, type ThemeType, type ThemeConfig } from './themeStore';

// 颜色选项类型定义
export interface ColorOption {
  id: string;
  name: string;
  value: string;
  category: 'basic' | 'medium' | 'gradient';
}

// 颜色选项配置
export const colorOptions: ColorOption[] = [
  // 基础色系
  { id: 'default-white', name: '默认白', value: '#FFFFFF', category: 'basic' },
  { id: 'default-gray', name: '默认灰', value: '#F3F4F6', category: 'basic' },
  { id: 'light-blue', name: '浅蓝', value: '#DBEAFE', category: 'basic' },
  { id: 'light-green', name: '浅绿', value: '#DCFCE7', category: 'basic' },
  { id: 'light-purple', name: '浅紫', value: '#F3E8FF', category: 'basic' },
  { id: 'light-yellow', name: '浅黄', value: '#FEF9C3', category: 'basic' },
  { id: 'light-red', name: '浅红', value: '#FEE2E2', category: 'basic' },
  { id: 'light-orange', name: '浅橙', value: '#FFEDD5', category: 'basic' },
  { id: 'light-cyan', name: '浅青', value: '#CFFAFE', category: 'basic' },
  { id: 'light-pink', name: '浅粉', value: '#FCE7F3', category: 'basic' },

  // 中等饱和度色系
  { id: 'sky-blue', name: '天蓝', value: '#BAE6FD', category: 'medium' },
  { id: 'grass-green', name: '草绿', value: '#BBF7D0', category: 'medium' },
  { id: 'lavender', name: '薰衣草', value: '#DDD6FE', category: 'medium' },
  { id: 'lemon', name: '柠檬黄', value: '#FEF08A', category: 'medium' },
  { id: 'coral', name: '珊瑚红', value: '#FECACA', category: 'medium' },
  { id: 'apricot', name: '杏橙', value: '#FED7AA', category: 'medium' },
  { id: 'aqua', name: '水青', value: '#99F6E4', category: 'medium' },
  { id: 'rose', name: '玫瑰粉', value: '#FBCFE8', category: 'medium' },

  // 渐变色背景
  { id: 'gradient-blue-purple', name: '蓝紫渐变', value: 'linear-gradient(135deg, #4F46E5 0%, #A78BFA 100%)', category: 'gradient' },
  { id: 'gradient-green-cyan', name: '绿青渐变', value: 'linear-gradient(135deg, #10B981 0%, #22D3EE 100%)', category: 'gradient' },
  { id: 'gradient-orange-red', name: '橙红渐变', value: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)', category: 'gradient' },
  { id: 'gradient-pink-purple', name: '粉紫渐变', value: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', category: 'gradient' },
  { id: 'gradient-yellow-green', name: '黄绿渐变', value: 'linear-gradient(135deg, #FBBF24 0%, #34D399 100%)', category: 'gradient' },
];

// 看板设置状态接口
interface BoardState {
  // 看板背景颜色
  backgroundColor: string;
  backgroundColorId: string;
  // 是否跟随主题变化（用于UI显示，但主题切换时总是会更新背景色）
  followTheme: boolean;

  // 操作方法
  setBackgroundColor: (colorId: string, colorValue: string) => void;
  getColorOption: (colorId: string) => ColorOption | undefined;
  resetToDefault: () => void;
  setFollowTheme: (follow: boolean) => void;
  syncWithTheme: (themeBackground: string, themeId: string) => void;
}

// 默认背景颜色
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';
const DEFAULT_BACKGROUND_COLOR_ID = 'default-white';

// 创建看板状态存储
export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      // 初始状态
      backgroundColor: DEFAULT_BACKGROUND_COLOR,
      backgroundColorId: DEFAULT_BACKGROUND_COLOR_ID,
      followTheme: true, // 默认跟随主题
      
      // 设置背景颜色
      setBackgroundColor: (colorId: string, colorValue: string) => {
        set({
          backgroundColor: colorValue,
          backgroundColorId: colorId,
          followTheme: false // 手动设置时取消跟随主题
        });

        // 应用到DOM
        const root = document.documentElement;
        root.style.setProperty('--board-background-color', colorValue);
      },
      
      // 获取颜色选项
      getColorOption: (colorId: string) => {
        return colorOptions.find(option => option.id === colorId);
      },
      
      // 重置为默认
      resetToDefault: () => {
        set({
          backgroundColor: DEFAULT_BACKGROUND_COLOR,
          backgroundColorId: DEFAULT_BACKGROUND_COLOR_ID,
          followTheme: true // 重置时恢复跟随主题
        });

        // 应用到DOM
        const root = document.documentElement;
        root.style.setProperty('--board-background-color', DEFAULT_BACKGROUND_COLOR);
      },

      // 设置是否跟随主题
      setFollowTheme: (follow: boolean) => {
        set({ followTheme: follow });

        if (follow) {
          // 如果启用跟随主题，需要获取当前主题的默认背景色
          // 这里我们通过DOM获取当前应用的背景色，避免循环依赖
          const root = document.documentElement;
          const currentBoardBackground = root.style.getPropertyValue('--board-background-color');

          if (currentBoardBackground) {
            // 从当前DOM状态推断主题ID
            let themeId = 'theme-light';
            if (root.classList.contains('dark')) {
              themeId = 'theme-dark';
            } else if (root.classList.contains('theme-cherry')) {
              themeId = 'theme-cherry';
            } else if (root.classList.contains('theme-ocean')) {
              themeId = 'theme-ocean';
            }

            set({
              backgroundColor: currentBoardBackground,
              backgroundColorId: themeId
            });
          }
        }
      },

      // 同步主题背景色（由主题切换时调用）
      syncWithTheme: (themeBackground: string, themeId: string) => {
        const state = get();
        const root = document.documentElement;

        // 无论followTheme状态如何，都更新背景色
        // 这样确保主题切换时看板背景总是会变化，并且变化会被持久化
        set({
          backgroundColor: themeBackground,
          backgroundColorId: state.followTheme ? themeId : state.backgroundColorId
        });

        root.style.setProperty('--board-background-color', themeBackground);
      },
    }),
    {
      name: 'xi-board-storage',
      // 只持久化必要的状态
      partialize: (state) => ({
        backgroundColor: state.backgroundColor,
        backgroundColorId: state.backgroundColorId,
        followTheme: state.followTheme,
      }),
      // 恢复状态后应用背景色
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 应用背景色到DOM
          const root = document.documentElement;
          root.style.setProperty('--board-background-color', state.backgroundColor);
        }
      },
    }
  )
);

// 监听主题变化事件
if (typeof window !== 'undefined') {
  themeEventEmitter.subscribe((theme: ThemeType, themeConfig: ThemeConfig) => {
    const boardStore = useBoardStore.getState();
    if (themeConfig.defaultBoardBackground) {
      // 总是调用syncWithTheme，让它内部决定如何处理
      boardStore.syncWithTheme(themeConfig.defaultBoardBackground, `theme-${theme}`);
    }
  });
}

export default useBoardStore;
