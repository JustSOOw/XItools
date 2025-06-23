/**
 * Electron工具函数
 */

import { app } from 'electron';

/**
 * 判断是否为开发环境
 */
export const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * 获取应用版本
 */
export const getAppVersion = (): string => {
  return app.getVersion();
};

/**
 * 获取应用名称
 */
export const getAppName = (): string => {
  return app.getName();
};
