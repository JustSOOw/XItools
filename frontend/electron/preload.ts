/**
 * Electron预加载脚本
 * 在渲染进程中提供安全的API接口
 */

import { contextBridge, ipcRenderer } from 'electron';

// 暴露给渲染进程的API
const electronAPI = {
  // 获取应用信息
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppName: () => ipcRenderer.invoke('app-name'),
  
  // 平台信息
  platform: process.platform,
  
  // 环境信息
  isElectron: true,
};

// 通过contextBridge安全地暴露API
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明（用于TypeScript）
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
