import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTeamStore } from '../store/teamStore';
import { useI18n } from '../hooks/useI18n';
import MemberList from '../components/team/MemberList';
import InvitationDialog from '../components/team/InvitationDialog';
import TeamAvatar from '../components/team/TeamAvatar';
import Button from '../components/Button';
import globalConfirmDialog from '../services/globalConfirmDialog';
import { toast } from '../components/ui/Toast';

const TeamSettings: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentTeam, updateTeam, dissolveTeam } = useTeamStore();
    const [activeTab, setActiveTab] = useState<'info' | 'members' | 'invitations'>('info');
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [teamName, setTeamName] = useState('');
    const [teamDesc, setTeamDesc] = useState('');
    const [teamAvatarUrl, setTeamAvatarUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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
            setTeamAvatarUrl(base64);
            // Optionally auto-save avatar or wait for explicit save. 
            // User feedback implies "edit avatar" is a distinct action, but typically settings forms save all at once.
            // However, for immediate feedback in the header, updating state is good.
            // If we want immediate persist, we could call updateTeam here, but let's stick to the "Save" button for consistency unless requested otherwise.
            // Actually, the user said "click to change avatar", implying an action. 
            // But let's keep it as part of the form state for now to be safe, or maybe auto-save?
            // Let's stick to form state to avoid partial updates.
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
                            <TeamAvatar name={teamName} avatarUrl={teamAvatarUrl} size="xl" className="w-20 h-20 text-2xl shadow-sm" />
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
                                        </div>

                                        {/* Info Grid */}
                                        <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                                                    {t('team:settings.createdAt', { defaultValue: '创建时间' })}
                                                </label>
                                                <p className="text-sm text-text-primary">
                                                    {new Date(currentTeam.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                                                    {t('team:settings.memberCount', { defaultValue: '成员数量' })}
                                                </label>
                                                <p className="text-sm text-text-primary font-mono">
                                                    {(currentTeam as any).memberCount || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-end">
                                            <Button onClick={handleSaveInfo} variant="primary" size="lg">
                                                {t('team:action.save', { defaultValue: '保存更改' })}
                                            </Button>
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
                                <MemberList teamId={currentTeam.id} />
                            </div>
                        )}

                        {activeTab === 'invitations' && (
                            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                                <div className="text-center text-text-secondary py-8">
                                    {t('team:message.comingSoon', { defaultValue: '即将推出...' })}
                                </div>
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
