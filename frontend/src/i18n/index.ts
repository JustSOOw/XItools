/**
 * i18n 国际化配置文件
 * 配置多语言支持，包括中文和英文
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译资源
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

// 支持的语言列表
export const supportedLanguages = {
  'zh-CN': '中文',
  'en-US': 'English',
  // 添加简化的语言代码映射
  'zh': '中文',
  'en': 'English',
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// 默认语言
export const defaultLanguage: SupportedLanguage = 'zh-CN';

// 初始化 i18next
i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 传递 i18n 实例给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    // 调试模式（开发环境启用）
    debug: process.env.NODE_ENV === 'development',
    
    // 默认语言
    fallbackLng: defaultLanguage,
    
    // 支持的语言
    supportedLngs: ['zh-CN', 'en-US', 'zh', 'en'],
    
    // 语言检测配置
    detection: {
      // 检测顺序：localStorage -> navigator -> htmlTag -> path -> subdomain
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

      // 缓存用户语言偏好
      caches: ['localStorage'],

      // localStorage 键名
      lookupLocalStorage: 'xitools-language',

      // 检查所有支持的语言
      checkWhitelist: true,
    },
    
    // 插值配置
    interpolation: {
      // React 已经默认转义了，不需要额外转义
      escapeValue: false,
    },
    
    // 翻译资源
    resources: {
      'zh-CN': zhCN,
      'en-US': enUS,
      // 为简化的语言代码添加相同的翻译资源
      'zh': zhCN,
      'en': enUS,
    },
    
    // 命名空间配置
    defaultNS: 'common',
    ns: ['common', 'task', 'board', 'calendar', 'settings', 'feedback', 'error'],
    
    // 返回对象而不是字符串（用于复杂翻译）
    returnObjects: true,
    
    // 键分隔符
    keySeparator: '.',
    
    // 命名空间分隔符
    nsSeparator: ':',
    
    // 复数规则
    pluralSeparator: '_',
    
    // 上下文分隔符
    contextSeparator: '_',
    
    // 后备键
    saveMissing: process.env.NODE_ENV === 'development',
    
    // 缺失键处理
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${ns}:${key} for language: ${lng}`);
      }
    },
  });

// 语言规范化函数
const normalizeLanguage = (lng: string): SupportedLanguage => {
  if (lng === 'zh' || lng.startsWith('zh-')) {
    return 'zh-CN';
  }
  if (lng === 'en' || lng.startsWith('en-')) {
    return 'en-US';
  }
  return defaultLanguage;
};

// 在初始化完成后，规范化当前语言
i18n.on('initialized', () => {
  const currentLng = i18n.language;
  const normalizedLng = normalizeLanguage(currentLng);

  if (currentLng !== normalizedLng) {
    i18n.changeLanguage(normalizedLng);
  }
});

// 监听语言变化，确保始终使用规范化的语言代码
i18n.on('languageChanged', (lng: string) => {
  const normalizedLng = normalizeLanguage(lng);

  if (lng !== normalizedLng && i18n.language === lng) {
    // 避免无限循环，只在当前语言确实是非规范化语言时才切换
    setTimeout(() => {
      i18n.changeLanguage(normalizedLng);
    }, 0);
  }
});

export default i18n;
