/**
 * 团队管理服务
 *
 * 提供团队创建、更新、成员管理等API调用
 */

import { apiService } from '../utils/apiClient';
import { log } from '../utils/env';
import { BaseApiService } from './BaseApiService';
import {
  Team,
  TeamDetail,
  TeamMember,
  TeamInvitation,
  CreateTeamInput,
  UpdateTeamInput,
  InviteMembersInput,
  GetTeamResponse,
  GetTeamDetailResponse,
  GetTeamMembersResponse,
  GetInvitationsResponse,
  SendInvitationsResponse,
  ApiResponse,
} from '../types/teamTypes';

/**
 * 团队服务类
 */
class TeamService extends BaseApiService {
  /**
   * 创建团队
   * POST /api/teams
   */
  async createTeam(data: CreateTeamInput): Promise<Team> {
    try {
      log.debug('创建团队:', data);

      const response = await apiService.post<GetTeamResponse>('/teams', data);

      if (!response.success || !response.data) {
        throw new Error(response.error || '创建团队失败');
      }

      log.debug('团队创建成功:', response.data);
      return response.data;
    } catch (error) {
      log.error('创建团队失败:', error);
      throw error;
    }
  }

  /**
   * 获取我的团队
   * GET /api/teams/my
   */
  async getMyTeam(): Promise<Team | null> {
    try {
      log.debug('获取我的团队');

      const response = await apiService.get<GetTeamResponse>('/teams/my');

      if (!response.success) {
        throw new Error(response.error || '获取团队信息失败');
      }

      log.debug('获取团队信息成功:', response.data);
      return response.data || null;
    } catch (error) {
      log.error('获取我的团队失败:', error);

      // 如果服务器不可用，返回 null
      if (this.isServerUnavailableError(error)) {
        return null;
      }

      throw error;
    }
  }

  /**
   * 获取团队详情
   * GET /api/teams/:teamId
   */
  async getTeamById(teamId: string): Promise<TeamDetail | null> {
    try {
      log.debug('获取团队详情:', teamId);

      const response = await apiService.get<GetTeamDetailResponse>(`/teams/${teamId}`);

      if (!response.success || !response.data) {
        throw new Error(response.error || '获取团队详情失败');
      }

      log.debug('获取团队详情成功:', response.data);
      return response.data;
    } catch (error) {
      log.error('获取团队详情失败:', error);

      // 如果服务器不可用，返回 null
      if (this.isServerUnavailableError(error)) {
        return null;
      }

      throw error;
    }
  }

  /**
   * 更新团队信息
   * PUT /api/teams/:teamId
   */
  async updateTeam(teamId: string, data: UpdateTeamInput): Promise<Team> {
    try {
      log.debug('更新团队信息:', { teamId, data });

      const response = await apiService.put<GetTeamResponse>(`/teams/${teamId}`, data);

      if (!response.success || !response.data) {
        throw new Error(response.error || '更新团队信息失败');
      }

      log.debug('团队信息更新成功:', response.data);
      return response.data;
    } catch (error) {
      log.error('更新团队信息失败:', error);
      throw error;
    }
  }

  /**
   * 解散团队
   * DELETE /api/teams/:teamId
   */
  async dissolveTeam(teamId: string): Promise<void> {
    try {
      log.debug('解散团队:', teamId);

      const response = await apiService.delete<ApiResponse>(`/teams/${teamId}`);

      if (!response.success) {
        throw new Error(response.error || '解散团队失败');
      }

      log.debug('团队解散成功');
    } catch (error) {
      log.error('解散团队失败:', error);
      throw error;
    }
  }

  /**
   * 退出团队
   * POST /api/teams/:teamId/leave
   */
  async leaveTeam(teamId: string): Promise<void> {
    try {
      log.debug('退出团队:', teamId);

      const response = await apiService.post<ApiResponse>(`/teams/${teamId}/leave`);

      if (!response.success) {
        throw new Error(response.error || '退出团队失败');
      }

      log.debug('退出团队成功');
    } catch (error) {
      log.error('退出团队失败:', error);
      throw error;
    }
  }

  /**
   * 获取团队成员列表
   * GET /api/teams/:teamId/members
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      log.debug('获取团队成员列表:', teamId);

      const response = await apiService.get<GetTeamMembersResponse>(`/teams/${teamId}/members`);

      if (!response.success || !response.data) {
        throw new Error(response.error || '获取团队成员列表失败');
      }

      log.debug('获取团队成员列表成功:', response.data.length);
      return response.data;
    } catch (error) {
      log.error('获取团队成员列表失败:', error);

      // 如果服务器不可用，返回空数组
      if (this.isServerUnavailableError(error)) {
        return [];
      }

      throw error;
    }
  }

  /**
   * 移除团队成员
   * DELETE /api/teams/:teamId/members/:memberId
   */
  async removeMember(teamId: string, memberId: string): Promise<void> {
    try {
      log.debug('移除团队成员:', { teamId, memberId });

      const response = await apiService.delete<ApiResponse>(`/teams/${teamId}/members/${memberId}`);

      if (!response.success) {
        throw new Error(response.error || '移除成员失败');
      }

      log.debug('移除成员成功');
    } catch (error) {
      log.error('移除团队成员失败:', error);
      throw error;
    }
  }

  /**
   * 邀请成员
   * POST /api/teams/:teamId/invitations
   */
  async inviteMembers(teamId: string, data: InviteMembersInput): Promise<TeamInvitation[]> {
    try {
      log.debug('邀请成员:', { teamId, emails: data.emails });

      const response = await apiService.post<SendInvitationsResponse>(
        `/teams/${teamId}/invitations`,
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || '邀请成员失败');
      }

      log.debug('邀请成功:', response.data.count);
      return response.data.invitations;
    } catch (error) {
      log.error('邀请成员失败:', error);
      throw error;
    }
  }

  /**
   * 获取团队的邀请列表
   * GET /api/teams/:teamId/invitations
   */
  async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    try {
      log.debug('获取团队邀请列表:', teamId);

      const response = await apiService.get<GetInvitationsResponse>(
        `/teams/${teamId}/invitations`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || '获取邀请列表失败');
      }

      log.debug('获取邀请列表成功:', response.data.length);
      return response.data;
    } catch (error) {
      log.error('获取团队邀请列表失败:', error);

      // 如果服务器不可用，返回空数组
      if (this.isServerUnavailableError(error)) {
        return [];
      }

      throw error;
    }
  }

  /**
   * 获取成员的权限列表
   * GET /api/teams/:teamId/members/:memberId/permissions
   */
  async getMemberPermissions(teamId: string, memberId: string): Promise<any[]> {
    try {
      log.debug('获取成员权限列表:', { teamId, memberId });

      const response = await apiService.get<ApiResponse<any[]>>(
        `/teams/${teamId}/members/${memberId}/permissions`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || '获取成员权限失败');
      }

      log.debug('获取成员权限成功:', response.data.length);
      return response.data;
    } catch (error) {
      log.error('获取成员权限失败:', error);

      // 如果服务器不可用，返回空数组
      if (this.isServerUnavailableError(error)) {
        return [];
      }

      throw error;
    }
  }
}

// 导出单例
export const teamService = new TeamService();
export default teamService;
