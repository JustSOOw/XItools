import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

interface ColorPickerModalProps {
  currentColor?: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
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

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  currentColor,
  onColorChange,
  onClose,
  isOpen,
  title = '选择颜色',
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [customColor, setCustomColor] = useState(currentColor || '#ffffff');

  // ESC键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onClose();
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
  };

  const applyCustomColor = () => {
    onColorChange(customColor);
    onClose();
  };

  const clearColor = () => {
    onColorChange('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div className="relative bg-surface border border-border rounded-lg shadow-xl w-96 max-w-[90vw] max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-4">
          {/* 标签页 */}
          <div className="flex mb-4 border-b border-border">
            <button
              onClick={() => setActiveTab('preset')}
              className={classNames(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
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
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'custom'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              )}
            >
              自定义
            </button>
          </div>

          {/* 内容区 */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'preset' ? (
              <div className="space-y-6">
                {/* 清除颜色选项 */}
                <div>
                  <button
                    onClick={clearColor}
                    className="w-full p-3 border border-dashed border-gray-300 rounded text-sm text-text-secondary hover:bg-black/5 transition-colors"
                  >
                    清除颜色
                  </button>
                </div>

                {/* 柔和色调 */}
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-3">柔和色调</h4>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.soft.map((color, index) => (
                      <button
                        key={`soft-${index}`}
                        onClick={() => handleColorSelect(color)}
                        className={classNames(
                          'w-8 h-8 rounded border-2 transition-all hover:scale-110',
                          currentColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* 鲜明色彩 */}
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-3">鲜明色彩</h4>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.vibrant.map((color, index) => (
                      <button
                        key={`vibrant-${index}`}
                        onClick={() => handleColorSelect(color)}
                        className={classNames(
                          'w-8 h-8 rounded border-2 transition-all hover:scale-110',
                          currentColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* 中性色调 */}
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-3">中性色调</h4>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.neutral.map((color, index) => (
                      <button
                        key={`neutral-${index}`}
                        onClick={() => handleColorSelect(color)}
                        className={classNames(
                          'w-8 h-8 rounded border-2 transition-all hover:scale-110',
                          currentColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* 渐变色 */}
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-3">渐变色</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {GRADIENT_COLORS.map((gradient, index) => (
                      <button
                        key={`gradient-${index}`}
                        onClick={() => handleColorSelect(gradient)}
                        className={classNames(
                          'w-full h-12 rounded border-2 transition-all hover:scale-105',
                          currentColor === gradient ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
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
                  <label className="block text-sm font-medium text-text-secondary mb-3">
                    自定义颜色
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={handleCustomColorChange}
                      className="w-16 h-12 border border-border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={applyCustomColor}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors"
                  >
                    应用颜色
                  </button>
                  <button
                    onClick={clearColor}
                    className="px-4 py-2 border border-border rounded text-sm hover:bg-black/5 transition-colors"
                  >
                    清除
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;
