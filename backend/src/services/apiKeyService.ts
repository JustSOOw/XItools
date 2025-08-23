/**
 * API密钥管理服务
 *
 * 提供API密钥的创建、验证、管理等功能
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import {
  UserApiKey,
  CreateApiKeyRequest,
  ApiKeyInfo,
  ApiKeyPermission,
  ApiKeyError,
  ApiKeyErrorCode,
  ApiKeyValidationResult,
  McpLogParams,
} from '../types/apiKeyTypes';

export class ApiKeyService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 生成安全的API密钥
   */
  private generateApiKey(): { apiKey: string; keyPrefix: string } {
    const prefix = 'xitool_';
    const randomBytes = crypto.randomBytes(32); // 256位随机数
    const keyBody = randomBytes.toString('hex');
    const apiKey = prefix + keyBody;
    const keyPrefix = apiKey.substring(0, 16) + '...'; // 显示前16个字符

    return { apiKey, keyPrefix };
  }

  /**
   * 创建新的API密钥
   */
  async createApiKey(userId: string, request: CreateApiKeyRequest): Promise<UserApiKey> {
    // 使用数据库事务确保数据一致性
    return await this.prisma.$transaction(async (tx) => {
      // 检查用户是否已有同名密钥
      const existingKey = await tx.userApiKey.findFirst({
        where: {
          userId,
          name: request.name,
          isActive: true,
        },
      });

      if (existingKey) {
        throw new ApiKeyError(ApiKeyErrorCode.DUPLICATE_API_KEY_NAME, '该名称的API密钥已存在', 400);
      }

      // 生成API密钥
      const { apiKey, keyPrefix } = this.generateApiKey();

      // 处理过期时间
      const expiresAt = request.expiresAt ? new Date(request.expiresAt) : null;

      // 验证过期时间格式
      if (request.expiresAt && isNaN(expiresAt!.getTime())) {
        throw new ApiKeyError(ApiKeyErrorCode.INVALID_API_KEY, '过期时间格式无效', 400);
      }

      // 创建API密钥记录
      const createdKey = await tx.userApiKey.create({
        data: {
          userId,
          name: request.name,
          apiKey,
          keyPrefix,
          permissions: request.permissions,
          expiresAt,
          isActive: true,
        },
      });

      return {
        ...createdKey,
        permissions: createdKey.permissions as ApiKeyPermission[],
      } as UserApiKey;
    });
  }

  /**
   * 获取用户的API密钥列表（不包含完整密钥）
   */
  async getUserApiKeys(userId: string): Promise<ApiKeyInfo[]> {
    const apiKeys = await this.prisma.userApiKey.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        lastUsedAt: true,
        lastUsedIp: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      permissions: key.permissions as ApiKeyPermission[],
      lastUsedAt: key.lastUsedAt,
      lastUsedIp: key.lastUsedIp,
      expiresAt: key.expiresAt,
      isActive: key.isActive,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));
  }

  /**
   * 获取单个API密钥（可选择是否包含完整密钥）
   */
  async getApiKeyById(
    userId: string,
    apiKeyId: string,
    includeSecret: boolean = false,
  ): Promise<ApiKeyInfo | UserApiKey> {
    const key = await this.prisma.userApiKey.findFirst({
      where: { id: apiKeyId, userId, isActive: true },
    });

    if (!key) {
      throw new ApiKeyError(ApiKeyErrorCode.API_KEY_NOT_FOUND, 'API密钥不存在或无权访问', 404);
    }

    if (includeSecret) {
      return {
        ...key,
        permissions: key.permissions as ApiKeyPermission[],
      } as UserApiKey;
    }

    return {
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      permissions: key.permissions as ApiKeyPermission[],
      lastUsedAt: key.lastUsedAt,
      lastUsedIp: key.lastUsedIp,
      expiresAt: key.expiresAt,
      isActive: key.isActive,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    } as ApiKeyInfo;
  }

  /**
   * 更新API密钥（重命名/权限）
   */
  async updateApiKey(
    userId: string,
    apiKeyId: string,
    updates: { name?: string; permissions?: ApiKeyPermission[] | string[] },
  ): Promise<ApiKeyInfo> {
    const key = await this.prisma.userApiKey.findFirst({ where: { id: apiKeyId, userId, isActive: true } });
    if (!key) {
      throw new ApiKeyError(ApiKeyErrorCode.API_KEY_NOT_FOUND, 'API密钥不存在或无权访问', 404);
    }

    const data: any = {};
    if (typeof updates.name === 'string' && updates.name.trim().length > 0) {
      // 重名检查
      const dup = await this.prisma.userApiKey.findFirst({
        where: { userId, name: updates.name.trim(), isActive: true, NOT: { id: apiKeyId } },
      });
      if (dup) {
        throw new ApiKeyError(ApiKeyErrorCode.DUPLICATE_API_KEY_NAME, '该名称的API密钥已存在', 400);
      }
      data.name = updates.name.trim();
    }

    if (Array.isArray(updates.permissions)) {
      const allowed = ['mcp:read', 'mcp:write', 'mcp:admin'];
      const incoming = updates.permissions.map((p) => String(p));
      if (incoming.length === 0 || incoming.some((p) => !allowed.includes(p))) {
        throw new ApiKeyError(ApiKeyErrorCode.INVALID_API_KEY, '权限项无效', 400);
      }
      data.permissions = incoming;
    }

    if (Object.keys(data).length === 0) {
      // 没有更新内容，返回当前信息
      return {
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        permissions: key.permissions as ApiKeyPermission[],
        lastUsedAt: key.lastUsedAt,
        lastUsedIp: key.lastUsedIp,
        expiresAt: key.expiresAt,
        isActive: key.isActive,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
      } as ApiKeyInfo;
    }

    const updated = await this.prisma.userApiKey.update({
      where: { id: apiKeyId },
      data: { ...data, updatedAt: new Date() },
    });

    return {
      id: updated.id,
      name: updated.name,
      keyPrefix: updated.keyPrefix,
      permissions: updated.permissions as ApiKeyPermission[],
      lastUsedAt: updated.lastUsedAt,
      lastUsedIp: updated.lastUsedIp,
      expiresAt: updated.expiresAt,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    } as ApiKeyInfo;
  }


  /**
   * 验证API密钥
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      const keyData = await this.prisma.userApiKey.findUnique({
        where: {
          apiKey,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              isActive: true,
            },
          },
        },
      });

      if (!keyData) {
        return {
          isValid: false,
          error: 'API密钥无效',
        };
      }

      // 检查用户是否激活
      if (!keyData.user.isActive) {
        return {
          isValid: false,
          error: '用户账户已被禁用',
        };
      }

      // 检查密钥是否过期
      if (keyData.expiresAt && keyData.expiresAt <= new Date()) {
        return {
          isValid: false,
          error: 'API密钥已过期',
        };
      }

      return {
        isValid: true,
        userId: keyData.userId,
        apiKeyId: keyData.id,
        permissions: keyData.permissions as ApiKeyPermission[],
      };
    } catch (error) {
      console.error('验证API密钥时出错:', error);
      return {
        isValid: false,
        error: '验证失败',
      };
    }
  }

  /**
   * 更新API密钥使用记录
   */
  async updateApiKeyUsage(apiKeyId: string, ipAddress?: string): Promise<void> {
    try {
      await this.prisma.userApiKey.update({
        where: { id: apiKeyId },
        data: {
          lastUsedAt: new Date(),
          lastUsedIp: ipAddress || null,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('更新API密钥使用记录失败:', error);
      // 不抛出错误，避免影响主要业务流程
    }
  }

  /**
   * 删除API密钥
   */
  async deleteApiKey(userId: string, apiKeyId: string): Promise<void> {
    // 验证密钥属于该用户
    const apiKey = await this.prisma.userApiKey.findFirst({
      where: {
        id: apiKeyId,
        userId,
        isActive: true,
      },
    });

    if (!apiKey) {
      throw new ApiKeyError(ApiKeyErrorCode.API_KEY_NOT_FOUND, 'API密钥不存在或无权删除', 404);
    }

    // 软删除：设置为非激活状态
    await this.prisma.userApiKey.update({
      where: { id: apiKeyId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 记录MCP工具使用日志
   */
  async logMcpUsage(params: McpLogParams): Promise<void> {
    try {
      await this.prisma.mcpUsageLog.create({
        data: {
          apiKeyId: params.apiKeyId,
          userId: params.userId,
          toolName: params.toolName,
          requestParams: params.requestParams,
          responseStatus: params.responseStatus,
          errorMessage: params.errorMessage,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          executionTimeMs: params.executionTimeMs,
        },
      });
    } catch (error) {
      console.error('记录MCP使用日志失败:', error);
      // 不抛出错误，避免影响主要业务流程
    }
  }

  /**
   * 获取API密钥使用统计
   */
  async getApiKeyUsageStats(userId: string, apiKeyId: string) {
    const stats = await this.prisma.mcpUsageLog.groupBy({
      by: ['responseStatus'],
      where: {
        apiKeyId,
        userId,
      },
      _count: {
        id: true,
      },
    });

    const totalRequests = stats.reduce((sum, stat) => sum + stat._count.id, 0);
    const successRequests = stats
      .filter(
        (stat) => stat.responseStatus && stat.responseStatus >= 200 && stat.responseStatus < 300,
      )
      .reduce((sum, stat) => sum + stat._count.id, 0);
    const failedRequests = totalRequests - successRequests;

    // 获取最近使用的工具
    const recentLog = await this.prisma.mcpUsageLog.findFirst({
      where: {
        apiKeyId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        toolName: true,
        createdAt: true,
      },
    });

    // 获取最常用的工具
    const mostUsedTool = await this.prisma.mcpUsageLog.groupBy({
      by: ['toolName'],
      where: {
        apiKeyId,
        userId,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 1,
    });

    return {
      totalRequests,
      successRequests,
      failedRequests,
      lastUsedAt: recentLog?.createdAt || null,
      mostUsedTool: mostUsedTool[0]?.toolName || null,
    };
  }

  /**
   * 清理过期的API密钥
   */
  async cleanupExpiredKeys(): Promise<number> {
    const result = await this.prisma.userApiKey.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * 检查权限
   */
  checkPermission(
    userPermissions: ApiKeyPermission[],
    requiredPermission: ApiKeyPermission,
  ): boolean {
    return (
      userPermissions.includes(requiredPermission) ||
      userPermissions.includes(ApiKeyPermission.MCP_ADMIN)
    );
  }
}

// 导出单例实例
let apiKeyServiceInstance: ApiKeyService | null = null;

export function getApiKeyService(prisma: PrismaClient): ApiKeyService {
  if (!apiKeyServiceInstance) {
    apiKeyServiceInstance = new ApiKeyService(prisma);
  }
  return apiKeyServiceInstance;
}
