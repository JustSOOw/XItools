/**
 * i18n TypeScript 类型定义
 * 提供完整的类型安全支持
 */

// 翻译资源类型（基于实际的资源结构）
export interface TranslationResources {
  common: {
    loading: {
      text: string;
    };
    app: {
      name: string;
      title: string;
    };
    feedback: {
      success: string;
      error: string;
      warning: string;
      info: string;
    };
    settings: string;
  };
  auth: {
    brand: {
      title: string;
      subtitle: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
      highlight1: {
        title: string;
        desc: string;
      };
      highlight2: {
        title: string;
        desc: string;
      };
    };
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      submit: string;
      forgotPassword: string;
      noAccount: string;
      signUp: string;
      rememberMe: string;
    };
    register: {
      title: string;
      subtitle: string;
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
      submit: string;
      hasAccount: string;
      signIn: string;
      terms: string;
      privacy: string;
      agree: string;
    };
    [key: string]: any;
  };
}

// 命名空间类型
export type Namespace = keyof TranslationResources;

// 翻译键类型（深度嵌套）
export type TranslationKey<T = TranslationResources> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? `${K & string}.${TranslationKey<T[K]> & string}`
    : K & string;
}[keyof T];

// 特定命名空间的翻译键类型
export type NamespaceKey<NS extends Namespace> = TranslationKey<TranslationResources[NS]>;

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'en-US';

// 语言配置类型
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
  rtl?: boolean;
}

// i18n 配置类型
export interface I18nConfig {
  defaultLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  debug?: boolean;
  saveMissing?: boolean;
  interpolation?: {
    escapeValue?: boolean;
    prefix?: string;
    suffix?: string;
  };
  detection?: {
    order?: string[];
    caches?: string[];
    lookupLocalStorage?: string;
    checkWhitelist?: boolean;
  };
}

// 翻译函数类型
export interface TranslationFunction {
  // 基础翻译
  (key: TranslationKey): string;
  (key: TranslationKey, options?: Record<string, any>): string;

  // 带命名空间的翻译
  <NS extends Namespace>(key: `${NS}:${NamespaceKey<NS>}`): string;
  <NS extends Namespace>(key: `${NS}:${NamespaceKey<NS>}`, options?: Record<string, any>): string;

  // 复数形式
  (key: TranslationKey, count: number): string;
  (key: TranslationKey, count: number, options?: Record<string, any>): string;
}

// 语言切换函数类型
export interface LanguageChanger {
  (language: SupportedLanguage): Promise<void>;
}

// i18n Hook 返回类型
export interface UseTranslationReturn {
  t: TranslationFunction;
  i18n: {
    language: SupportedLanguage;
    changeLanguage: LanguageChanger;
    exists: (key: TranslationKey) => boolean;
    getFixedT: (lng?: SupportedLanguage, ns?: Namespace) => TranslationFunction;
  };
  ready: boolean;
}

// 语言检测结果类型
export interface LanguageDetectionResult {
  language: SupportedLanguage;
  source: 'localStorage' | 'navigator' | 'htmlTag' | 'path' | 'subdomain' | 'default';
  confidence: number;
}

// 翻译插值选项类型
export interface InterpolationOptions {
  count?: number;
  context?: string;
  defaultValue?: string;
  fallbackKey?: TranslationKey;
  lng?: SupportedLanguage;
  ns?: Namespace;
  replace?: Record<string, string | number>;
  returnObjects?: boolean;
  joinArrays?: string;
  postProcess?: string | string[];
  keySeparator?: string;
  nsSeparator?: string;
}

// 翻译错误类型
export interface TranslationError {
  key: TranslationKey;
  namespace?: Namespace;
  language: SupportedLanguage;
  message: string;
  type: 'missing' | 'invalid' | 'interpolation' | 'namespace';
}

// 翻译统计类型
export interface TranslationStats {
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  coverage: number;
  lastUpdated: Date;
}

// 语言包元数据类型
export interface LanguagePackMeta {
  language: SupportedLanguage;
  version: string;
  author: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  size: number;
  checksum: string;
}

// 翻译上下文类型
export interface TranslationContext {
  component?: string;
  page?: string;
  feature?: string;
  user?: {
    id: string;
    language: SupportedLanguage;
    preferences: Record<string, any>;
  };
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
}

// 动态翻译加载器类型
export interface DynamicTranslationLoader {
  load: (language: SupportedLanguage, namespace: Namespace) => Promise<Record<string, any>>;
  preload: (languages: SupportedLanguage[], namespaces: Namespace[]) => Promise<void>;
  cache: Map<string, Record<string, any>>;
}

// 翻译验证器类型
export interface TranslationValidator {
  validate: (translations: Record<string, any>) => TranslationError[];
  validateKey: (key: TranslationKey, value: any) => boolean;
  validateInterpolation: (template: string, variables: Record<string, any>) => boolean;
}

// 翻译格式化器类型
export interface TranslationFormatter {
  formatDate: (date: Date, format?: string, language?: SupportedLanguage) => string;
  formatTime: (time: Date, format?: string, language?: SupportedLanguage) => string;
  formatNumber: (
    number: number,
    options?: Intl.NumberFormatOptions,
    language?: SupportedLanguage,
  ) => string;
  formatCurrency: (amount: number, currency?: string, language?: SupportedLanguage) => string;
  formatRelativeTime: (date: Date, language?: SupportedLanguage) => string;
}

// 导出所有类型
export type { zhCN as ZhCNTranslations, enUS as EnUSTranslations };

// 默认导出主要类型
export default TranslationResources;
