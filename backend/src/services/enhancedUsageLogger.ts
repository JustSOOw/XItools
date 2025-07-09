/**
 * 增强的使用日志记录服务
 * 
 * 提供详细的API使用统计、异常检测和监控功能
 */

import { PrismaClient } from '@prisma/client';
import { FastifyRequest } from 'fastify';

const prisma = new PrismaClient();

export interface DetailedUsageLog {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize?: number;
  responseSize?: number;
  userAgent: string;
  ipAddress: string;
  toolName?: string;
  requestParams?: any;
  errorMessage?: string;
  timestamp: Date;
  sessionId?: string;
  referer?: string;
  requestId?: string;
}

export interface UsageStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  mostUsedEndpoints: Array<{
    endpoint: string;
    count: number;
  }>;
  errorRates: Array<{
    errorCode: number;
    count: number;
    percentage: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    requestCount: number;
  }>;
  topUserAgents: Array<{
    userAgent: string;
    count: number;
  }>;
  ipDistribution: Array<{
    ip: string;
    count: number;
    firstSeen: Date;
    lastSeen: Date;
  }>;
}

export interface AnomalyAlert {
  type: 'rate_spike' | 'unusual_error_rate' | 'suspicious_pattern' | 'geographic_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: Date;
  apiKeyId: string;
  userId: string;
}

class EnhancedUsageLogger {
  private alertThresholds = {
    // 每分钟请求数突增阈值
    rateSpikeThreshold: 100,
    // 错误率阈值 (百分比)
    errorRateThreshold: 50,
    // 响应时间异常阈值 (毫秒)
    responseTimeThreshold: 5000,
    // 不同IP地址数量阈值
    ipDiversityThreshold: 10
  };

  /**
   * 记录详细的使用日志
   */
  async logUsage(log: DetailedUsageLog): Promise<void> {
    try {
      await prisma.mcpUsageLog.create({
        data: {
          apiKeyId: log.apiKeyId,
          endpoint: log.endpoint,
          method: log.method,
          statusCode: log.statusCode,
          responseTime: log.responseTime,
          userAgent: log.userAgent,
          ipAddress: log.ipAddress,
          timestamp: log.timestamp,
          // 将额外信息存储在JSON字段中
          metadata: {
            toolName: log.toolName,
            requestParams: log.requestParams,
            errorMessage: log.errorMessage,
            requestSize: log.requestSize,
            responseSize: log.responseSize,
            sessionId: log.sessionId,
            referer: log.referer,
            requestId: log.requestId
          }
        }
      });

      // 异步检查异常模式
      this.checkForAnomalies(log).catch(console.error);
    } catch (error) {
      console.error('记录使用日志失败:', error);
    }
  }

