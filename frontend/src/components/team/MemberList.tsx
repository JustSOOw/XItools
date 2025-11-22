import React, { useState, useEffect } from 'react';
import { useTeamStore, TeamMember } from '../../store/teamStore';
import { useI18n } from '../../hooks/useI18n';
import globalConfirmDialog from '../../services/globalConfirmDialog';
import TeamAvatar from './TeamAvatar';

interface MemberListProps {
    teamId: string;
}

const MemberList: React.FC<MemberListProps> = ({ teamId }) => {
    const { t } = useI18n();
    const { members, fetchMembers, removeMember, updateMemberRole, isLoading } = useTeamStore();
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMembers(teamId);
    }, [teamId, fetchMembers]);

    const filteredMembers = members.filter(
        (member) =>
            member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    defaultValue: `确定要将 ${member.user.name} 从团队中移除吗？`,
                    name: member.user.name,
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
        return <div className="p-4 text-center">{t('team:message.loadingMembers', { defaultValue: '正在加载成员...' })}</div>;
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('team:action.search', { defaultValue: '搜索' })}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                    <svg
                        className="w-4 h-4 absolute left-2.5 top-3 text-text-secondary"
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

                {selectedMembers.size > 0 && (
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg">
                        <span className="text-sm font-medium text-primary">
                            {selectedMembers.size} {t('team:common.selected', { defaultValue: '已选择' })}
                        </span>
                        <button
                            className="text-sm text-red-500 hover:text-red-600 px-2 py-1"
                            onClick={() => {
                                // Bulk remove logic here
                                console.log('Bulk remove', Array.from(selectedMembers));
                            }}
                        >
                            {t('team:action.bulkRemove', { defaultValue: '批量移除' })}
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-surface-hover">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                {t('team:common.user', { defaultValue: '用户' })}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                {t('team:common.role', { defaultValue: '角色' })}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                {t('team:common.joinedAt', { defaultValue: '加入时间' })}
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                        {filteredMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-surface-hover transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.has(member.id)}
                                        onChange={() => handleSelectMember(member.id)}
                                        className="rounded border-border text-primary focus:ring-primary"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <TeamAvatar name={member.user.name} avatarUrl={member.user.avatarUrl} size="md" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-text-primary">{member.user.name}</div>
                                            <div className="text-sm text-text-secondary">{member.user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                                        className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer hover:text-primary"
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
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        {t('team:action.remove', { defaultValue: '移除' })}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberList;
