/**
 * API密钥管理服务
 *
 * 提供API密钥的CRUD操作和管理功能
 */

import { apiService } from '../utils/apiClient';
import { log } from '../utils/env';

export interface ApiKeyPermission {
  MCP_READ: 'mcp:read';
  MCP_WRITE: 'mcp:write';
  MCP_ADMIN: 'mcp:admin';
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: string | null;
  lastUsedIp?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyData {
  name: string;
  permissions: string[];
  expiresAt?: string | null;
}

export interface CreateApiKeyResponse {
  success: true;
  data: {
    id: string;
    name: string;
    apiKey: string; // 完整密钥，仅在创建时返回
    keyPrefix: string;
    permissions: string[];
    expiresAt?: string | null;
    createdAt: string;
  };
}

export interface ApiKeyUsageStats {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  lastUsedAt?: string | null;
  mostUsedTool?: string;
}

export interface UsageLog {
  id: string;
  toolName: string;
  responseStatus: number;
  errorMessage?: string;
  ipAddress?: string;
  executionTimeMs?: number;
  createdAt: string;
}

export interface LogsResponse {
  logs: UsageLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ApiKeyService {
  private readonly baseUrl = '/user/api-keys';

  /**
   * 获取用户的API密钥列表
   */
  async getApiKeys(): Promise<ApiKeyInfo[]> {
    try {
      const result = await apiService.get<ApiKeyInfo[]>(this.baseUrl);
      return result;
    } catch (error) {
      log.error('获取API密钥列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建新的API密钥
   */
  async createApiKey(data: CreateApiKeyData): Promise<CreateApiKeyResponse['data']> {
    try {
      const result = await apiService.post<CreateApiKeyResponse['data']>(this.baseUrl, data);

      // 验证响应数据格式
      if (!result || !result.apiKey || !result.name) {
        throw new Error('服务器返回的数据格式无效');
      }

      return result;
    } catch (error) {
      log.error('创建API密钥失败:', error);

      // 重新抛出错误，保持原始错误信息
      if (error && typeof error === 'object' && 'response' in error) {
        // API错误，保持原始格式
        throw error;
      } else if (error instanceof Error) {
        // 其他错误，包装为统一格式
        throw new Error(error.message || '创建API密钥失败');
      } else {
        // 未知错误
        throw new Error('创建API密钥失败');
      }
    }
  }

  /**
   * 删除API密钥
   */
  async deleteApiKey(keyId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${keyId}`);
    } catch (error) {
      log.error('删除API密钥失败:', error);
      throw error;
    }
  }

  /**
   * 获取API密钥使用统计
   */
  async getApiKeyStats(keyId: string): Promise<ApiKeyUsageStats> {
    try {
      const result = await apiService.get<ApiKeyUsageStats>(`${this.baseUrl}/${keyId}/stats`);
      return result;
    } catch (error) {
      log.error('获取API密钥统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取API密钥使用日志
   */
  async getApiKeyLogs(
    keyId: string,
    options: {
      page?: number;
      limit?: number;
      toolName?: string;
    } = {},
  ): Promise<LogsResponse> {
    try {
      const { page = 1, limit = 50, toolName } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (toolName) {
        params.append('toolName', toolName);
      }

      const result = await apiService.get<LogsResponse>(
        `${this.baseUrl}/${keyId}/logs?${params.toString()}`,
      );
      return result;
    } catch (error) {
      log.error('获取API密钥日志失败:', error);
      throw error;
    }
  }

  /**
   * 检验API密钥格式
   */
  static validateApiKeyFormat(apiKey: string): boolean {
    // XItools API密钥格式: xitool_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const pattern = /^xitool_[a-f0-9]{64}$/;
    return pattern.test(apiKey);
  }

  /**
   * 格式化API密钥显示（隐藏敏感部分）
   */
  static formatApiKeyForDisplay(keyPrefix: string): string {
    return `${keyPrefix}${'*'.repeat(28)}`;
  }

  /**
   * 获取权限标签映射
   */
  static getPermissionLabels(): Record<string, string> {
    return {
      'mcp:read': 'MCP读取权限',
      'mcp:write': 'MCP写入权限',
      'mcp:admin': 'MCP管理权限',
    };
  }

  /**
   * 获取权限描述
   */
  static getPermissionDescriptions(): Record<string, string> {
    return {
      'mcp:read': '允许读取任务、看板和项目数据',
      'mcp:write': '允许创建、修改和删除任务和看板',
      'mcp:admin': '允许管理系统设置和用户权限',
    };
  }
}

export const apiKeyService = new ApiKeyService();
export default apiKeyService;
