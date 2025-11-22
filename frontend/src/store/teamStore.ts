import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Team, TeamMember, TeamInvitation } from '../types/teamTypes'; // We might need to define these types first, but I'll assume they will be in a types file or I'll mock them for now.
import { BaseApiService } from '../services/BaseApiService';

// Define types here for now if they don't exist, or import them.
// Since I can't see types/teamTypes.ts, I'll define interfaces here and move them later if needed.
export interface Team {
    id: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TeamMember {
    id: string;
    userId: string;
    teamId: string;
    role: 'owner' | 'admin' | 'member' | 'guest';
    joinedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

export interface TeamInvitation {
    id: string;
    teamId: string;
    inviterId: string;
    invitedEmail: string;
    role: 'admin' | 'member' | 'guest';
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdAt: string;
    expiresAt: string;
}

interface TeamState {
    teams: Team[];
    currentTeam: Team | null;
    members: TeamMember[];
    invitations: TeamInvitation[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTeams: () => Promise<void>;
    createTeam: (data: { name: string; description?: string; avatarUrl?: string }) => Promise<Team>;
    updateTeam: (id: string, data: Partial<Team>) => Promise<void>;
    dissolveTeam: (id: string) => Promise<void>;
    selectTeam: (id: string) => void;

    fetchMembers: (teamId: string) => Promise<void>;
    removeMember: (teamId: string, memberId: string) => Promise<void>;
    updateMemberRole: (teamId: string, memberId: string, role: TeamMember['role']) => Promise<void>;

    fetchInvitations: (teamId: string) => Promise<void>;
    sendInvitations: (teamId: string, emails: string[], role?: TeamMember['role']) => Promise<void>;
    revokeInvitation: (teamId: string, invitationId: string) => Promise<void>;
    acceptInvitation: (token: string) => Promise<void>;
}

// Mock API service for now, will replace with real API calls
const api = new BaseApiService('/api/teams');

export const useTeamStore = create<TeamState>()(
    persist(
        (set, get) => ({
            teams: [],
            currentTeam: null,
            members: [],
            invitations: [],
            isLoading: false,
            error: null,

            fetchTeams: async () => {
                set({ isLoading: true, error: null });
                try {
                    // const response = await api.get('/');
                    // set({ teams: response.data });
                    // Mock data
                    set({ teams: [] });
                } catch (error: any) {
                    set({ error: error.message });
                } finally {
                    set({ isLoading: false });
                }
            },

            createTeam: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    // const response = await api.post('/', data);
                    // const newTeam = response.data;
                    // set((state) => ({ teams: [...state.teams, newTeam] }));
                    // return newTeam;

                    // Mock
                    const newTeam: Team = {
                        id: Math.random().toString(36).substr(2, 9),
                        ...data,
                        ownerId: 'current-user-id',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    set((state) => ({ teams: [...state.teams, newTeam] }));
                    return newTeam;
                } catch (error: any) {
                    set({ error: error.message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            updateTeam: async (id, data) => {
                set({ isLoading: true, error: null });
                try {
                    // await api.put(`/${id}`, data);
                    set((state) => ({
                        teams: state.teams.map((t) => (t.id === id ? { ...t, ...data } : t)),
                        currentTeam: state.currentTeam?.id === id ? { ...state.currentTeam, ...data } : state.currentTeam,
                    }));
                } catch (error: any) {
                    set({ error: error.message });
                } finally {
                    set({ isLoading: false });
                }
            },

            dissolveTeam: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    // await api.delete(`/${id}`);
                    set((state) => ({
                        teams: state.teams.filter((t) => t.id !== id),
                        currentTeam: state.currentTeam?.id === id ? null : state.currentTeam,
                    }));
                } catch (error: any) {
                    set({ error: error.message });
                } finally {
                    set({ isLoading: false });
                }
            },

            selectTeam: (id) => {
                const team = get().teams.find((t) => t.id === id) || null;
                set({ currentTeam: team });
                if (team) {
                    get().fetchMembers(id);
                    get().fetchInvitations(id);
                }
            },

            fetchMembers: async (teamId) => {
                // Mock
                set({ members: [] });
            },

            removeMember: async (teamId, memberId) => {
                set((state) => ({
                    members: state.members.filter(m => m.id !== memberId)
                }));
            },

            updateMemberRole: async (teamId, memberId, role) => {
                set((state) => ({
                    members: state.members.map(m => m.id === memberId ? { ...m, role } : m)
                }));
            },

            fetchInvitations: async (teamId) => {
                // Mock
                set({ invitations: [] });
            },

            sendInvitations: async (teamId, emails, role = 'member') => {
                // Mock
            },

            revokeInvitation: async (teamId, invitationId) => {
                set((state) => ({
                    invitations: state.invitations.filter(i => i.id !== invitationId)
                }));
            },

            acceptInvitation: async (token) => {
                // Mock API call
            }
        }),
        {
            name: 'team-storage',
            partialize: (state) => ({ teams: state.teams, currentTeam: state.currentTeam }), // Only persist teams and current selection
        }
    )
);