  /**
   * 获取API密钥的使用统计
   */
  async getUsageStatistics(
    apiKeyId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<UsageStatistics> {
    const [
      totalStats,
      endpointStats,
      errorStats,
      hourlyStats,
      userAgentStats,
      ipStats
    ] = await Promise.all([
      // 总体统计
      prisma.mcpUsageLog.aggregate({
        where: {
          apiKeyId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _count: { id: true },
        _avg: { responseTime: true }
      }),

      // 端点使用统计
      prisma.mcpUsageLog.groupBy({
        by: ['endpoint'],
        where: {
          apiKeyId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),

      // 错误统计
      prisma.mcpUsageLog.groupBy({
        by: ['statusCode'],
        where: {
          apiKeyId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _count: { id: true }
      }),

      // 小时分布统计
      prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM timestamp) as hour,
          COUNT(*) as requestCount
        FROM "McpUsageLog"
        WHERE "apiKeyId" = ${apiKeyId}
          AND timestamp >= ${timeRange.start}
          AND timestamp <= ${timeRange.end}
        GROUP BY EXTRACT(HOUR FROM timestamp)
        ORDER BY hour
      `,

      // User Agent统计
      prisma.mcpUsageLog.groupBy({
        by: ['userAgent'],
        where: {
          apiKeyId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      }),

      // IP地址统计
      prisma.mcpUsageLog.groupBy({
        by: ['ipAddress'],
        where: {
          apiKeyId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _count: { id: true },
        _min: { timestamp: true },
        _max: { timestamp: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    const totalRequests = totalStats._count.id || 0;
    const successfulRequests = errorStats
      .filter(stat => stat.statusCode >= 200 && stat.statusCode < 400)
      .reduce((sum, stat) => sum + stat._count.id, 0);

    return {
      totalRequests,
      successfulRequests,
      failedRequests: totalRequests - successfulRequests,
      averageResponseTime: totalStats._avg.responseTime || 0,
      mostUsedEndpoints: endpointStats.map(stat => ({
        endpoint: stat.endpoint,
        count: stat._count.id
      })),
      errorRates: errorStats.map(stat => ({
        errorCode: stat.statusCode,
        count: stat._count.id,
        percentage: (stat._count.id / totalRequests) * 100
      })),
      hourlyDistribution: (hourlyStats as any[]).map(stat => ({
        hour: Number(stat.hour),
        requestCount: Number(stat.requestCount)
      })),
      topUserAgents: userAgentStats.map(stat => ({
        userAgent: stat.userAgent,
        count: stat._count.id
      })),
      ipDistribution: ipStats.map(stat => ({
        ip: stat.ipAddress,
        count: stat._count.id,
        firstSeen: stat._min.timestamp!,
        lastSeen: stat._max.timestamp!
      }))
    };
  }

  /**
   * 检查异常模式
   */
  private async checkForAnomalies(log: DetailedUsageLog): Promise<void> {
    const alerts: AnomalyAlert[] = [];
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // 检查请求频率突增
    const recentRequests = await prisma.mcpUsageLog.count({
      where: {
        apiKeyId: log.apiKeyId,
        timestamp: {
          gte: oneMinuteAgo
        }
      }
    });

    if (recentRequests > this.alertThresholds.rateSpikeThreshold) {
      alerts.push({
        type: 'rate_spike',
        severity: 'high',
        message: `API密钥在过去1分钟内产生了${recentRequests}次请求，超过阈值${this.alertThresholds.rateSpikeThreshold}`,
        data: { requestCount: recentRequests, timeWindow: '1分钟' },
        timestamp: now,
        apiKeyId: log.apiKeyId,
        userId: log.userId
      });
    }

    // 检查错误率
    const [totalRecentRequests, errorRequests] = await Promise.all([
      prisma.mcpUsageLog.count({
        where: {
          apiKeyId: log.apiKeyId,
          timestamp: { gte: oneHourAgo }
        }
      }),
      prisma.mcpUsageLog.count({
        where: {
          apiKeyId: log.apiKeyId,
          timestamp: { gte: oneHourAgo },
          statusCode: { gte: 400 }
        }
      })
    ]);

    if (totalRecentRequests > 10) { // 只有在有足够样本时才检查
      const errorRate = (errorRequests / totalRecentRequests) * 100;
      if (errorRate > this.alertThresholds.errorRateThreshold) {
        alerts.push({
          type: 'unusual_error_rate',
          severity: 'medium',
          message: `API密钥在过去1小时内错误率为${errorRate.toFixed(2)}%，超过阈值${this.alertThresholds.errorRateThreshold}%`,
          data: { errorRate, totalRequests: totalRecentRequests, errorRequests },
          timestamp: now,
          apiKeyId: log.apiKeyId,
          userId: log.userId
        });
      }
    }

    // 检查IP地址多样性（可能的异常使用模式）
    const uniqueIPs = await prisma.mcpUsageLog.findMany({
      where: {
        apiKeyId: log.apiKeyId,
        timestamp: { gte: oneHourAgo }
      },
      select: { ipAddress: true },
      distinct: ['ipAddress']
    });

    if (uniqueIPs.length > this.alertThresholds.ipDiversityThreshold) {
      alerts.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        message: `API密钥在过去1小时内从${uniqueIPs.length}个不同IP地址发起请求，可能存在异常使用`,
        data: { uniqueIPCount: uniqueIPs.length, threshold: this.alertThresholds.ipDiversityThreshold },
        timestamp: now,
        apiKeyId: log.apiKeyId,
        userId: log.userId
      });
    }

    // 检查响应时间异常
    if (log.responseTime > this.alertThresholds.responseTimeThreshold) {
      alerts.push({
        type: 'suspicious_pattern',
        severity: 'low',
        message: `请求响应时间${log.responseTime}ms超过阈值${this.alertThresholds.responseTimeThreshold}ms`,
        data: { responseTime: log.responseTime, endpoint: log.endpoint },
        timestamp: now,
        apiKeyId: log.apiKeyId,
        userId: log.userId
      });
    }

    // 存储告警
    for (const alert of alerts) {
      await this.storeAlert(alert);
    }
  }

  /**
   * 存储告警信息
   */
  private async storeAlert(alert: AnomalyAlert): Promise<void> {
    try {
      // 这里可以扩展为发送邮件、短信或其他通知方式
      console.warn(`[异常检测] ${alert.severity.toUpperCase()}: ${alert.message}`, alert.data);
      
      // 可以存储到数据库中用于后续分析
      // await prisma.anomalyAlert.create({ data: alert });
    } catch (error) {
      console.error('存储告警失败:', error);
    }
  }

  /**
   * 生成使用报告
   */
  async generateUsageReport(
    apiKeyId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    summary: any;
    statistics: UsageStatistics;
    recommendations: string[];
  }> {
    const statistics = await this.getUsageStatistics(apiKeyId, timeRange);
    
    const recommendations: string[] = [];

    // 基于统计数据生成建议
    if (statistics.failedRequests / statistics.totalRequests > 0.1) {
      recommendations.push('错误率较高，建议检查API调用参数和处理逻辑');
    }

    if (statistics.averageResponseTime > 2000) {
      recommendations.push('平均响应时间较长，建议优化请求频率或考虑缓存');
    }

    if (statistics.totalRequests === 0) {
      recommendations.push('API密钥尚未被使用，建议查看集成文档');
    }

    const summary = {
      timeRange,
      totalRequests: statistics.totalRequests,
      successRate: ((statistics.successfulRequests / statistics.totalRequests) * 100).toFixed(2) + '%',
      averageResponseTime: statistics.averageResponseTime.toFixed(2) + 'ms',
      mostUsedEndpoint: statistics.mostUsedEndpoints[0]?.endpoint || 'N/A',
      uniqueIPs: statistics.ipDistribution.length,
      uniqueUserAgents: statistics.topUserAgents.length
    };

    return {
      summary,
      statistics,
      recommendations
    };
  }

  /**
   * 清理过期日志
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.mcpUsageLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    console.log(`清理了${result.count}条过期的使用日志`);
    return result.count;
  }
}

// 创建中间件用于自动记录请求
export function createUsageLoggingMiddleware() {
  const logger = new EnhancedUsageLogger();

  return async (request: FastifyRequest, reply: any, next: any) => {
    const startTime = Date.now();
    const requestSize = request.headers['content-length'] 
      ? parseInt(request.headers['content-length']) 
      : 0;

    // 监听响应完成
    reply.addHook('onSend', async (request: FastifyRequest, reply: any, payload: any) => {
      if (request.user && request.apiKey) {
        const responseTime = Date.now() - startTime;
        const responseSize = payload ? Buffer.byteLength(JSON.stringify(payload)) : 0;

        await logger.logUsage({
          apiKeyId: request.apiKey.id,
          userId: request.user.userId,
          endpoint: request.url,
          method: request.method,
          statusCode: reply.statusCode,
          responseTime,
          requestSize,
          responseSize,
          userAgent: request.headers['user-agent'] || 'Unknown',
          ipAddress: request.ip || 'Unknown',
          timestamp: new Date(),
          sessionId: request.user.sessionId,
          referer: request.headers.referer,
          requestId: request.id
        });
      }
    });

    await next();
  };
}

export const enhancedUsageLogger = new EnhancedUsageLogger();
export default enhancedUsageLogger;