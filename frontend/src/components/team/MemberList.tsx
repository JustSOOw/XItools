import React, { useState, useEffect } from 'react';
import { useTeamStore, TeamMember } from '../../store/teamStore';
import { useI18n } from '../../hooks/useI18n';
import globalConfirmDialog from '../../services/globalConfirmDialog';
import TeamAvatar from './TeamAvatar';
import Button from '../Button';

interface MemberListProps {
    teamId: string;
    onInvite?: () => void;
}

const MemberList: React.FC<MemberListProps> = ({ teamId, onInvite }) => {
    const { t } = useI18n();
    const { members, fetchMembers, removeMember, updateMemberRole, isLoading } = useTeamStore();
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMembers(teamId);
    }, [teamId, fetchMembers]);

    const filteredMembers = members.filter(
        (member) =>
            (member.user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedMembers(new Set(filteredMembers.map((m) => m.id)));
        } else {
            setSelectedMembers(new Set());
        }
    };

    const handleSelectMember = (id: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedMembers(newSelected);
    };

    const handleRemoveMember = (member: TeamMember) => {
        globalConfirmDialog.show(
            {
                title: t('team:action.remove', { defaultValue: '移除成员' }),
                message: t('team:message.confirmRemove', {
                    defaultValue: `确定要将 ${member.user.username} 从团队中移除吗？`,
                    name: member.user.username,
                }),
                type: 'danger',
                confirmText: t('team:action.remove', { defaultValue: '移除' }),
            },
            async () => {
                await removeMember(teamId, member.id);
            }
        );
    };

    const handleRoleChange = async (memberId: string, newRole: TeamMember['role']) => {
        await updateMemberRole(teamId, memberId, newRole);
    };

    if (isLoading && members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                <svg className="w-8 h-8 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>{t('team:message.loadingMembers', { defaultValue: '正在加载成员...' })}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder={t('team:action.search', { defaultValue: '搜索成员...' })}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                    <svg
                        className="w-5 h-5 absolute left-3 top-2.5 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                <div className="flex items-center gap-3">
                    {selectedMembers.size > 0 && (
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg animate-fade-in">
                            <span className="text-sm font-medium text-primary">
                                {selectedMembers.size} {t('team:common.selected', { defaultValue: '已选择' })}
                            </span>
                            <button
                                className="text-sm text-red-500 hover:text-red-600 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                onClick={() => {
                                    // Bulk remove logic here
                                    console.log('Bulk remove', Array.from(selectedMembers));
                                }}
                            >
                                {t('team:action.bulkRemove', { defaultValue: '批量移除' })}
                            </button>
                        </div>
                    )}

                    {onInvite && (
                        <Button onClick={onInvite} variant="primary" className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('team:action.invite', { defaultValue: '邀请成员' })}
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-surface-hover">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                                />
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                {t('team:common.user', { defaultValue: '用户' })}
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                {t('team:common.role', { defaultValue: '角色' })}
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                {t('team:common.joinedAt', { defaultValue: '加入时间' })}
                            </th>
                            <th scope="col" className="relative px-6 py-4">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                        {filteredMembers.length > 0 ? (
                            filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-surface-hover transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.has(member.id)}
                                            onChange={() => handleSelectMember(member.id)}
                                            className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <TeamAvatar name={member.user.username} avatarUrl={member.user.avatar} size="md" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-primary">{member.user.username}</div>
                                                <div className="text-sm text-text-secondary">{member.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                                            className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer hover:text-primary py-1 pl-0 pr-8"
                                        >
                                            <option value="owner">{t('team:role.owner', { defaultValue: '所有者' })}</option>
                                            <option value="admin">{t('team:role.admin', { defaultValue: '管理员' })}</option>
                                            <option value="member">{t('team:role.member', { defaultValue: '成员' })}</option>
                                            <option value="guest">{t('team:role.viewer', { defaultValue: '访客' })}</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                        {new Date(member.joinedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleRemoveMember(member)}
                                            className="text-text-secondary hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title={t('team:action.remove', { defaultValue: '移除' })}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-lg font-medium text-text-primary mb-1">
                                            {searchTerm ? t('team:message.noSearchResults', { defaultValue: '未找到匹配的成员' }) : t('team:message.noMembers', { defaultValue: '暂无成员' })}
                                        </p>
                                        <p className="text-sm text-text-secondary mb-4">
                                            {searchTerm ? t('team:message.tryDifferentSearch', { defaultValue: '尝试不同的搜索词' }) : t('team:message.inviteMembersHint', { defaultValue: '邀请团队成员开始协作' })}
                                        </p>
                                        {!searchTerm && onInvite && (
                                            <Button onClick={onInvite} variant="outline" size="sm">
                                                {t('team:action.inviteNow', { defaultValue: '立即邀请' })}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberList;
