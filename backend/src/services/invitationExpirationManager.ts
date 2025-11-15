/**
 * 团队邀请过期管理服务
 *
 * 定期检查并清理过期的团队邀请
 */

import cron from 'node-cron';
import { teamService } from './teamService';

class InvitationExpirationManager {
  private isRunning: boolean = false;

  /**
   * 启动邀请过期清理服务
   */
  start(): void {
    if (this.isRunning) {
      console.log('团队邀请过期管理服务已在运行');
      return;
    }

    console.log('启动团队邀请过期管理服务...');

    // 每天凌晨3点执行过期邀请清理
    cron.schedule('0 3 * * *', async () => {
      try {
        await this.cleanExpiredInvitations();
      } catch (error) {
        console.error('过期邀请清理任务失败:', error);
      }
    });

    // 每6小时执行一次过期检查（确保及时更新状态）
    cron.schedule('0 */6 * * *', async () => {
      try {
        await this.cleanExpiredInvitations();
      } catch (error) {
        console.error('过期邀请检查任务失败:', error);
      }
    });

    this.isRunning = true;
    console.log('团队邀请过期管理服务启动成功');
  }

  /**
   * 停止邀请过期清理服务
   */
  stop(): void {
    this.isRunning = false;
    console.log('团队邀请过期管理服务已停止');
  }

  /**
   * 清理过期邀请
   */
  private async cleanExpiredInvitations(): Promise<void> {
    console.log('[InvitationExpirationManager] 开始清理过期邀请...');

    try {
      const count = await teamService.expireOldInvitations();

      if (count > 0) {
        console.log(`[InvitationExpirationManager] 已将 ${count} 个过期邀请标记为过期`);
      } else {
        console.log('[InvitationExpirationManager] 没有需要清理的过期邀请');
      }
    } catch (error) {
      console.error('[InvitationExpirationManager] 清理过期邀请时发生错误:', error);
      throw error;
    }
  }

  /**
   * 手动触发过期邀请清理（用于测试或手动维护）
   */
  async manualCleanup(): Promise<number> {
    console.log('[InvitationExpirationManager] 手动触发过期邀请清理');
    await this.cleanExpiredInvitations();
    return await teamService.expireOldInvitations();
  }
}

// 创建并导出全局实例
export const invitationExpirationManager = new InvitationExpirationManager();
