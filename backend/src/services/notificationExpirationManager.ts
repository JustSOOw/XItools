import * as cron from 'node-cron';
import { notificationService } from './notificationService.js';

/**
 * 通知过期管理器
 * 定期清理过期的已读通知（30天前的已读通知）
 */
export class NotificationExpirationManager {
  private task: ReturnType<typeof cron.schedule> | null = null;

  /**
   * 启动定时任务（每天凌晨2点执行）
   */
  start(): void {
    if (this.task) {
      console.log('通知过期管理器已经在运行');
      return;
    }

    // 每天凌晨2点执行清理
    this.task = cron.schedule('0 2 * * *', async () => {
      console.log('开始清理过期通知...');
      try {
        const result = await notificationService.cleanupOldNotifications();
        console.log(`成功清理 ${result.count} 条过期通知`);
      } catch (error) {
        console.error('清理过期通知失败:', error);
      }
    });

    console.log('通知过期管理器已启动（每天凌晨2点清理）');
  }

  /**
   * 停止定时任务
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('通知过期管理器已停止');
    }
  }

  /**
   * 手动执行一次清理
   */
  async runNow(): Promise<{ count: number }> {
    console.log('手动执行通知清理...');
    try {
      const result = await notificationService.cleanupOldNotifications();
      console.log(`成功清理 ${result.count} 条过期通知`);
      return result;
    } catch (error) {
      console.error('清理过期通知失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const notificationExpirationManager = new NotificationExpirationManager();
