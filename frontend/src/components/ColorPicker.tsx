import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

interface ColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
  isOpen: boolean;
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

// 预设颜色方案
const PRESET_COLORS = {
  // 柔和色调 - 适合看板使用
  soft: [
    '#E3F2FD', // 浅蓝
    '#E8F5E8', // 浅绿
    '#F3E5F5', // 浅紫
    '#FFF3E0', // 浅橙
    '#FCE4EC', // 浅粉
    '#F1F8E9', // 浅青绿
    '#FFF8E1', // 浅黄
    '#EFEBE9', // 浅棕
  ],
  // 鲜明色彩 - 高对比度
  vibrant: [
    '#2196F3', // 蓝色
    '#4CAF50', // 绿色
    '#9C27B0', // 紫色
    '#FF9800', // 橙色
    '#E91E63', // 粉色
    '#00BCD4', // 青色
    '#FFEB3B', // 黄色
    '#795548', // 棕色
  ],
  // 中性色调
  neutral: [
    '#F5F5F5', // 浅灰
    '#EEEEEE', // 灰白
    '#E0E0E0', // 中灰
    '#BDBDBD', // 深灰
    '#9E9E9E', // 灰色
    '#757575', // 深灰
    '#616161', // 暗灰
    '#424242', // 深暗灰
  ],
};

// 渐变色方案
const GRADIENT_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 紫蓝渐变
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // 粉红渐变
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // 蓝青渐变
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  onColorChange,
  onClose,
  isOpen,
  placement = 'bottom-right',
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [customColor, setCustomColor] = useState(currentColor || '#ffffff');
  const pickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const placementClasses = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
  };

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onClose();
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  const clearColor = () => {
    onColorChange('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className={classNames(
        'absolute z-50 bg-surface border border-border rounded-lg shadow-lg p-4 w-80',
        'animate-in fade-in-0 zoom-in-95 duration-100',
        placementClasses[placement]
      )}
    >
      {/* 标题和关闭按钮 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">选择颜色</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex mb-3 border-b border-border">
        <button
          onClick={() => setActiveTab('preset')}
          className={classNames(
            'px-3 py-1 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'preset'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          预设颜色
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={classNames(
            'px-3 py-1 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'custom'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          自定义
        </button>
      </div>

      {/* 内容区 */}
      {activeTab === 'preset' ? (
        <div className="space-y-4">
          {/* 清除颜色选项 */}
          <div>
            <button
              onClick={clearColor}
              className="w-full p-2 border border-dashed border-gray-300 rounded text-sm text-text-secondary hover:bg-black/5 transition-colors"
            >
              清除颜色
            </button>
          </div>

          {/* 柔和色调 */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-2">柔和色调</h4>
            <div className="grid grid-cols-8 gap-1">
              {PRESET_COLORS.soft.map((color, index) => (
                <button
                  key={`soft-${index}`}
                  onClick={() => handleColorSelect(color)}
                  className={classNames(
                    'w-6 h-6 rounded border-2 transition-all hover:scale-110',
                    currentColor === color ? 'border-primary' : 'border-gray-200'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* 鲜明色彩 */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-2">鲜明色彩</h4>
            <div className="grid grid-cols-8 gap-1">
              {PRESET_COLORS.vibrant.map((color, index) => (
                <button
                  key={`vibrant-${index}`}
                  onClick={() => handleColorSelect(color)}
                  className={classNames(
                    'w-6 h-6 rounded border-2 transition-all hover:scale-110',
                    currentColor === color ? 'border-primary' : 'border-gray-200'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* 中性色调 */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-2">中性色调</h4>
            <div className="grid grid-cols-8 gap-1">
              {PRESET_COLORS.neutral.map((color, index) => (
                <button
                  key={`neutral-${index}`}
                  onClick={() => handleColorSelect(color)}
                  className={classNames(
                    'w-6 h-6 rounded border-2 transition-all hover:scale-110',
                    currentColor === color ? 'border-primary' : 'border-gray-200'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* 渐变色 */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-2">渐变色</h4>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_COLORS.map((gradient, index) => (
                <button
                  key={`gradient-${index}`}
                  onClick={() => handleColorSelect(gradient)}
                  className={classNames(
                    'w-full h-8 rounded border-2 transition-all hover:scale-105',
                    currentColor === gradient ? 'border-primary' : 'border-gray-200'
                  )}
                  style={{ background: gradient }}
                  title={gradient}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 自定义颜色选择器 */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              自定义颜色
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-12 h-8 border border-border rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                onBlur={() => onColorChange(customColor)}
                className="flex-1 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="#ffffff"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleColorSelect(customColor)}
              className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors"
            >
              应用颜色
            </button>
            <button
              onClick={clearColor}
              className="px-3 py-2 border border-border rounded text-sm hover:bg-black/5 transition-colors"
            >
              清除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
