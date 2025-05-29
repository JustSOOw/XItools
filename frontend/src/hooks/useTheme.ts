import { useState, useEffect } from 'react';

export type ThemeType = 'light' | 'dark' | 'soft' | 'artistic';

export const useTheme = () => {
  // 从localStorage获取初始主题，默认为light
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('xi-theme');
    return (savedTheme as ThemeType) || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // 监听主题变化并应用样式
  useEffect(() => {
    const root = document.documentElement;
    
    // 移除所有主题类
    root.classList.remove('dark', 'theme-soft', 'theme-artistic');
    
    // 添加对应的主题类
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'soft') {
      root.classList.add('theme-soft');
    } else if (theme === 'artistic') {
      root.classList.add('theme-artistic');
    }
    
    // 保存到localStorage
    localStorage.setItem('xi-theme', theme);
  }, [theme]);

  // 切换到下一个主题的函数
  const toggleTheme = () => {
    const themeOrder: ThemeType[] = ['light', 'dark', 'soft', 'artistic'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  // 设置特定主题的函数
  const setSpecificTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  return { theme, toggleTheme, setTheme: setSpecificTheme };
};

export default useTheme; 