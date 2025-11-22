import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTeamStore } from '../store/teamStore';
import { useI18n } from '../hooks/useI18n';
import MemberList from '../components/team/MemberList';
import InvitationDialog from '../components/team/InvitationDialog';
import TeamAvatar from '../components/team/TeamAvatar';
import Button from '../components/Button';
import globalConfirmDialog from '../services/globalConfirmDialog';

const TeamSettings: React.FC = () => {
    const { t } = useI18n();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentTeam, updateTeam, dissolveTeam } = useTeamStore();
    const [activeTab, setActiveTab] = useState<'info' | 'members' | 'invitations'>('info');
    const [showInviteDialog, setShowInviteDialog] = useState(false);

    // Form state
    const [teamName, setTeamName] = useState('');
    const [teamDesc, setTeamDesc] = useState('');
    const [teamAvatarUrl, setTeamAvatarUrl] = useState('');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'members' || tab === 'invitations') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (currentTeam) {
            setTeamName(currentTeam.name);
            setTeamDesc(currentTeam.description || '');
            setTeamAvatarUrl(currentTeam.avatarUrl || '');
        }
    }, [currentTeam]);

    const handleTabChange = (tab: 'info' | 'members' | 'invitations') => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleSaveInfo = async () => {
        if (!currentTeam) return;
        await updateTeam(currentTeam.id, {
            name: teamName,
            description: teamDesc,
            avatarUrl: teamAvatarUrl,
        });
    };

    const handleDissolveTeam = () => {
        if (!currentTeam) return;
        globalConfirmDialog.show(
            {
                title: t('team:action.dissolve', { defaultValue: '解散团队' }),
                message: t('team:message.confirmDissolve', {
                    defaultValue: `确定要解散团队 "${currentTeam.name}" 吗？此操作不可撤销，所有数据将被删除或转移。`,
                    name: currentTeam.name,
                }),
                type: 'danger',
                confirmText: t('team:action.delete', { defaultValue: '删除' }),
            },
            async () => {
                await dissolveTeam(currentTeam.id);
                // Redirect to home or personal workspace handled by store or router
            }
        );
    };

    if (!currentTeam) {
        return <div className="p-8 text-center">{t('team:message.noTeamSelected', { defaultValue: '未选择团队' })}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <TeamAvatar name={currentTeam.name} avatarUrl={currentTeam.avatarUrl} size="xl" />
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{currentTeam.name}</h1>
                        <p className="text-text-secondary">{t('team:settings.title', { defaultValue: '团队设置' })}</p>
                    </div>
                </div>
                {activeTab === 'members' && (
                    <Button onClick={() => setShowInviteDialog(true)}>
                        {t('team:action.invite', { defaultValue: '邀请成员' })}
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
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
            </div>

            {/* Content */}
            <div className="bg-surface rounded-xl border border-border p-6">
                {activeTab === 'info' && (
                    <div className="space-y-6 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                {t('team:settings.teamName', { defaultValue: '团队名称' })}
                            </label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                {t('team:settings.description', { defaultValue: '描述' })}
                            </label>
                            <textarea
                                value={teamDesc}
                                onChange={(e) => setTeamDesc(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                {t('team:settings.avatarUrl', { defaultValue: '头像 URL' })}
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={teamAvatarUrl}
                                    onChange={(e) => setTeamAvatarUrl(e.target.value)}
                                    placeholder="https://example.com/avatar.png"
                                    className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                />
                                <div className="flex-shrink-0">
                                    <TeamAvatar name={teamName} avatarUrl={teamAvatarUrl} size="md" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-text-secondary">
                                {t('team:settings.avatarHelp', { defaultValue: '输入图片链接，或留空使用默认头像' })}
                            </p>
                        </div>

                        <div className="pt-4 flex justify-between items-center">
                            <Button onClick={handleSaveInfo} variant="primary">
                                {t('team:action.save', { defaultValue: '保存更改' })}
                            </Button>

                            <div className="pt-8 border-t border-border mt-8 w-full">
                                <h3 className="text-red-500 font-medium mb-2">{t('team:settings.dangerZone', { defaultValue: '危险区域' })}</h3>
                                <Button onClick={handleDissolveTeam} variant="danger">
                                    {t('team:action.dissolve', { defaultValue: '解散团队' })}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <MemberList teamId={currentTeam.id} />
                )}

                {activeTab === 'invitations' && (
                    <div className="text-center text-text-secondary py-8">
                        {t('team:message.comingSoon', { defaultValue: '即将推出...' })}
                    </div>
                )}
            </div>

            <InvitationDialog
                isOpen={showInviteDialog}
                onClose={() => setShowInviteDialog(false)}
                teamId={currentTeam.id}
            />
        </div>
    );
};

export default TeamSettings;
