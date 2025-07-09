/*
 * @Author: XItools Team
 * @Date: 2025-06-30 16:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 16:00:00
 * @FilePath: \XItools\frontend\src\services\BaseApiService.ts
 * @Description: API服务基类
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import { apiService, ApiService, ApiError } from '../utils/apiClient';
import { log } from '../utils/env';

/**
 * API服务基类
 * 提供通用的API操作方法和错误处理
 */
export abstract class BaseApiService {
  protected apiService: ApiService;

  constructor(apiServiceInstance: ApiService = apiService) {
    this.apiService = apiServiceInstance;
  }

  /**
   * 处理服务器不可用错误
   */
  protected isServerUnavailableError(error: any): boolean {
    if (error instanceof ApiError) {
      return error.status >= 500 || error.status === 0;
    }
    
    // 检查网络错误
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return true;
    }
    
    return false;
  }

  /**
   * 安全的API调用 - 服务器不可用时返回默认值
   */
  protected async safeApiCall<T>(
    apiCall: () => Promise<T>,
    defaultValue: T,
    errorMessage: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      log.error(errorMessage, error);
      
      if (this.isServerUnavailableError(error)) {
        log.warn('服务器不可用，返回默认值');
        return defaultValue;
      }
      
      throw error;
    }
  }

  /**
   * 批量API调用
   */
  protected async batchApiCall<T>(
    apiCalls: (() => Promise<T>)[],
    options: {
      failFast?: boolean; // 是否在第一个失败时停止
      defaultValue?: T; // 失败时的默认值
    } = {}
  ): Promise<T[]> {
    const { failFast = false, defaultValue } = options;
    const results: T[] = [];

    for (const apiCall of apiCalls) {
      try {
        const result = await apiCall();
        results.push(result);
      } catch (error) {
        if (failFast) {
          throw error;
        }
        
        if (defaultValue !== undefined) {
          results.push(defaultValue);
        } else {
          log.error('批量API调用中的单个请求失败:', error);
          // 继续执行其他请求
        }
      }
    }

    return results;
  }

  /**
   * 并行API调用
   */
  protected async parallelApiCall<T>(
    apiCalls: (() => Promise<T>)[],
    options: {
      maxConcurrency?: number; // 最大并发数
      defaultValue?: T; // 失败时的默认值
    } = {}
  ): Promise<T[]> {
    const { maxConcurrency = 5, defaultValue } = options;
    
    // 如果并发数限制大于等于调用数，直接并行执行
    if (maxConcurrency >= apiCalls.length) {
      const promises = apiCalls.map(async (apiCall) => {
        try {
          return await apiCall();
        } catch (error) {
          if (defaultValue !== undefined) {
            return defaultValue;
          }
          throw error;
        }
      });
      
      return Promise.all(promises);
    }

    // 分批执行
    const results: T[] = [];
    for (let i = 0; i < apiCalls.length; i += maxConcurrency) {
      const batch = apiCalls.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(async (apiCall) => {
        try {
          return await apiCall();
        } catch (error) {
          if (defaultValue !== undefined) {
            return defaultValue;
          }
          throw error;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 重试API调用
   */
  protected async retryApiCall<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await apiCall();
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
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    
    throw lastError;
  }

  /**
   * 分页API调用
   */
  protected async paginatedApiCall<T>(
    apiCall: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
    pageSize: number = 20,
    maxPages?: number
  ): Promise<T[]> {
    const allData: T[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && (!maxPages || page <= maxPages)) {
      try {
        const result = await apiCall(page, pageSize);
        allData.push(...result.data);
        hasMore = result.hasMore;
        page++;
      } catch (error) {
        log.error(`分页API调用失败 (页码: ${page}):`, error);
        break;
      }
    }

    return allData;
  }

  /**
   * 缓存API调用结果
   */
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  protected async cachedApiCall<T>(
    cacheKey: string,
    apiCall: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 默认5分钟缓存
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    // 检查缓存是否有效
    if (cached && (now - cached.timestamp) < cached.ttl) {
      log.debug('使用缓存数据:', cacheKey);
      return cached.data;
    }

    // 调用API并缓存结果
    try {
      const data = await apiCall();
      this.cache.set(cacheKey, { data, timestamp: now, ttl });
      return data;
    } catch (error) {
      // 如果API调用失败且有过期缓存，返回过期缓存
      if (cached) {
        log.warn('API调用失败，使用过期缓存:', cacheKey);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * 清除缓存
   */
  protected clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取缓存统计信息
   */
  protected getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * GET请求
   */
  protected async get<T = any>(url: string, config?: any): Promise<T> {
    return this.apiService.get<T>(url, config);
  }

  /**
   * POST请求
   */
  protected async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.apiService.post<T>(url, data, config);
  }

  /**
   * PUT请求
   */
  protected async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.apiService.put<T>(url, data, config);
  }

  /**
   * DELETE请求
   */
  protected async delete<T = any>(url: string, config?: any): Promise<T> {
    return this.apiService.delete<T>(url, config);
  }

  /**
   * PATCH请求
   */
  protected async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.apiService.patch<T>(url, data, config);
  }
}

export default BaseApiService;
