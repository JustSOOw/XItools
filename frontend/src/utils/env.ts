/**
 * 环境配置工具函数
 * 统一管理前端应用的环境变量获取逻辑
 */

// 环境类型定义
export type Environment = 'development' | 'production' | 'local';

// 环境配置接口
export interface EnvConfig {
  appName: string;
  appVersion: string;
  nodeEnv: Environment;
  backendUrl: string;
  apiTimeout: number;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  backupBackendUrl?: string;
}

/**
 * 获取当前环境类型
 */
export const getCurrentEnvironment = (): Environment => {
  // 优先使用 VITE_NODE_ENV，然后是 NODE_ENV，最后是 MODE
  const viteEnv = import.meta.env.VITE_NODE_ENV;
  const nodeEnv = import.meta.env.NODE_ENV;
  const mode = import.meta.env.MODE;
  
  if (viteEnv && ['development', 'production', 'local'].includes(viteEnv)) {
    return viteEnv as Environment;
  }
  
  if (nodeEnv === 'production') return 'production';
  if (mode === 'production') return 'production';
  
  return 'development';
};

/**
 * 获取后端服务地址
 * 统一的后端URL获取逻辑，消除重复代码
 */
export const getBackendUrl = (): string => {
  const env = getCurrentEnvironment();
  
  // 优先使用环境变量中的配置
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl) {
    console.log(`[${env}] 使用配置的后端地址:`, backendUrl);
    return backendUrl;
  }
  
  // 如果没有配置，使用默认值
  const defaultUrl = 'http://localhost:3000';
  console.log(`[${env}] 使用默认后端地址:`, defaultUrl);
  return defaultUrl;
};

/**
 * 获取备用后端服务地址
 */
export const getBackupBackendUrl = (): string | undefined => {
  return import.meta.env.VITE_BACKUP_BACKEND_URL;
};

/**
 * 获取完整的环境配置
 */
export const getEnvConfig = (): EnvConfig => {
  const env = getCurrentEnvironment();
  
  return {
    appName: import.meta.env.VITE_APP_NAME || 'XItools',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    nodeEnv: env,
    backendUrl: getBackendUrl(),
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || 'info',
    backupBackendUrl: getBackupBackendUrl(),
  };
};

/**
 * 检查是否为开发环境
 */
export const isDevelopment = (): boolean => {
  return getCurrentEnvironment() === 'development';
};

/**
 * 检查是否为生产环境
 */
export const isProduction = (): boolean => {
  return getCurrentEnvironment() === 'production';
};

/**
 * 检查是否为本地环境
 */
export const isLocal = (): boolean => {
  return getCurrentEnvironment() === 'local';
};

/**
 * 检查是否启用调试模式
 */
export const isDebugMode = (): boolean => {
  return import.meta.env.VITE_DEBUG_MODE === 'true';
};

/**
 * 获取API超时时间
 */
export const getApiTimeout = (): number => {
  return parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);
};

/**
 * 日志工具函数
 */
export const log = {
  debug: (...args: any[]) => {
    if (isDebugMode() || isDevelopment()) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};

// 在开发环境下打印环境配置信息
if (isDevelopment() || isDebugMode()) {
  const config = getEnvConfig();
  console.log('🔧 环境配置信息:', config);
}
