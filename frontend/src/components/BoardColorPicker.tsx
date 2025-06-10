/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 16:35:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 16:35:00
 * @FilePath: \XItools\frontend\src\components\BoardColorPicker.tsx
 * @Description: 看板背景颜色选择器组件
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React, { useState } from 'react';
import { useBoardStore, colorOptions, ColorOption } from '../store/boardStore';
import Modal from './Modal';
import Button from './Button';

interface BoardColorPickerProps {
  className?: string;
}

// 颜色预览组件
const ColorPreview: React.FC<{
  option: ColorOption;
  isSelected: boolean;
  onClick: () => void;
}> = ({ option, isSelected, onClick }) => {
  const isGradient = option.category === 'gradient';
  
  return (
    <div
      className={`
        relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:scale-105
        ${isSelected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50'
        }
      `}
      onClick={onClick}
      title={option.name}
    >
      <div className="flex flex-col items-center">
        {/* 颜色预览区域 */}
        <div
          className="w-14 h-14 rounded-md border border-border"
          style={{
            background: option.value,
            backgroundSize: 'cover'
          }}
        />

        {/* 选中指示器 */}
        {isSelected && (
          <div className="absolute -top-1 -right-1">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
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

        {/* 颜色名称 */}
        <div className="mt-2 text-center">
          <span className="text-xs text-text-secondary">
            {option.name}
          </span>
        </div>
      </div>
    </div>
  );
};

// 看板背景颜色选择器组件
export const BoardColorPicker: React.FC<BoardColorPickerProps> = ({ className = '' }) => {
  const { backgroundColorId, followTheme, setBackgroundColor, getColorOption, setFollowTheme } = useBoardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentColorOption = getColorOption(backgroundColorId);

  const handleColorSelect = (option: ColorOption) => {
    setBackgroundColor(option.id, option.value);
  };

  const handleReset = () => {
    const defaultOption = colorOptions.find(option => option.id === 'default-white');
    if (defaultOption) {
      setBackgroundColor(defaultOption.id, defaultOption.value);
    }
  };

  // 按类别分组颜色选项
  const basicColors = colorOptions.filter(option => option.category === 'basic');
  const mediumColors = colorOptions.filter(option => option.category === 'medium');
  const gradientColors = colorOptions.filter(option => option.category === 'gradient');

  return (
    <>
      {/* 触发按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={className}
        icon={
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border border-border"
              style={{ background: currentColorOption?.value || '#FFFFFF' }}
            />
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2M9 3h6a2 2 0 012 2v12a4 4 0 01-4 4H9" />
            </svg>
          </div>
        }
      >
        看板背景
      </Button>

      {/* 颜色选择模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="选择看板背景颜色"
        size="md"
      >
        <div className="space-y-4">
          {/* 跟随主题选项 */}
          <div className="bg-surface rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary">跟随主题</h3>
                <p className="text-sm text-text-secondary">自动使用当前主题的默认背景色</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={followTheme}
                  onChange={(e) => setFollowTheme(e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  followTheme ? 'bg-primary' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    followTheme ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
          </div>

          {/* 当前选择 */}
          <div className="bg-surface rounded-lg p-3">
            <h3 className="font-medium text-text-primary mb-2">当前背景</h3>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ background: currentColorOption?.value || '#FFFFFF' }}
              />
              <span className="text-sm text-text-primary">
                {followTheme ? '跟随主题' : (currentColorOption?.name || '默认白')}
              </span>
            </div>
          </div>

          {/* 基础色系 */}
          <div className={followTheme ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="font-medium text-text-primary mb-3">基础色系</h3>
            <div className="grid grid-cols-4 gap-3">
              {basicColors.map((option) => (
                <ColorPreview
                  key={option.id}
                  option={option}
                  isSelected={!followTheme && backgroundColorId === option.id}
                  onClick={() => handleColorSelect(option)}
                />
              ))}
            </div>
          </div>

          {/* 中等饱和度色系 */}
          <div className={followTheme ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="font-medium text-text-primary mb-3">中等饱和度色系</h3>
            <div className="grid grid-cols-4 gap-3">
              {mediumColors.map((option) => (
                <ColorPreview
                  key={option.id}
                  option={option}
                  isSelected={!followTheme && backgroundColorId === option.id}
                  onClick={() => handleColorSelect(option)}
                />
              ))}
            </div>
          </div>

          {/* 渐变色背景 */}
          <div className={followTheme ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="font-medium text-text-primary mb-3">渐变色背景</h3>
            <div className="grid grid-cols-3 gap-3">
              {gradientColors.map((option) => (
                <ColorPreview
                  key={option.id}
                  option={option}
                  isSelected={!followTheme && backgroundColorId === option.id}
                  onClick={() => handleColorSelect(option)}
                />
              ))}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-between pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              重置为默认
            </Button>
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BoardColorPicker;
