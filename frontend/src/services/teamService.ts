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
  UpdateMemberRoleInput,
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
      // apiService.post 已经自动提取 response.data.data 并检查 success
      const team = await apiService.post<Team>('/teams', data);
      log.debug('团队创建成功:', team);
      return team;
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
      const team = await apiService.get<Team>('/teams/my');
      log.debug('获取团队信息成功:', team);
      return team;
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
      const team = await apiService.get<TeamDetail>(`/teams/${teamId}`);
      log.debug('获取团队详情成功:', team);
      return team;
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
      const team = await apiService.put<Team>(`/teams/${teamId}`, data);
      log.debug('团队信息更新成功:', team);
      return team;
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
      await apiService.delete(`/teams/${teamId}`);
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
      await apiService.post(`/teams/${teamId}/leave`);
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
      const members = await apiService.get<TeamMember[]>(`/teams/${teamId}/members`);
      log.debug('获取团队成员列表成功:', members.length);
      return members;
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
      await apiService.delete(`/teams/${teamId}/members/${memberId}`);
      log.debug('移除成员成功');
    } catch (error) {
      log.error('移除团队成员失败:', error);
      throw error;
    }
  }

  /**
   * 更新成员角色
   * PUT /api/teams/:teamId/members/:memberId/role
   */
  async updateMemberRole(
    teamId: string,
    memberId: string,
    data: UpdateMemberRoleInput
  ): Promise<TeamMember> {
    try {
      log.debug('更新成员角色:', { teamId, memberId, role: data.role });
      const updatedMember = await apiService.put<TeamMember>(
        `/teams/${teamId}/members/${memberId}/role`,
        data
      );
      log.debug('更新成员角色成功:', updatedMember);
      return updatedMember;
    } catch (error) {
      log.error('更新成员角色失败:', error);
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

      // 后端返回 { invitations: TeamInvitation[], count: number }
      const result = await apiService.post<{
        invitations: TeamInvitation[];
        count: number;
      }>(`/teams/${teamId}/invitations`, data);

      log.debug('邀请成功:', result.count);
      return result.invitations;
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
      const invitations = await apiService.get<TeamInvitation[]>(`/teams/${teamId}/invitations`);
      log.debug('获取邀请列表成功:', invitations.length);
      return invitations;
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
      const permissions = await apiService.get<any[]>(
        `/teams/${teamId}/members/${memberId}/permissions`
      );
      log.debug('获取成员权限成功:', permissions.length);
      return permissions;
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
