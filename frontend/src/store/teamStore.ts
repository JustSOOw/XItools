/**
 * 团队状态管理
 *
 * 使用真实API调用，替换所有mock数据
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '../components/ui/Toast';
import teamService from '../services/teamService';
import invitationService from '../services/invitationService';
import {
  Team,
  TeamMember,
  TeamInvitation,
  CreateTeamInput,
  UpdateTeamInput,
} from '../types/teamTypes';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  invitations: TeamInvitation[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMyTeam: () => Promise<void>;
  createTeam: (data: CreateTeamInput) => Promise<Team>;
  updateTeam: (id: string, data: UpdateTeamInput) => Promise<void>;
  dissolveTeam: (id: string) => Promise<void>;
  selectTeam: (team: Team | null) => void;
  leaveTeam: (id: string) => Promise<void>;

  fetchMembers: (teamId: string) => Promise<void>;
  removeMember: (teamId: string, memberId: string) => Promise<void>;

  fetchInvitations: (teamId: string) => Promise<void>;
  sendInvitations: (teamId: string, emails: string[]) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],
      currentTeam: null,
      members: [],
      invitations: [],
      isLoading: false,
      error: null,

      /**
       * 获取我的团队
       */
      fetchMyTeam: async () => {
        set({ isLoading: true, error: null });
        try {
          const team = await teamService.getMyTeam();
          set({ currentTeam: team, teams: team ? [team] : [] });
        } catch (error: any) {
          set({ error: error.message });
          console.error('获取团队信息失败:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 创建团队
       */
      createTeam: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newTeam = await teamService.createTeam(data);
          set({ currentTeam: newTeam, teams: [newTeam] });
          toast.success('团队创建成功');
          return newTeam;
        } catch (error: any) {
          set({ error: error.message });
          toast.error(error.message || '创建团队失败');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 更新团队信息
       */
      updateTeam: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTeam = await teamService.updateTeam(id, data);
          set((state) => ({
            currentTeam: state.currentTeam?.id === id ? updatedTeam : state.currentTeam,
            teams: state.teams.map((t) => (t.id === id ? updatedTeam : t)),
          }));
          toast.success('团队信息更新成功');
        } catch (error: any) {
          set({ error: error.message });
          toast.error(error.message || '更新团队信息失败');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 解散团队
       */
      dissolveTeam: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await teamService.dissolveTeam(id);
          set({
            teams: [],
            currentTeam: null,
            members: [],
            invitations: [],
          });
          toast.success('团队已解散');
        } catch (error: any) {
          set({ error: error.message });
          toast.error(error.message || '解散团队失败');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 退出团队
       */
      leaveTeam: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await teamService.leaveTeam(id);
          set({
            teams: [],
            currentTeam: null,
            members: [],
            invitations: [],
          });
          toast.success('已退出团队');
        } catch (error: any) {
          set({ error: error.message });
          toast.error(error.message || '退出团队失败');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 选择团队（设置当前团队）
       */
      selectTeam: (team) => {
        set({ currentTeam: team });
        if (team) {
          get().fetchMembers(team.id);
          get().fetchInvitations(team.id);
        }
      },

      /**
       * 获取团队成员列表
       */
      fetchMembers: async (teamId) => {
        set({ isLoading: true, error: null });
        try {
          const members = await teamService.getTeamMembers(teamId);
          set({ members });
        } catch (error: any) {
          set({ error: error.message });
          console.error('获取团队成员失败:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 移除团队成员
       */
      removeMember: async (teamId, memberId) => {
        set({ isLoading: true, error: null });
        try {
          await teamService.removeMember(teamId, memberId);
          set((state) => ({
            members: state.members.filter((m) => m.id !== memberId),
          }));
          toast.success('成员已移除');
        } catch (error: any) {
          set({ error: error.message });
          toast.error(error.message || '移除成员失败');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 获取团队邀请列表
       */
      fetchInvitations: async (teamId) => {
        set({ isLoading: true, error: null });
        try {
          const invitations = await teamService.getTeamInvitations(teamId);
          set({ invitations });
        } catch (error: any) {
          set({ error: error.message });
          console.error('获取邀请列表失败:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 发送邀请
       */
      sendInvitations: async (teamId, emails) => {
        set({ isLoading: true, error: null });
        try {
          const newInvitations = await teamService.inviteMembers(teamId, { emails });
          set((state) => ({
            invitations: [...state.invitations, ...newInvitations],
          }));
          toast.success(`已发送 ${newInvitations.length} 个邀请`);
        } catch (error: any) {
          set({ error: error.message });
          toast.error(error.message || '发送邀请失败');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 撤销邀请
       */
      revokeInvitation: async (invitationId) => {
        set({ isLoading: true, error: null });
        try {
          await invitationService.cancelInvitation(invitationId);
          set((state) => ({
            invitations: state.invitations.filter((i) => i.id !== invitationId),
          }));
          toast.success('邀请已撤销');
        } catch (error: any) {
          set({ error: error.message });
          toast.error(error.message || '撤销邀请失败');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'team-storage',
      partialize: (state) => ({ currentTeam: state.currentTeam }), // 只持久化当前选择的团队
    }
  )
);
