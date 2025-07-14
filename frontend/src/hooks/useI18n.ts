/**
 * 自定义 i18n Hook
 * 提供类型安全的翻译功能和语言管理
 */

import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import type {
  SupportedLanguage,
  TranslationKey,
  Namespace,
  InterpolationOptions,
  TranslationFunction,
} from '../i18n/types';

/**
 * 增强的 i18n Hook
 * 提供类型安全的翻译功能
 */
export function useI18n(namespace?: Namespace) {
  const { t: originalT, i18n, ready } = useTranslation(namespace);

  // 类型安全的翻译函数
  const t: TranslationFunction = useCallback(
    (key: TranslationKey | string, options?: InterpolationOptions | number) => {
      if (typeof options === 'number') {
        return originalT(key, { count: options });
      }
      return originalT(key, options);
    },
    [originalT],
  );

  // 语言切换函数
  const changeLanguage = useCallback(
    async (language: SupportedLanguage) => {
      try {
        await i18n.changeLanguage(language);
        // 触发自定义事件，通知其他组件语言已切换
        window.dispatchEvent(
          new CustomEvent('languageChanged', {
            detail: { language },
          }),
        );
      } catch (error) {
        console.error('语言切换失败:', error);
        throw error;
      }
    },
    [i18n],
  );

  // 当前语言
  const currentLanguage = useMemo(() => i18n.language as SupportedLanguage, [i18n.language]);

  // 检查翻译键是否存在
  const exists = useCallback((key: TranslationKey) => i18n.exists(key), [i18n]);

  // 获取固定语言的翻译函数
  const getFixedT = useCallback(
    (language?: SupportedLanguage, ns?: Namespace) => {
      const fixedT = i18n.getFixedT(language, ns);
      return (key: TranslationKey, options?: InterpolationOptions) => fixedT(key, options);
    },
    [i18n],
  );

  // 格式化相对时间
  const formatRelativeTime = useCallback(
    (date: Date) => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return t('common:time.now');
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return t('common:time.minutesAgo', { count: minutes });
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return t('common:time.hoursAgo', { count: hours });
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return t('common:time.daysAgo', { count: days });
      } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return t('common:time.weeksAgo', { count: weeks });
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return t('common:time.monthsAgo', { count: months });
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return t('common:time.yearsAgo', { count: years });
      }
    },
    [t],
  );

  // 格式化日期
  const formatDate = useCallback(
    (date: Date, format: 'short' | 'medium' | 'long' | 'full' = 'medium') => {
      const options: Intl.DateTimeFormatOptions = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        medium: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      }[format];

      return new Intl.DateTimeFormat(currentLanguage, options).format(date);
    },
    [currentLanguage],
  );

  // 格式化时间
  const formatTime = useCallback(
    (date: Date, format: 'short' | 'medium' = 'short') => {
      const options: Intl.DateTimeFormatOptions = {
        short: { hour: '2-digit', minute: '2-digit' },
        medium: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
      }[format];

      return new Intl.DateTimeFormat(currentLanguage, options).format(date);
    },
    [currentLanguage],
  );

  // 格式化数字
  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    },
    [currentLanguage],
  );

  // 格式化货币
  const formatCurrency = useCallback(
    (amount: number, currency = 'CNY') => {
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency,
      }).format(amount);
    },
    [currentLanguage],
  );

  // 获取语言方向
  const isRTL = useMemo(() => {
    // 目前支持的语言都是从左到右，如果以后支持阿拉伯语等，可以在这里添加
    return false;
  }, [currentLanguage]);

  return {
    // 核心翻译功能
    t,

    // 语言管理
    currentLanguage,
    changeLanguage,
    isRTL,

    // 工具函数
    exists,
    getFixedT,

    // 格式化函数
    formatRelativeTime,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,

    // 状态
    ready,

    // 原始 i18n 实例（用于高级用法）
    i18n,
  };
}

/**
 * 命名空间特定的 Hook
 */
export function useTaskTranslation() {
  return useI18n('task');
}

export function useBoardTranslation() {
  return useI18n('board');
}

export function useCalendarTranslation() {
  return useI18n('calendar');
}

export function useSettingsTranslation() {
  return useI18n('settings');
}

export function useFeedbackTranslation() {
  return useI18n('feedback');
}

/**
 * 语言检测 Hook
 */
export function useLanguageDetection() {
  const { i18n } = useI18n();

  const detectLanguage = useCallback(() => {
    // 检测浏览器语言
    const browserLanguage = navigator.language;
    const supportedLanguages: SupportedLanguage[] = ['zh-CN', 'en-US'];

    // 精确匹配
    if (supportedLanguages.includes(browserLanguage as SupportedLanguage)) {
      return browserLanguage as SupportedLanguage;
    }

    // 语言代码匹配（如 'zh' 匹配 'zh-CN'）
    const languageCode = browserLanguage.split('-')[0];
    const matchedLanguage = supportedLanguages.find((lang) => lang.startsWith(languageCode));

    return matchedLanguage || 'zh-CN';
  }, []);

  const applyDetectedLanguage = useCallback(async () => {
    const detectedLanguage = detectLanguage();
    if (detectedLanguage !== i18n.language) {
      await i18n.changeLanguage(detectedLanguage);
    }
    return detectedLanguage;
  }, [detectLanguage, i18n]);

  return {
    detectLanguage,
    applyDetectedLanguage,
  };
}

/**
 * 翻译加载状态 Hook
 */
export function useTranslationLoading() {
  const { ready } = useI18n();

  return {
    isLoading: !ready,
    isReady: ready,
  };
}

export default useI18n;
