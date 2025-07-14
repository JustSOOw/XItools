/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 15:30:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 15:30:00
 * @FilePath: \XItools\frontend\src\store\themeStore.ts
 * @Description: 主题状态管理
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 主题类型定义
export type ThemeType = 'light' | 'dark' | 'cherry' | 'ocean';

// 主题配置接口
export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  // 默认看板背景色
  defaultBoardBackground: string;
}

// 主题配置数据
export const themeConfigs: Record<ThemeType, ThemeConfig> = {
  light: {
    id: 'light',
    name: '浅色主题',
    description: '清新明亮的浅色界面',
    preview: {
      primary: '#4F46E5',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F3F4F6',
    },
    defaultBoardBackground: '#FFFFFF',
  },
  dark: {
    id: 'dark',
    name: '深色主题',
    description: '护眼舒适的深色界面',
    preview: {
      primary: '#6366F1',
      secondary: '#34D399',
      accent: '#FBBF24',
      background: '#1F2937',
      surface: '#374151',
    },
    defaultBoardBackground: '#374151', // 使用surface色，比background稍亮
  },
  cherry: {
    id: 'cherry',
    name: '樱花主题',
    description: '温柔浪漫的樱花色调',
    preview: {
      primary: '#E91E63',
      secondary: '#FF9800',
      accent: '#9C27B0',
      background: '#FFF8F5',
      surface: '#FCE4EC',
    },
    defaultBoardBackground: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F5 50%, #FCE4EC 100%)',
  },
  ocean: {
    id: 'ocean',
    name: '海洋主题',
    description: '宁静深邃的海洋色调',
    preview: {
      primary: '#00BCD4',
      secondary: '#4CAF50',
      accent: '#FF5722',
      background: '#F0F8FF',
      surface: '#E0F2F1',
    },
    defaultBoardBackground:
      'linear-gradient(135deg, #FFFFFF 0%, #F0F8FF 30%, #E0F2F1 70%, #B2EBF2 100%)',
  },
};

// 主题状态接口
interface ThemeState {
  // 当前主题
  currentTheme: ThemeType;
  // 是否启用系统主题跟随
  followSystemTheme: boolean;
  // 主题配置
  configs: Record<ThemeType, ThemeConfig>;

  // 操作方法
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  setFollowSystemTheme: (follow: boolean) => void;
  getThemeConfig: (theme?: ThemeType) => ThemeConfig;
  applyTheme: (theme: ThemeType) => void;
}

// 主题变化事件系统
class ThemeEventEmitter {
  private listeners: Array<(theme: ThemeType, themeConfig: ThemeConfig) => void> = [];

  subscribe(callback: (theme: ThemeType, themeConfig: ThemeConfig) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(theme: ThemeType, themeConfig: ThemeConfig) {
    this.listeners.forEach((callback) => {
      try {
        callback(theme, themeConfig);
      } catch (error) {
        console.warn('主题事件监听器执行失败:', error);
      }
    });
  }
}

// 全局主题事件发射器
export const themeEventEmitter = new ThemeEventEmitter();

// 应用主题到DOM的函数
const applyThemeToDOM = (theme: ThemeType) => {
  const root = document.documentElement;

  // 移除所有主题类
  root.classList.remove('dark', 'theme-light', 'theme-cherry', 'theme-ocean');

  // 添加对应的主题类
  switch (theme) {
    case 'light':
      root.classList.add('theme-light');
      break;
    case 'dark':
      root.classList.add('dark');
      break;
    case 'cherry':
      root.classList.add('theme-cherry');
      break;
    case 'ocean':
      root.classList.add('theme-ocean');
      break;
    default:
      // 默认使用浅色主题
      root.classList.add('theme-light');
      break;
  }

  // 通过事件系统通知其他store主题变化，让boardStore决定是否更新背景色
  const themeConfig = themeConfigs[theme];
  if (themeConfig && typeof window !== 'undefined') {
    // 延迟执行以确保DOM更新完成
    setTimeout(() => {
      themeEventEmitter.emit(theme, themeConfig);
    }, 0);
  }
};

// 检测系统主题偏好
const getSystemTheme = (): ThemeType => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// 创建主题状态存储
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentTheme: 'light',
      followSystemTheme: false,
      configs: themeConfigs,

      // 设置主题
      setTheme: (theme: ThemeType) => {
        set({ currentTheme: theme, followSystemTheme: false });
        applyThemeToDOM(theme);
      },

      // 切换到下一个主题
      toggleTheme: () => {
        const themeOrder: ThemeType[] = ['light', 'dark', 'cherry', 'ocean'];
        const currentIndex = themeOrder.indexOf(get().currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        const nextTheme = themeOrder[nextIndex];

        set({ currentTheme: nextTheme, followSystemTheme: false });
        applyThemeToDOM(nextTheme);
      },

      // 设置是否跟随系统主题
      setFollowSystemTheme: (follow: boolean) => {
        set({ followSystemTheme: follow });

        if (follow) {
          const systemTheme = getSystemTheme();
          set({ currentTheme: systemTheme });
          applyThemeToDOM(systemTheme);
        }
      },

      // 获取主题配置
      getThemeConfig: (theme?: ThemeType) => {
        const targetTheme = theme || get().currentTheme;
        return get().configs[targetTheme];
      },

      // 应用主题
      applyTheme: (theme: ThemeType) => {
        applyThemeToDOM(theme);
      },
    }),
    {
      name: 'xi-theme-storage-v2', // 更改存储键名以强制重置
      // 只持久化必要的状态
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        followSystemTheme: state.followSystemTheme,
      }),
      // 恢复状态后应用主题
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 迁移旧主题ID到新主题ID
          if (state.currentTheme === 'soft') {
            state.currentTheme = 'cherry';
          } else if (state.currentTheme === 'artistic') {
            state.currentTheme = 'ocean';
          }

          // 确保主题ID有效
          if (!themeConfigs[state.currentTheme]) {
            state.currentTheme = 'light';
          }

          // 如果启用了系统主题跟随，检查系统主题
          if (state.followSystemTheme) {
            const systemTheme = getSystemTheme();
            state.currentTheme = systemTheme;
          }

          // 应用主题到DOM
          applyThemeToDOM(state.currentTheme);
        }
      },
    },
  ),
);

// 监听系统主题变化
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  mediaQuery.addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.followSystemTheme) {
      const newTheme = e.matches ? 'dark' : 'light';
      store.setTheme(newTheme);
    }
  });
}

export default useThemeStore;
