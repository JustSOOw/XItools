/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\utils\axiosConfig.ts
 * @Description: Axios配置和拦截器设置
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService } from '../services/authService';
import { useUserStore } from '../store/userStore';
import { LoginStatus } from '../types/User';

// 请求队列，用于处理token刷新期间的请求
interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  config: AxiosRequestConfig;
}

let isRefreshing = false;
let pendingRequests: PendingRequest[] = [];

/**
 * 设置axios拦截器
 */
export function setupAxiosInterceptors() {
  // 请求拦截器 - 自动添加认证头
  axios.interceptors.request.use(
    (config) => {
      // 获取token
      const token = authService.getToken();

      // 如果有token且不是认证相关的请求，添加Authorization头
      if (token && !isAuthRequest(config.url || '')) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 设置默认的Content-Type
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }

      return config;
    },
    (error) => {
      console.error('请求拦截器错误:', error);
      return Promise.reject(error);
    },
  );

  // 响应拦截器 - 处理认证错误和token刷新
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // 如果是401错误且不是认证请求
      if (error.response?.status === 401 && !isAuthRequest(originalRequest.url || '')) {
        // 如果已经重试过，直接登出
        if (originalRequest._retry) {
          handleAuthError();
          return Promise.reject(error);
        }

        // 标记为已重试
        originalRequest._retry = true;

        // 如果正在刷新token，将请求加入队列
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingRequests.push({
              resolve,
              reject,
              config: originalRequest,
            });
          });
        }

        // 尝试刷新token
        isRefreshing = true;

        try {
          const newToken = await authService.refreshToken();

          if (newToken) {
            // 刷新成功，重新发送原请求
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // 处理队列中的请求
            processPendingRequests(newToken);

            return axios(originalRequest);
          } else {
            // 刷新失败，登出用户
            handleAuthError();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error('刷新token失败:', refreshError);
          handleAuthError();
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      // 处理其他错误
      return Promise.reject(error);
    },
  );
}

/**
 * 处理队列中的待处理请求
 */
function processPendingRequests(token: string) {
  pendingRequests.forEach(({ resolve, reject, config }) => {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;

    axios(config).then(resolve).catch(reject);
  });

  pendingRequests = [];
}

/**
 * 处理认证错误
 */
function handleAuthError() {
  const userStore = useUserStore.getState();

  // 设置用户状态为token过期
  userStore.setLoginStatus(LoginStatus.TOKEN_EXPIRED);
  userStore.setUser(null);

  // 清除本地存储的认证数据
  authService.logout();

  // 清空待处理请求队列
  pendingRequests.forEach(({ reject }) => {
    reject(new Error('认证已过期，请重新登录'));
  });
  pendingRequests = [];
}

/**
 * 检查是否是认证相关的请求
 */
function isAuthRequest(url: string): boolean {
  const authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/verify',
  ];

  return authPaths.some((path) => url.includes(path));
}

/**
 * 创建带有认证头的axios实例
 */
export function createAuthenticatedAxios() {
  const instance = axios.create();

  // 为实例设置请求拦截器
  instance.interceptors.request.use(
    (config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * 检查网络连接状态
 */
export function checkNetworkStatus(): boolean {
  return navigator.onLine;
}

/**
 * 网络状态监听器
 */
export function setupNetworkStatusListener() {
  const handleOnline = () => {
    console.log('网络连接已恢复');
    // 可以在这里添加重新连接的逻辑
  };

  const handleOffline = () => {
    console.log('网络连接已断开');
    // 可以在这里添加离线处理逻辑
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * 请求重试工具函数
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // 如果是最后一次重试，直接抛出错误
      if (i === maxRetries) {
        break;
      }

      // 如果是认证错误，不进行重试
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        break;
      }

      // 等待指定时间后重试
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
}

export default {
  setupAxiosInterceptors,
  createAuthenticatedAxios,
  checkNetworkStatus,
  setupNetworkStatusListener,
  retryRequest,
};
