/**
 * API密钥过期和自动清理服务
 *
 * 提供API密钥的自动过期检查、清理和通知功能
 */

import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

export interface ExpirationConfig {
  // 检查频率（cron表达式）
  checkInterval: string;
  // 过期前通知时间（天）
  notificationDays: number[];
  // 自动清理过期密钥（天）
  autoCleanupAfterDays: number;
  // 清理过期日志（天）
  logRetentionDays: number;
}

export interface ExpirationNotification {
  apiKeyId: string;
  keyName: string;
  userId: string;
  userEmail: string;
  expiresAt: Date;
  daysUntilExpiry: number;
  type: 'warning' | 'urgent' | 'expired';
}

class ApiKeyExpirationManager {
  private config: ExpirationConfig;
  private isRunning: boolean = false;

  constructor(
    config: ExpirationConfig = {
      checkInterval: '0 9 * * *', // 每天上午9点检查
      notificationDays: [30, 7, 3, 1], // 过期前30、7、3、1天发送通知
      autoCleanupAfterDays: 30, // 过期30天后自动删除
      logRetentionDays: 90, // 保留90天的日志
    },
  ) {
    this.config = config;
  }

  /**
   * 启动自动过期检查服务
   */
  start(): void {
    if (this.isRunning) {
      console.log('API密钥过期管理服务已在运行');
      return;
    }

    console.log('启动API密钥过期管理服务...');

    // 定时检查过期
    cron.schedule(this.config.checkInterval, async () => {
      try {
        await this.performExpirationCheck();
      } catch (error) {
        console.error('过期检查任务失败:', error);
      }
    });

    // 每天凌晨2点清理过期数据
    cron.schedule('0 2 * * *', async () => {
      try {
        await this.cleanupExpiredData();
      } catch (error) {
        console.error('数据清理任务失败:', error);
      }
    });

    this.isRunning = true;
    console.log('API密钥过期管理服务启动成功');
  }

  /**
   * 停止自动过期检查服务
   */
  stop(): void {
    // node-cron 没有直接的停止方法，这里只是标记状态
    this.isRunning = false;
    console.log('API密钥过期管理服务已停止');
  }

