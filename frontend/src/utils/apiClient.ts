/*
 * @Author: XItools Team
 * @Date: 2025-06-30 16:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 16:00:00
 * @FilePath: \XItools\frontend\src\utils\apiClient.ts
 * @Description: 统一的API客户端配置
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from '../services/authService';
import { getBackendUrl, getApiTimeout, log } from './env';

// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API错误类型
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// 请求配置接口
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean; // 跳过认证
  skipErrorHandling?: boolean; // 跳过统一错误处理
  retryCount?: number; // 重试次数
}

/**
 * 创建认证API客户端
 */
export function createApiClient(baseURL?: string): AxiosInstance {
  const client = axios.create({
    baseURL: baseURL || `${getBackendUrl()}/api`,
    timeout: getApiTimeout(),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // 请求拦截器
  client.interceptors.request.use(
    (config: RequestConfig) => {
      // 添加认证头（除非明确跳过）
      if (!config.skipAuth) {
        const token = authService.getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // 记录请求日志
      log.debug('API请求:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
      });

      return config;
    },
    (error) => {
      log.error('请求拦截器错误:', error);
      return Promise.reject(error);
    },
  );

  // 响应拦截器
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // 记录响应日志
      log.debug('API响应:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });

      return response;
    },
    async (error) => {
      const config = error.config as RequestConfig;

      // 记录错误日志
      log.error('API响应错误:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });

      // 如果跳过错误处理，直接抛出
      if (config?.skipErrorHandling) {
        return Promise.reject(error);
      }

      // 处理认证错误
      if (error.response?.status === 401 && !config?.skipAuth) {
        // 这里不处理token刷新，由全局拦截器处理
        return Promise.reject(new ApiError('认证失败，请重新登录', 401, 'UNAUTHORIZED'));
      }

      // 处理权限错误
      if (error.response?.status === 403) {
        return Promise.reject(new ApiError('权限不足', 403, 'FORBIDDEN'));
      }

      // 处理服务器错误
      if (error.response?.status >= 500) {
        // 尝试从响应中提取具体错误消息
        const serverErrorMessage =
          error.response.data?.error || error.response.data?.message || '服务器内部错误';
        return Promise.reject(
          new ApiError(
            serverErrorMessage,
            error.response.status,
            'SERVER_ERROR',
            error.response.data,
          ),
        );
      }

      // 处理客户端错误
      if (error.response?.status >= 400) {
        const errorMessage =
          error.response.data?.error || error.response.data?.message || '请求失败';
        return Promise.reject(
          new ApiError(errorMessage, error.response.status, 'CLIENT_ERROR', error.response.data),
        );
      }

      // 处理网络错误
      if (!error.response) {
        return Promise.reject(new ApiError('网络连接失败', 0, 'NETWORK_ERROR'));
      }

      return Promise.reject(error);
    },
  );

  return client;
}

/**
 * 默认API客户端实例
 */
export const apiClient = createApiClient();

/**
 * 创建MCP客户端
 */
export function createMcpClient(): AxiosInstance {
  return createApiClient(`${getBackendUrl()}/mcp`);
}

/**
 * MCP客户端实例
 */
export const mcpClient = createMcpClient();

/**
 * 统一的API请求方法
 */
export class ApiService {
  constructor(private client: AxiosInstance = apiClient) {}

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return this.handleResponse(response);
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return this.handleResponse(response);
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * 处理API响应
   */
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    const { data } = response;

    // 检查业务逻辑成功状态
    if (data.success === false) {
      throw new ApiError(
        data.error || data.message || '请求失败',
        response.status,
        'BUSINESS_ERROR',
        data,
      );
    }

    // 返回数据部分
    return data.data as T;
  }

  /**
   * 带重试的请求
   */
  async requestWithRetry<T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    dataOrConfig?: any,
    config?: RequestConfig,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        switch (method) {
          case 'get':
            return await this.get<T>(url, dataOrConfig);
          case 'post':
            return await this.post<T>(url, dataOrConfig, config);
          case 'put':
            return await this.put<T>(url, dataOrConfig, config);
          case 'delete':
            return await this.delete<T>(url, dataOrConfig);
          case 'patch':
            return await this.patch<T>(url, dataOrConfig, config);
          default:
            throw new Error(`不支持的请求方法: ${method}`);
        }
      } catch (error) {
        lastError = error;

        // 如果是认证错误或客户端错误，不重试
        if (error instanceof ApiError && error.status < 500) {
          break;
        }

        // 如果是最后一次重试，直接抛出错误
        if (i === maxRetries) {
          break;
        }

        // 等待一段时间后重试
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    throw lastError;
  }
}

/**
 * 默认API服务实例
 */
export const apiService = new ApiService();

/**
 * MCP API服务实例
 */
export const mcpApiService = new ApiService(mcpClient);
