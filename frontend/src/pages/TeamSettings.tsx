import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../store/navigationStore';
import { useTeamStore } from '../store/teamStore';
import { useUserStore } from '../store/userStore';
import { useI18n } from '../hooks/useI18n';
import MemberList from '../components/team/MemberList';
import InvitationList from '../components/team/InvitationList';
import InvitationDialog from '../components/team/InvitationDialog';
import PermissionManager from '../components/team/PermissionManager';
import TeamAvatar from '../components/team/TeamAvatar';
import Button from '../components/Button';
import globalConfirmDialog from '../services/globalConfirmDialog';
import { toast } from '../components/ui/Toast';

const TeamSettings: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentTeam, updateTeam, dissolveTeam, members, fetchMembers, isLoading } = useTeamStore();
    const { user: currentUser } = useUserStore();
    const { workspaces, projects, boards } = useNavigationStore();
    const [activeTab, setActiveTab] = useState<'info' | 'members' | 'invitations' | 'permissions'>('info');
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [teamName, setTeamName] = useState('');
    const [teamDesc, setTeamDesc] = useState('');
    const [teamAvatar, setTeamAvatar] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'members' || tab === 'invitations' || tab === 'permissions') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (currentTeam) {
            setTeamName(currentTeam.name);
            setTeamDesc(currentTeam.description || '');
            setTeamAvatar(currentTeam.avatar || '');

            // Fetch members if not already loaded to get owner name
            if (members.length === 0) {
                fetchMembers(currentTeam.id);
            }
        }
    }, [currentTeam]); // Only update when currentTeam changes (initial load or external update)

    // Auto-save logic
    useEffect(() => {
        if (!currentTeam) return;

        // Skip if values haven't changed from currentTeam
        if (teamName === currentTeam.name && teamDesc === (currentTeam.description || '')) {
            return;
        }

        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                await updateTeam(currentTeam.id, {
                    name: teamName,
                    description: teamDesc,
                    // Avatar is handled separately
                });
                // Toast is handled in store, but maybe too frequent? 
                // Store toast says "Team info updated". 
                // For auto-save, we might want a subtle indicator instead of a toast every time.
                // But for now, let's keep it simple.
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setIsSaving(false);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [teamName, teamDesc, currentTeam, updateTeam]);

    const handleTabChange = (tab: 'info' | 'members' | 'invitations' | 'permissions') => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleDissolveTeam = () => {
        if (!currentTeam) return;

        const memberCount = (currentTeam as any).memberCount || members.length || 0;
        const warningMessage = t('team:message.confirmDissolveDetail', {
            defaultValue: `确定要解散团队 "${currentTeam.name}" 吗？

⚠️ 此操作不可撤销！以下数据将被永久删除：

• 团队的所有工作区、项目、看板
• 所有任务、评论、附件
• 所有成员的项目权限
• 所有待处理的邀请记录
${memberCount > 1 ? `• ${memberCount - 1} 位团队成员将被移出团队` : ''}

请谨慎操作！`,
            name: currentTeam.name,
            memberCount: memberCount - 1,
        });

        globalConfirmDialog.show(
            {
                title: t('team:action.dissolve', { defaultValue: '解散团队' }),
                message: warningMessage,
                type: 'danger',
                confirmText: t('team:action.confirmDissolve', { defaultValue: '确认解散' }),
            },
            async () => {
                await dissolveTeam(currentTeam.id);
                navigate('/'); // Redirect to home after dissolve
            }
        );
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('文件读取失败'));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error(t('common:error.invalidFileType', { defaultValue: '请选择图片文件' }));
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            toast.error(t('common:error.fileTooLarge', { defaultValue: '文件大小不能超过100MB' }));
            return;
        }

        setIsUploading(true);
        try {
            const base64 = await convertFileToBase64(file);
            setTeamAvatar(base64);
            // Immediate save for avatar
            if (currentTeam) {
                await updateTeam(currentTeam.id, { avatar: base64 });
            }
        } catch (error) {
            console.error('Error reading file:', error);
            toast.error(t('common:error.uploadFailed', { defaultValue: '图片读取失败' }));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t('common:message.copied', { defaultValue: '已复制到剪贴板' }));
    };

    // Get owner name logic
    let ownerName = t('common:unknown', { defaultValue: '未知' });

    // 1. Check if current user is owner (Most common case for settings page)
    if (currentUser && currentTeam?.ownerId === currentUser.id) {
        ownerName = currentUser.username;
    }
    // 2. Try to find in members list
    else {
        const ownerMember = members.find(m => m.userId === currentTeam?.ownerId);
        if (ownerMember) {
            ownerName = ownerMember.user.username;
        }
        // 3. Loading state
        else if (isLoading && members.length === 0) {
            ownerName = t('common:status.loading', { defaultValue: '加载中...' });
        }
    }

    // Calculate statistics
    const teamWorkspaces = workspaces.filter(w => w.teamId === currentTeam?.id);
    const teamWorkspaceIds = new Set(teamWorkspaces.map(w => w.id));
    const teamProjects = projects.filter(p => teamWorkspaceIds.has(p.workspaceId));
    const teamBoards = boards.filter(b => (b.workspaceId && teamWorkspaceIds.has(b.workspaceId)));

    if (!currentTeam) {
        return <div className="p-8 text-center">{t('team:message.noTeamSelected', { defaultValue: '未选择团队' })}</div>;
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Top Toolbar removed - moved to global header */}

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6">
                    {/* Header Section with Editable Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <TeamAvatar name={teamName} avatarUrl={teamAvatar} size="xl" className="w-20 h-20 text-2xl shadow-sm" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">{teamName}</h2>
                            <p className="text-text-secondary mt-1">{t('team:settings.subtitle', { defaultValue: '管理您的团队设置和成员' })}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border mb-8">
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'info'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                            onClick={() => handleTabChange('info')}
                        >
                            {t('team:settings.basicInfo', { defaultValue: '团队信息' })}
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'members'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                            onClick={() => handleTabChange('members')}
                        >
                            {t('team:settings.memberManage', { defaultValue: '成员管理' })}
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'invitations'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                            onClick={() => handleTabChange('invitations')}
                        >
                            {t('team:settings.invitations', { defaultValue: '邀请记录' })}
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'permissions'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                            onClick={() => handleTabChange('permissions')}
                        >
                            {t('team:settings.permissions', { defaultValue: '权限管理' })}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-8">
                        {activeTab === 'info' && (
                            <>
                                <div className="bg-surface rounded-xl border border-border p-8 shadow-sm">
                                    <div className="max-w-3xl">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    {t('team:settings.teamName', { defaultValue: '团队名称' })}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={teamName}
                                                    onChange={(e) => setTeamName(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    {t('team:settings.description', { defaultValue: '描述' })}
                                                </label>
                                                <textarea
                                                    value={teamDesc}
                                                    onChange={(e) => setTeamDesc(e.target.value)}
                                                    rows={4}
                                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                                                />
                                            </div>
                                            <div className="flex justify-end h-6">
                                                {isSaving && (
                                                    <span className="text-xs text-text-secondary flex items-center gap-1">
                                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        {t('common:status.saving', { defaultValue: '保存中...' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                                                    {t('team:settings.admin', { defaultValue: '管理员' })}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-text-primary">
                                                        {ownerName}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                                                    {t('team:settings.createdAt', { defaultValue: '创建时间' })}
                                                </label>
                                                <div className="text-sm font-medium text-text-primary">
                                                    {new Date(currentTeam.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                                                    {t('team:settings.memberCount', { defaultValue: '成员数量' })}
                                                </label>
                                                <div className="text-sm font-medium text-text-primary">
                                                    {currentTeam.memberCount || members.length || 0}
                                                </div>
                                            </div>

                                            {/* Statistics Row 2 */}
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                                                    {t('team:settings.workspaces', { defaultValue: '工作区' })}
                                                </label>
                                                <div className="text-sm font-medium text-text-primary">
                                                    {teamWorkspaces.length}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                                                    {t('team:settings.projects', { defaultValue: '项目' })}
                                                </label>
                                                <div className="text-sm font-medium text-text-primary">
                                                    {teamProjects.length}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                                                    {t('team:settings.boards', { defaultValue: '看板' })}
                                                </label>
                                                <div className="text-sm font-medium text-text-primary">
                                                    {teamBoards.length}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="bg-surface rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden shadow-sm">
                                    <div className="p-6 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20">
                                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            {t('team:settings.dangerZone', { defaultValue: '危险区域' })}
                                        </h3>
                                    </div>
                                    <div className="p-6 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-text-primary mb-1">
                                                {t('team:action.dissolve', { defaultValue: '解散团队' })}
                                            </h4>
                                            <p className="text-sm text-text-secondary">
                                                {t('team:message.dissolveWarning', { defaultValue: '一旦解散团队，所有数据将被永久删除且无法恢复。' })}
                                            </p>
                                        </div>
                                        <Button onClick={handleDissolveTeam} variant="danger">
                                            {t('team:action.dissolve', { defaultValue: '解散团队' })}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'members' && (
                            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                                <MemberList
                                    teamId={currentTeam.id}
                                    onInvite={() => setShowInviteDialog(true)}
                                />
                            </div>
                        )}

                        {activeTab === 'invitations' && (
                            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                                <InvitationList
                                    teamId={currentTeam.id}
                                    onInviteClick={() => setShowInviteDialog(true)}
                                />
                            </div>
                        )}

                        {activeTab === 'permissions' && (
                            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary">
                                            {t('permission:title', { defaultValue: '项目权限管理' })}
                                        </h3>
                                        <p className="text-sm text-text-secondary mt-1">
                                            {t('permission:description', { defaultValue: '管理团队成员对项目的访问权限' })}
                                        </p>
                                    </div>
                                </div>
                                <PermissionManager teamId={currentTeam.id} />
                            </div>
                        )}
                    </div>

                    <InvitationDialog
                        isOpen={showInviteDialog}
                        onClose={() => setShowInviteDialog(false)}
                        teamId={currentTeam.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default TeamSettings;
