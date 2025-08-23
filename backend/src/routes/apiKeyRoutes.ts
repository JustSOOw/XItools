/**
 * API密钥管理路由
 *
 * 提供API密钥的CRUD操作接口
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireAuth } from '../middleware/authMiddleware';
import { getApiKeyService } from '../services/apiKeyService';
import { enhancedUsageLogger } from '../services/enhancedUsageLogger';
import { apiKeyExpirationManager } from '../services/apiKeyExpirationManager';
import {
  createApiKeySchema,
  CreateApiKeyRequest,
  ApiKeyListResponse,
  CreateApiKeyResponse,
  DeleteApiKeyResponse,
  ApiKeyError,
  ApiKeyErrorCode,
} from '../types/apiKeyTypes';

// 初始化服务
const prisma = new PrismaClient();
const apiKeyService = getApiKeyService(prisma);

export default async function apiKeyRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // 所有API密钥路由都需要用户认证
  fastify.addHook('preHandler', authMiddleware);

  /**
   * 获取用户API密钥列表
   */
  fastify.get<{}>('/user/api-keys', async (request, reply) => {
    try {
      const userId = requireAuth(request);

      const apiKeys = await apiKeyService.getUserApiKeys(userId);

      const response: ApiKeyListResponse = {
        success: true,
        data: apiKeys,
      };

      return response;
    } catch (error) {
      console.error('获取API密钥列表失败:', error);

      if (error instanceof ApiKeyError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return reply.status(500).send({
        success: false,
        error: '获取API密钥列表失败',
      });
    }
  });

  /**
   * 创建新的API密钥
   */
  fastify.post<{
    Body: CreateApiKeyRequest;
  }>(
    '/user/api-keys',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['mcp:read', 'mcp:write', 'mcp:admin'],
              },
              minItems: 1,
              default: ['mcp:read', 'mcp:write'],
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = requireAuth(request);

        // 使用Zod验证请求体
        const validationResult = createApiKeySchema.safeParse(request.body);
        if (!validationResult.success) {
          return reply.status(400).send({
            success: false,
            error: '请求参数验证失败',
            details: validationResult.error.errors,
          });
        }

        const createData = validationResult.data;

        const newApiKey = await apiKeyService.createApiKey(userId, createData);

        const response: CreateApiKeyResponse = {
          success: true,
          data: {
            id: newApiKey.id,
            name: newApiKey.name,
            apiKey: newApiKey.apiKey, // 完整密钥，仅在创建时返回
            keyPrefix: newApiKey.keyPrefix,
            permissions: newApiKey.permissions as any,
            expiresAt: newApiKey.expiresAt,
            createdAt: newApiKey.createdAt,
          },
        };

        return response;
      } catch (error) {
        console.error('创建API密钥失败:', error);

        // 处理API密钥特定错误
        if (error instanceof ApiKeyError) {
          return reply.status(error.statusCode).send({
            success: false,
            error: error.message,
            code: error.code,
            details: null,
          });
        }

        // 处理Zod验证错误
        if (error && typeof error === 'object' && 'issues' in error) {
          return reply.status(400).send({
            success: false,
            error: '请求参数验证失败',
            code: 'VALIDATION_ERROR',
            details: error.issues,
          });
        }

        // 处理数据库错误
        if (error && typeof error === 'object' && 'code' in error) {
          const dbError = error as any;
          if (dbError.code === 'P2002') {
            // Prisma unique constraint violation
            return reply.status(400).send({
              success: false,
              error: '该名称的API密钥已存在',
              code: 'DUPLICATE_API_KEY_NAME',
              details: null,
            });
          }
        }

        // 处理通用错误
        const errorMessage = error instanceof Error ? error.message : '创建API密钥失败';
        return reply.status(500).send({
          success: false,
          error: errorMessage,
          code: 'INTERNAL_SERVER_ERROR',
          details: null,
        });
      }
    },
  );

  /**
   * 获取单个API密钥详情（仅所有者；返回完整apiKey）
   */
  fastify.get<{
    Params: { keyId: string };
  }>('/user/api-keys/:keyId', async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { keyId } = request.params;

      const key = await apiKeyService.getApiKeyById(userId, keyId, true);

      return {
        success: true,
        data: key,
      };
    } catch (error) {
      console.error('获取API密钥详情失败:', error);

      if (error instanceof ApiKeyError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return reply.status(500).send({ success: false, error: '获取API密钥详情失败' });
    }
  });

  /**
   * 更新API密钥（重命名/权限）
   */
  fastify.put<{
    Params: { keyId: string };
    Body: { name?: string; permissions?: Array<'mcp:read' | 'mcp:write' | 'mcp:admin'> };
  }>('/user/api-keys/:keyId', async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { keyId } = request.params;
      const { name, permissions } = request.body || {};

      const updated = await apiKeyService.updateApiKey(userId, keyId, { name, permissions });

      return { success: true, data: updated };
    } catch (error) {
      console.error('更新API密钥失败:', error);

      if (error instanceof ApiKeyError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return reply.status(500).send({ success: false, error: '更新API密钥失败' });
    }
  });


  /**
   * 删除API密钥
   */
  fastify.delete<{
    Params: { keyId: string };
  }>('/user/api-keys/:keyId', async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { keyId } = request.params;

      await apiKeyService.deleteApiKey(userId, keyId);

      const response: DeleteApiKeyResponse = {
        success: true,
        message: 'API密钥已删除',
      };

      return response;
    } catch (error) {
      console.error('删除API密钥失败:', error);

      if (error instanceof ApiKeyError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return reply.status(500).send({
        success: false,
        error: '删除API密钥失败',
      });
    }
  });

  /**
   * 获取API密钥使用统计
   */
  fastify.get<{
    Params: { keyId: string };
  }>('/user/api-keys/:keyId/stats', async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { keyId } = request.params;

      const stats = await apiKeyService.getApiKeyUsageStats(userId, keyId);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('获取API密钥统计失败:', error);

      if (error instanceof ApiKeyError) {
        return reply.status(error.statusCode).send({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return reply.status(500).send({
        success: false,
        error: '获取API密钥统计失败',
      });
    }
  });

  /**
   * 获取API密钥使用日志
   */
  fastify.get<{
    Params: { keyId: string };
    Querystring: {
      page?: number;
      limit?: number;
      toolName?: string;
    };
  }>('/user/api-keys/:keyId/logs', async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { keyId } = request.params;
      const { page = 1, limit = 50, toolName } = request.query;

      // 构建查询条件
      const where: any = {
        apiKeyId: keyId,
        userId,
      };

      if (toolName) {
        where.toolName = toolName;
      }

      // 分页查询
      const skip = (page - 1) * limit;
      const [logs, total] = await Promise.all([
        prisma.mcpUsageLog.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
          select: {
            id: true,
            toolName: true,
            responseStatus: true,
            errorMessage: true,
            ipAddress: true,
            executionTimeMs: true,
            createdAt: true,
          },
        }),
        prisma.mcpUsageLog.count({ where }),
      ]);

      return {
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error('获取API密钥日志失败:', error);

      return reply.status(500).send({
        success: false,
        error: '获取API密钥日志失败',
      });
    }
  });

  /**
   * 清理过期的API密钥（管理员功能）
   */
  fastify.post('/admin/api-keys/cleanup', async (request, reply) => {
    try {
      const userId = requireAuth(request);

      // 检查用户是否为管理员
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          error: '权限不足，仅管理员可执行此操作',
        });
      }

      const cleanedCount = await apiKeyService.cleanupExpiredKeys();

      return {
        success: true,
        message: `已清理 ${cleanedCount} 个过期的API密钥`,
      };
    } catch (error) {
      console.error('清理过期API密钥失败:', error);

      return reply.status(500).send({
        success: false,
        error: '清理过期API密钥失败',
      });
    }
  });

  /**
   * 获取MCP工具使用概览（管理员功能）
   */
  fastify.get('/admin/mcp/overview', async (request, reply) => {
    try {
      const userId = requireAuth(request);

      // 检查用户是否为管理员
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          error: '权限不足，仅管理员可查看此信息',
        });
      }

      // 获取总体统计
      const [totalApiKeys, activeApiKeys, totalRequests, toolStats, userStats] = await Promise.all([
        // 总API密钥数
        prisma.userApiKey.count({
          where: { isActive: true },
        }),
        // 活跃API密钥数（30天内使用过的）
        prisma.userApiKey.count({
          where: {
            isActive: true,
            lastUsedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        // 总请求数
        prisma.mcpUsageLog.count(),
        // 工具使用统计
        prisma.mcpUsageLog.groupBy({
          by: ['toolName'],
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
          take: 10,
        }),
        // 用户使用统计
        prisma.mcpUsageLog.groupBy({
          by: ['userId'],
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      return {
        success: true,
        data: {
          totalApiKeys,
          activeApiKeys,
          totalRequests,
          topTools: toolStats.map((stat) => ({
            toolName: stat.toolName,
            count: stat._count.id,
          })),
          topUsers: userStats.map((stat) => ({
            userId: stat.userId,
            count: stat._count.id,
          })),
        },
      };
    } catch (error) {
      console.error('获取MCP概览失败:', error);

      return reply.status(500).send({
        success: false,
        error: '获取MCP概览失败',
      });
    }
  });

  /**
   * 获取详细的使用统计报告
   */
  fastify.get<{
    Params: { keyId: string };
    Querystring: {
      timeRange?: string; // 'hour' | 'day' | 'week' | 'month'
      startDate?: string;
      endDate?: string;
    };
  }>('/user/api-keys/:keyId/detailed-stats', async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { keyId } = request.params;
      const { timeRange = 'week', startDate, endDate } = request.query;

      // 验证API密钥所有权
      const apiKey = await prisma.userApiKey.findFirst({
        where: { id: keyId, userId },
      });

      if (!apiKey) {
        return reply.status(404).send({
          success: false,
          error: 'API密钥不存在',
        });
      }

      // 确定时间范围
      let start: Date, end: Date;
      const now = new Date();

      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        switch (timeRange) {
          case 'hour':
            start = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case 'day':
            start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'week':
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        end = now;
      }

      const statistics = await enhancedUsageLogger.getUsageStatistics(keyId, { start, end });
      const report = await enhancedUsageLogger.generateUsageReport(keyId, { start, end });

      return {
        success: true,
        data: {
          timeRange: { start, end },
          statistics,
          report,
        },
      };
    } catch (error) {
      console.error('获取详细统计失败:', error);
      return reply.status(500).send({
        success: false,
        error: '获取详细统计失败',
      });
    }
  });

  /**
   * 获取过期报告
   */
  fastify.get('/user/api-keys/expiration-report', async (request, reply) => {
    try {
      const userId = requireAuth(request);

      // 获取用户的过期报告
      const userApiKeys = await prisma.userApiKey.findMany({
        where: { userId },
        select: { id: true },
      });

      const expirationReport = await apiKeyExpirationManager.generateExpirationReport();

      // 过滤只显示当前用户的密钥信息
      const userKeyIds = new Set(userApiKeys.map((key) => key.id));
      const filteredReport = {
        ...expirationReport,
        details: {
          expiringKeys: expirationReport.details.expiringKeys.filter((key) =>
            userKeyIds.has(key.id),
          ),
          expiredKeys: expirationReport.details.expiredKeys.filter((key) => userKeyIds.has(key.id)),
        },
      };

      return {
        success: true,
        data: filteredReport,
      };
    } catch (error) {
      console.error('获取过期报告失败:', error);
      return reply.status(500).send({
        success: false,
        error: '获取过期报告失败',
      });
    }
  });

  /**
   * 获取实时仪表板数据
   */
  fastify.get('/user/api-keys/dashboard', async (request, reply) => {
    try {
      const userId = requireAuth(request);

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 获取用户的API密钥
      const userApiKeys = await prisma.userApiKey.findMany({
        where: { userId },
        select: { id: true, name: true, isActive: true, expiresAt: true, lastUsedAt: true },
      });

      const keyIds = userApiKeys.map((key) => key.id);

      // 获取统计数据
      const [totalRequests24h, totalRequestsWeek, errorRequests24h, recentActivity, topEndpoints] =
        await Promise.all([
          // 24小时请求数
          prisma.mcpUsageLog.count({
            where: {
              apiKeyId: { in: keyIds },
              createdAt: { gte: oneDayAgo },
            },
          }),

          // 一周请求数
          prisma.mcpUsageLog.count({
            where: {
              apiKeyId: { in: keyIds },
              createdAt: { gte: oneWeekAgo },
            },
          }),

          // 24小时错误数
          prisma.mcpUsageLog.count({
            where: {
              apiKeyId: { in: keyIds },
              createdAt: { gte: oneDayAgo },
              responseStatus: { gte: 400 },
            },
          }),

          // 最近活动
          prisma.mcpUsageLog.findMany({
            where: {
              apiKeyId: { in: keyIds },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              apiKey: {
                select: { name: true },
              },
            },
          }),

          // 热门端点
          prisma.mcpUsageLog.groupBy({
            by: ['toolName'],
            where: {
              apiKeyId: { in: keyIds },
              createdAt: { gte: oneWeekAgo },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
          }),
        ]);

      // 检查即将过期的密钥
      const expiringKeys = userApiKeys.filter((key) => {
        if (!key.expiresAt) return false;
        const daysUntilExpiry = Math.ceil(
          (key.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
        );
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      });

      return {
        success: true,
        data: {
          summary: {
            totalApiKeys: userApiKeys.length,
            activeApiKeys: userApiKeys.filter((key) => key.isActive).length,
            requests24h: totalRequests24h,
            requestsWeek: totalRequestsWeek,
            errorRate24h: totalRequests24h > 0 ? (errorRequests24h / totalRequests24h) * 100 : 0,
            expiringKeysCount: expiringKeys.length,
          },
          expiringKeys: expiringKeys.map((key) => ({
            id: key.id,
            name: key.name,
            expiresAt: key.expiresAt,
            daysUntilExpiry: Math.ceil(
              (key.expiresAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
            ),
          })),
          recentActivity: recentActivity.map((log) => ({
            timestamp: log.createdAt,
            endpoint: log.toolName,
            statusCode: log.responseStatus || 0,
            keyName: log.apiKey?.name || 'Unknown',
            responseTime: log.executionTimeMs || 0,
          })),
          topEndpoints: topEndpoints.map((stat) => ({
            endpoint: stat.toolName,
            count: stat._count.id,
          })),
        },
      };
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      return reply.status(500).send({
        success: false,
        error: '获取仪表板数据失败',
      });
    }
  });

  /**
   * 获取API密钥健康状态
   */
  fastify.get<{
    Params: { keyId: string };
  }>('/user/api-keys/:keyId/health', async (request, reply) => {
    try {
      const userId = requireAuth(request);
      const { keyId } = request.params;

      // 验证API密钥所有权
      const apiKey = await prisma.userApiKey.findFirst({
        where: { id: keyId, userId },
      });

      if (!apiKey) {
        return reply.status(404).send({
          success: false,
          error: 'API密钥不存在',
        });
      }

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // 获取健康指标
      const [recentRequests, recentErrors, avgResponseTime, uniqueIPs] = await Promise.all([
        // 最近1小时请求数
        prisma.mcpUsageLog.count({
          where: {
            apiKeyId: keyId,
            createdAt: { gte: oneHourAgo },
          },
        }),

        // 最近1小时错误数
        prisma.mcpUsageLog.count({
          where: {
            apiKeyId: keyId,
            createdAt: { gte: oneHourAgo },
            responseStatus: { gte: 400 },
          },
        }),

        // 平均响应时间（最近24小时）
        prisma.mcpUsageLog.aggregate({
          where: {
            apiKeyId: keyId,
            createdAt: { gte: oneDayAgo },
          },
          _avg: { executionTimeMs: true },
        }),

        // 最近24小时唯一IP数
        prisma.mcpUsageLog.findMany({
          where: {
            apiKeyId: keyId,
            createdAt: { gte: oneDayAgo },
          },
          select: { ipAddress: true },
          distinct: ['ipAddress'],
        }),
      ]);

      // 检查过期状态
      const expirationInfo = await apiKeyExpirationManager.checkApiKeyExpiration(keyId);

      // 计算健康分数
      let healthScore = 100;
      const issues: string[] = [];

      // 错误率检查
      const errorRate = recentRequests > 0 ? (recentErrors / recentRequests) * 100 : 0;
      if (errorRate > 50) {
        healthScore -= 30;
        issues.push(`错误率过高: ${errorRate.toFixed(2)}%`);
      } else if (errorRate > 20) {
        healthScore -= 15;
        issues.push(`错误率较高: ${errorRate.toFixed(2)}%`);
      }

      // 响应时间检查
      const avgTime = avgResponseTime._avg.executionTimeMs || 0;
      if (avgTime > 5000) {
        healthScore -= 20;
        issues.push(`响应时间过长: ${avgTime.toFixed(0)}ms`);
      } else if (avgTime > 2000) {
        healthScore -= 10;
        issues.push(`响应时间较长: ${avgTime.toFixed(0)}ms`);
      }

      // 过期检查
      if (expirationInfo.isExpired) {
        healthScore = 0;
        issues.push('API密钥已过期');
      } else if (expirationInfo.needsRenewal) {
        healthScore -= 25;
        issues.push(`即将过期: ${expirationInfo.daysUntilExpiry}天后`);
      }

      // IP多样性检查（可能的安全风险）
      if (uniqueIPs.length > 10) {
        healthScore -= 15;
        issues.push(`使用IP地址过多: ${uniqueIPs.length}个不同IP`);
      }

      // 确保分数不为负
      healthScore = Math.max(0, healthScore);

      // 确定健康状态
      let status: 'healthy' | 'warning' | 'critical';
      if (healthScore >= 80) status = 'healthy';
      else if (healthScore >= 50) status = 'warning';
      else status = 'critical';

      return {
        success: true,
        data: {
          healthScore,
          status,
          issues,
          metrics: {
            requestsLastHour: recentRequests,
            errorsLastHour: recentErrors,
            errorRate: errorRate.toFixed(2) + '%',
            avgResponseTime: avgTime.toFixed(0) + 'ms',
            uniqueIPs: uniqueIPs.length,
            expirationInfo,
          },
          recommendations: generateHealthRecommendations(healthScore, issues),
        },
      };
    } catch (error) {
      console.error('获取API密钥健康状态失败:', error);
      return reply.status(500).send({
        success: false,
        error: '获取API密钥健康状态失败',
      });
    }
  });
}

/**
 * 生成健康建议
 */
function generateHealthRecommendations(healthScore: number, issues: string[]): string[] {
  const recommendations: string[] = [];

  if (healthScore < 50) {
    recommendations.push('建议立即检查API密钥的使用情况和错误日志');
  }

  if (issues.some((issue) => issue.includes('错误率'))) {
    recommendations.push('检查API调用参数和处理逻辑，减少错误请求');
  }

  if (issues.some((issue) => issue.includes('响应时间'))) {
    recommendations.push('考虑优化请求频率或使用缓存机制');
  }

  if (issues.some((issue) => issue.includes('过期'))) {
    recommendations.push('及时更新API密钥的过期时间');
  }

  if (issues.some((issue) => issue.includes('IP地址'))) {
    recommendations.push('审查API密钥的使用范围，确保安全性');
  }

  if (recommendations.length === 0) {
    recommendations.push('API密钥运行状况良好，继续保持');
  }

  return recommendations;
}
