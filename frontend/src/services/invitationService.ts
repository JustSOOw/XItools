/**
 * 团队邀请服务
 *
 * 提供邀请处理、验证等API调用
 */

import { apiService } from '../utils/apiClient';
import { log } from '../utils/env';
import { BaseApiService } from './BaseApiService';
import { TeamInvitationDetail } from '../types/teamTypes';

/**
 * 邀请服务类
 */
class InvitationService extends BaseApiService {
  /**
   * 获取我的待处理邀请
   * GET /api/invitations/pending
   */
  async getPendingInvitations(): Promise<TeamInvitationDetail[]> {
    try {
      log.debug('获取待处理邀请');
      const invitations = await apiService.get<TeamInvitationDetail[]>('/invitations/pending');
      log.debug('获取待处理邀请成功:', invitations.length);
      return invitations;
    } catch (error) {
      log.error('获取待处理邀请失败:', error);

      // 如果服务器不可用，返回空数组
      if (this.isServerUnavailableError(error)) {
        return [];
      }

      throw error;
    }
  }

  /**
   * 接受邀请
   * POST /api/invitations/:invitationId/accept
   */
  async acceptInvitation(invitationId: string): Promise<void> {
    try {
      log.debug('接受邀请:', invitationId);
      await apiService.post(`/invitations/${invitationId}/accept`);
      log.debug('接受邀请成功');
    } catch (error) {
      log.error('接受邀请失败:', error);
      throw error;
    }
  }

  /**
   * 拒绝邀请
   * POST /api/invitations/:invitationId/reject
   */
  async rejectInvitation(invitationId: string): Promise<void> {
    try {
      log.debug('拒绝邀请:', invitationId);
      await apiService.post(`/invitations/${invitationId}/reject`);
      log.debug('拒绝邀请成功');
    } catch (error) {
      log.error('拒绝邀请失败:', error);
      throw error;
    }
  }

  /**
   * 验证邀请码
   * GET /api/invitations/verify/:inviteCode
   */
  async verifyInviteCode(inviteCode: string): Promise<TeamInvitationDetail> {
    try {
      log.debug('验证邀请码:', inviteCode);
      const invitation = await apiService.get<TeamInvitationDetail>(
        `/invitations/verify/${inviteCode}`
      );
      log.debug('邀请码验证成功');
      return invitation;
    } catch (error) {
      log.error('验证邀请码失败:', error);
      throw error;
    }
  }

  /**
   * 撤销邀请
   * DELETE /api/invitations/:invitationId
   *
   * 注意：此接口应该由团队管理员调用
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      log.debug('撤销邀请:', invitationId);
      await apiService.delete(`/invitations/${invitationId}`);
      log.debug('撤销邀请成功');
    } catch (error) {
      log.error('撤销邀请失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const invitationService = new InvitationService();
export default invitationService;
