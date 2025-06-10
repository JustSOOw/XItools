/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 16:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 16:00:00
 * @FilePath: \XItools\frontend\src\pages\ThemeTestPage.tsx
 * @Description: 主题测试页面
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React, { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useBoardStore } from '../store/boardStore';
import { ThemeSettings, ThemeToggle, BoardColorPicker, Button, Card } from '../components';

export const ThemeTestPage: React.FC = () => {
  const { currentTheme, configs } = useThemeStore();
  const { backgroundColor, backgroundColorId, getColorOption } = useBoardStore();
  const [showSettings, setShowSettings] = useState(false);

  const currentConfig = configs[currentTheme];
  const currentBoardColor = getColorOption(backgroundColorId);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            XItools 主题系统测试
          </h1>
          <p className="text-text-secondary">
            当前主题: <span className="font-medium text-primary">{currentConfig.name}</span>
          </p>
        </div>

        {/* 主题切换控件 */}
        <div className="flex justify-center space-x-4">
          <ThemeToggle showLabel={true} size="md" variant="button" />
          <BoardColorPicker />
          <Button
            variant="secondary"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? '隐藏设置' : '显示设置'}
          </Button>
        </div>

        {/* 主题设置面板 */}
        {showSettings && (
          <Card className="p-6">
            <ThemeSettings />
          </Card>
        )}

        {/* 颜色展示区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 主色调展示 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">主色调</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded"></div>
                <span className="text-text-primary">Primary</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary rounded"></div>
                <span className="text-text-primary">Secondary</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent rounded"></div>
                <span className="text-text-primary">Accent</span>
              </div>
            </div>
          </Card>

          {/* 状态颜色展示 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">状态颜色</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded"></div>
                <span className="text-text-primary">Success</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-warning rounded"></div>
                <span className="text-text-primary">Warning</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-error rounded"></div>
                <span className="text-text-primary">Error</span>
              </div>
            </div>
          </Card>

          {/* 背景色展示 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">背景色</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-background border border-border rounded"></div>
                <span className="text-text-primary">Background</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-surface rounded"></div>
                <span className="text-text-primary">Surface</span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 border border-border rounded"
                  style={{ background: backgroundColor }}
                ></div>
                <span className="text-text-primary">
                  看板背景 ({currentBoardColor?.name || '默认'})
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* 卡片背景色展示 */}
        <div>
          <h3 className="text-xl font-semibold text-text-primary mb-6 text-center">
            卡片背景色展示
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: '默认', class: 'bg-card-bg-default' },
              { name: '灰色', class: 'bg-card-bg-gray' },
              { name: '蓝色', class: 'bg-card-bg-blue' },
              { name: '绿色', class: 'bg-card-bg-green' },
              { name: '紫色', class: 'bg-card-bg-purple' },
              { name: '黄色', class: 'bg-card-bg-yellow' },
              { name: '红色', class: 'bg-card-bg-red' },
              { name: '橙色', class: 'bg-card-bg-orange' },
              { name: '青色', class: 'bg-card-bg-cyan' },
              { name: '粉色', class: 'bg-card-bg-pink' },
              { name: '天蓝', class: 'bg-card-bg-sky' },
              { name: '草绿', class: 'bg-card-bg-grass' },
            ].map((color) => (
              <div
                key={color.name}
                className={`${color.class} p-4 rounded-lg border border-border text-center`}
              >
                <div className="text-sm font-medium text-text-primary">
                  {color.name}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  示例卡片
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 按钮展示 */}
        <div>
          <h3 className="text-xl font-semibold text-text-primary mb-6 text-center">
            按钮样式展示
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </div>

        {/* 文本展示 */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">文本样式展示</h3>
          <div className="space-y-2">
            <p className="text-text-primary">这是主要文本颜色 (text-primary)</p>
            <p className="text-text-secondary">这是次要文本颜色 (text-secondary)</p>
            <p className="text-primary">这是主色调文本 (text-primary color)</p>
            <p className="text-secondary">这是次色调文本 (text-secondary color)</p>
            <p className="text-accent">这是强调色文本 (text-accent)</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ThemeTestPage;
