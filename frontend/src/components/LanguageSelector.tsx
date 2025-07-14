/**
 * 语言选择器组件
 * 提供语言切换功能，支持下拉选择和快速切换
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supportedLanguages, type SupportedLanguage } from '../i18n';

// 语言配置
const languageConfigs = {
  'zh-CN': {
    name: '中文',
    nativeName: '中文',
    flag: '🇨🇳',
  },
  'en-US': {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
} as const;

interface LanguageSelectorProps {
  /** 显示模式 */
  variant?: 'dropdown' | 'toggle' | 'compact';
  /** 是否显示语言名称 */
  showName?: boolean;
  /** 是否显示国旗 */
  showFlag?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 点击回调 */
  onChange?: (language: SupportedLanguage) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  showName = true,
  showFlag = true,
  className = '',
  onChange,
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language as SupportedLanguage;
  const currentConfig = languageConfigs[currentLanguage];

  // 处理语言切换
  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(language);
      onChange?.(language);
      setIsOpen(false);
    } catch (error) {
      console.error('语言切换失败:', error);
    }
  };

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 切换模式：直接在两种语言间切换
  if (variant === 'toggle') {
    const otherLanguage = currentLanguage === 'zh-CN' ? 'en-US' : 'zh-CN';
    const otherConfig = languageConfigs[otherLanguage];

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleLanguageChange(otherLanguage)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors duration-200
          ${className}
        `}
        title={`切换到 ${otherConfig.name}`}
      >
        {showFlag && <span className="text-lg">{otherConfig.flag}</span>}
        {showName && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {otherConfig.nativeName}
          </span>
        )}
      </motion.button>
    );
  }

  // 紧凑模式：只显示国旗或语言代码
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="
            w-8 h-8 rounded-full flex items-center justify-center
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700
            hover:bg-gray-50 dark:hover:bg-gray-700
            transition-colors duration-200
          "
          title={currentConfig.name}
        >
          {showFlag ? (
            <span className="text-sm">{currentConfig.flag}</span>
          ) : (
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
              {currentLanguage.split('-')[0].toUpperCase()}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="
                absolute top-full right-0 mt-2 py-1
                bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700
                rounded-lg shadow-lg z-50
                min-w-[120px]
              "
            >
              {Object.entries(languageConfigs).map(([code, config]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as SupportedLanguage)}
                  className={`
                    w-full px-3 py-2 text-left flex items-center gap-2
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    transition-colors duration-150
                    ${code === currentLanguage ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <span className="text-sm">{config.flag}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {config.nativeName}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 下拉模式（默认）
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors duration-200
          min-w-[120px]
        "
      >
        {showFlag && <span className="text-lg">{currentConfig.flag}</span>}
        {showName && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
            {currentConfig.nativeName}
          </span>
        )}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full left-0 mt-2 py-1
              bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-lg z-50
              w-full
            "
          >
            {Object.entries(languageConfigs).map(([code, config]) => (
              <motion.button
                key={code}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => handleLanguageChange(code as SupportedLanguage)}
                className={`
                  w-full px-3 py-2 text-left flex items-center gap-2
                  transition-colors duration-150
                  ${
                    code === currentLanguage
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <span className="text-lg">{config.flag}</span>
                <span className="text-sm font-medium">{config.nativeName}</span>
                {code === currentLanguage && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