  /**
   * 执行过期检查
   */
  private async performExpirationCheck(): Promise<void> {
    console.log('开始执行API密钥过期检查...');

    const now = new Date();
    const notifications: ExpirationNotification[] = [];

    // 检查即将过期的密钥
    for (const days of this.config.notificationDays) {
      const checkDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const expiringKeys = await prisma.userApiKey.findMany({
        where: {
          expiresAt: {
            gte: now,
            lte: checkDate,
          },
          isActive: true,
        },
        include: {
          user: {
            select: {
              email: true,
              username: true,
            },
          },
        },
      });

      for (const key of expiringKeys) {
        const daysUntilExpiry = Math.ceil(
          (key.expiresAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
        );

        notifications.push({
          apiKeyId: key.id,
          keyName: key.name,
          userId: key.userId,
          userEmail: key.user.email,
          expiresAt: key.expiresAt!,
          daysUntilExpiry,
          type: daysUntilExpiry <= 1 ? 'urgent' : 'warning',
        });
      }
    }

    // 检查已过期的密钥
    const expiredKeys = await prisma.userApiKey.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
      },
    });

    for (const key of expiredKeys) {
      notifications.push({
        apiKeyId: key.id,
        keyName: key.name,
        userId: key.userId,
        userEmail: key.user.email,
        expiresAt: key.expiresAt!,
        daysUntilExpiry: 0,
        type: 'expired',
      });

      // 自动禁用过期的密钥
      await this.disableExpiredKey(key.id);
    }

    // 发送通知
    for (const notification of notifications) {
      await this.sendExpirationNotification(notification);
    }

    console.log(`过期检查完成，发送了${notifications.length}个通知`);
  }

  /**
   * 禁用过期的API密钥
   */
  private async disableExpiredKey(apiKeyId: string): Promise<void> {
    try {
      await prisma.userApiKey.update({
        where: { id: apiKeyId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      console.log(`已禁用过期的API密钥: ${apiKeyId}`);
    } catch (error) {
      console.error(`禁用API密钥失败 ${apiKeyId}:`, error);
    }
  }

  /**
   * 发送过期通知
   */
  private async sendExpirationNotification(notification: ExpirationNotification): Promise<void> {
    try {
      // 这里可以集成邮件服务、短信服务等
      // 目前只是记录日志
      console.log(`[通知] ${notification.type.toUpperCase()}: API密钥 "${notification.keyName}" 
        用户: ${notification.userEmail}
        ${
          notification.type === 'expired' ? '已过期' : `将在${notification.daysUntilExpiry}天后过期`
        }
        过期时间: ${notification.expiresAt.toISOString()}`);

      // 可以在这里添加实际的通知逻辑
      // await emailService.sendExpirationEmail(notification);
      // await smsService.sendExpirationSMS(notification);
    } catch (error) {
      console.error('发送过期通知失败:', error);
    }
  }

  /**
   * 清理过期数据
   */
  private async cleanupExpiredData(): Promise<void> {
    console.log('开始清理过期数据...');

    const now = new Date();

    // 清理长期过期的API密钥
    const cleanupDate = new Date(
      now.getTime() - this.config.autoCleanupAfterDays * 24 * 60 * 60 * 1000,
    );

    const expiredKeysToDelete = await prisma.userApiKey.findMany({
      where: {
        expiresAt: {
          lt: cleanupDate,
        },
        isActive: false,
      },
      select: { id: true, name: true },
    });

    for (const key of expiredKeysToDelete) {
      try {
        // 删除相关的使用日志
        await prisma.mcpUsageLog.deleteMany({
          where: { apiKeyId: key.id },
        });

        // 删除API密钥
        await prisma.userApiKey.delete({
          where: { id: key.id },
        });

        console.log(`已删除过期API密钥: ${key.name} (${key.id})`);
      } catch (error) {
        console.error(`删除过期API密钥失败 ${key.id}:`, error);
      }
    }

    // 清理过期的使用日志
    const logCleanupDate = new Date(
      now.getTime() - this.config.logRetentionDays * 24 * 60 * 60 * 1000,
    );

    const deletedLogs = await prisma.mcpUsageLog.deleteMany({
      where: {
        createdAt: {
          lt: logCleanupDate,
        },
      },
    });

    console.log(
      `清理完成: 删除了${expiredKeysToDelete.length}个过期密钥，${deletedLogs.count}条过期日志`,
    );
  }

  /**
   * 手动检查特定API密钥的过期状态
   */
  async checkApiKeyExpiration(apiKeyId: string): Promise<{
    isExpired: boolean;
    daysUntilExpiry: number;
    expiresAt: Date | null;
    needsRenewal: boolean;
  }> {
    const apiKey = await prisma.userApiKey.findUnique({
      where: { id: apiKeyId },
      select: {
        expiresAt: true,
        isActive: true,
      },
    });

    if (!apiKey) {
      throw new Error('API密钥不存在');
    }

    if (!apiKey.expiresAt) {
      return {
        isExpired: false,
        daysUntilExpiry: Infinity,
        expiresAt: null,
        needsRenewal: false,
      };
    }

    const now = new Date();
    const timeUntilExpiry = apiKey.expiresAt.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(timeUntilExpiry / (24 * 60 * 60 * 1000));

    return {
      isExpired: timeUntilExpiry <= 0,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
      expiresAt: apiKey.expiresAt,
      needsRenewal: daysUntilExpiry <= 7, // 7天内需要续期
    };
  }

  /**
   * 批量更新API密钥过期时间
   */
  async batchUpdateExpiration(
    updates: Array<{
      apiKeyId: string;
      newExpiresAt: Date | null;
    }>,
  ): Promise<{
    success: number;
    failed: Array<{ apiKeyId: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: [] as Array<{ apiKeyId: string; error: string }>,
    };

    for (const update of updates) {
      try {
        await prisma.userApiKey.update({
          where: { id: update.apiKeyId },
          data: {
            expiresAt: update.newExpiresAt,
            updatedAt: new Date(),
          },
        });
        results.success++;
      } catch (error) {
        results.failed.push({
          apiKeyId: update.apiKeyId,
          error: error instanceof Error ? error.message : '未知错误',
        });
      }
    }

    return results;
  }

  /**
   * 获取即将过期的API密钥列表
   */
  async getExpiringApiKeys(daysAhead: number = 30): Promise<
    Array<{
      id: string;
      name: string;
      userId: string;
      userEmail: string;
      expiresAt: Date;
      daysUntilExpiry: number;
      lastUsedAt: Date | null;
    }>
  > {
    const now = new Date();
    const checkDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const expiringKeys = await prisma.userApiKey.findMany({
      where: {
        expiresAt: {
          gte: now,
          lte: checkDate,
        },
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        expiresAt: 'asc',
      },
    });

    return expiringKeys.map((key) => ({
      id: key.id,
      name: key.name,
      userId: key.userId,
      userEmail: key.user.email,
      expiresAt: key.expiresAt!,
      daysUntilExpiry: Math.ceil(
        (key.expiresAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
      ),
      lastUsedAt: key.lastUsedAt,
    }));
  }

  /**
   * 生成过期报告
   */
  async generateExpirationReport(): Promise<{
    summary: {
      totalActiveKeys: number;
      expiringIn7Days: number;
      expiringIn30Days: number;
      expiredKeys: number;
      neverExpiringKeys: number;
    };
    details: {
      expiringKeys: Array<any>;
      expiredKeys: Array<any>;
    };
  }> {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalActive,
      expiring7Days,
      expiring30Days,
      expired,
      neverExpiring,
      expiringDetails,
      expiredDetails,
    ] = await Promise.all([
      prisma.userApiKey.count({ where: { isActive: true } }),
      prisma.userApiKey.count({
        where: {
          isActive: true,
          expiresAt: { gte: now, lte: in7Days },
        },
      }),
      prisma.userApiKey.count({
        where: {
          isActive: true,
          expiresAt: { gte: now, lte: in30Days },
        },
      }),
      prisma.userApiKey.count({
        where: {
          expiresAt: { lt: now },
        },
      }),
      prisma.userApiKey.count({
        where: {
          isActive: true,
          expiresAt: null,
        },
      }),
      this.getExpiringApiKeys(30),
      prisma.userApiKey.findMany({
        where: {
          expiresAt: { lt: now },
        },
        include: {
          user: { select: { email: true } },
        },
        orderBy: { expiresAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      summary: {
        totalActiveKeys: totalActive,
        expiringIn7Days: expiring7Days,
        expiringIn30Days: expiring30Days,
        expiredKeys: expired,
        neverExpiringKeys: neverExpiring,
      },
      details: {
        expiringKeys: expiringDetails,
        expiredKeys: expiredDetails.map((key) => ({
          id: key.id,
          name: key.name,
          userId: key.userId,
          userEmail: key.user.email,
          expiresAt: key.expiresAt,
          daysExpired: Math.ceil(
            (now.getTime() - key.expiresAt!.getTime()) / (24 * 60 * 60 * 1000),
          ),
        })),
      },
    };
  }
}

// 创建全局实例
export const apiKeyExpirationManager = new ApiKeyExpirationManager();

// 导出配置接口 - 类型已经通过 export interface 导出，无需重复
