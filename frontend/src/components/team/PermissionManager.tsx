/**
 * 项目权限管理组件
 *
 * 管理团队成员对项目的访问权限（查看/编辑）
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNavigationStore } from '../../store/navigationStore';
import { useTeamStore } from '../../store/teamStore';
import permissionService from '../../services/permissionService';
import { ProjectPermissionDetail, ProjectPermissionType } from '../../types/permissionTypes';
import { toast } from '../ui/Toast';
import globalConfirmDialog from '../../services/globalConfirmDialog';
import TeamAvatar from './TeamAvatar';
import Button from '../Button';

interface PermissionManagerProps {
    teamId: string;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ teamId }) => {
    const { t } = useI18n();
    const { projects, workspaces } = useNavigationStore();
    const { members, fetchMembers } = useTeamStore();

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<ProjectPermissionDetail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [addMemberId, setAddMemberId] = useState('');
    const [addPermission, setAddPermission] = useState<ProjectPermissionType>(ProjectPermissionType.VIEW);

    // 获取团队的工作区
    const teamWorkspaces = workspaces.filter(w => w.teamId === teamId);
    const teamWorkspaceIds = new Set(teamWorkspaces.map(w => w.id));

    // 获取团队的项目
    const teamProjects = projects.filter(p => teamWorkspaceIds.has(p.workspaceId));

    // 加载成员列表
    useEffect(() => {
        if (teamId && members.length === 0) {
            fetchMembers(teamId);
        }
    }, [teamId, members.length, fetchMembers]);

    // 加载项目权限
    const fetchPermissions = useCallback(async () => {
        if (!selectedProjectId) return;

        setIsLoading(true);
        try {
            const data = await permissionService.getProjectPermissions(selectedProjectId);
            setPermissions(data);
        } catch (error) {
            console.error('获取权限列表失败:', error);
            toast.error(t('permission:message.fetchFailed', { defaultValue: '获取权限列表失败' }));
        } finally {
            setIsLoading(false);
        }
    }, [selectedProjectId, t]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    // 添加权限
    const handleAddPermission = async () => {
        if (!selectedProjectId || !addMemberId) return;

        setIsSaving(true);
        try {
            await permissionService.setProjectPermission(selectedProjectId, {
                memberId: addMemberId,
                permission: addPermission,
            });
            await fetchPermissions();
            setShowAddDialog(false);
            setAddMemberId('');
            setAddPermission(ProjectPermissionType.VIEW);
            toast.success(t('permission:message.added', { defaultValue: '权限已添加' }));
        } catch (error) {
            console.error('添加权限失败:', error);
            toast.error(t('permission:message.addFailed', { defaultValue: '添加权限失败' }));
        } finally {
            setIsSaving(false);
        }
    };

    // 更新权限
    const handleUpdatePermission = async (permissionId: string, newPermission: ProjectPermissionType) => {
        if (!selectedProjectId) return;

        setIsSaving(true);
        try {
            await permissionService.updateProjectPermission(selectedProjectId, permissionId, {
                permission: newPermission,
            });
            await fetchPermissions();
            toast.success(t('permission:message.updated', { defaultValue: '权限已更新' }));
        } catch (error) {
            console.error('更新权限失败:', error);
            toast.error(t('permission:message.updateFailed', { defaultValue: '更新权限失败' }));
        } finally {
            setIsSaving(false);
        }
    };

    // 删除权限
    const handleDeletePermission = (permission: ProjectPermissionDetail) => {
        if (!selectedProjectId) return;

        globalConfirmDialog.show(
            {
                title: t('permission:action.remove', { defaultValue: '移除权限' }),
                message: t('permission:message.confirmRemove', {
                    defaultValue: `确定要移除 ${permission.member.user.username} 对此项目的访问权限吗？`,
                    name: permission.member.user.username,
                }),
                type: 'danger',
                confirmText: t('common:action.confirm', { defaultValue: '确定' }),
            },
            async () => {
                try {
                    await permissionService.deleteProjectPermission(selectedProjectId, permission.id);
                    await fetchPermissions();
                    toast.success(t('permission:message.removed', { defaultValue: '权限已移除' }));
                } catch (error) {
                    console.error('删除权限失败:', error);
                    toast.error(t('permission:message.removeFailed', { defaultValue: '移除权限失败' }));
                }
            }
        );
    };

    // 获取权限标签配置
    const getPermissionConfig = (permission: ProjectPermissionType) => {
        switch (permission) {
            case ProjectPermissionType.EDIT:
                return {
                    label: t('permission:type.edit', { defaultValue: '编辑' }),
                    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                };
            case ProjectPermissionType.VIEW:
            default:
                return {
                    label: t('permission:type.view', { defaultValue: '查看' }),
                    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                };
        }
    };

    // 获取没有权限的成员（用于添加对话框）
    const membersWithoutPermission = members.filter(
        m => !permissions.some(p => p.memberId === m.id)
    );

    return (
        <div className="space-y-6">
            {/* 项目选择 */}
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    {t('permission:selectProject', { defaultValue: '选择项目' })}
                </label>
                {teamProjects.length === 0 ? (
                    <div className="text-sm text-text-secondary py-4 text-center border border-dashed border-border rounded-lg">
                        {t('permission:noProjects', { defaultValue: '团队暂无项目，请先创建项目' })}
                    </div>
                ) : (
                    <select
                        value={selectedProjectId || ''}
                        onChange={(e) => setSelectedProjectId(e.target.value || null)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                        <option value="">{t('permission:selectProjectPlaceholder', { defaultValue: '请选择一个项目' })}</option>
                        {teamProjects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* 权限列表 */}
            {selectedProjectId && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-text-primary">
                            {t('permission:memberPermissions', { defaultValue: '成员权限' })}
                            {permissions.length > 0 && (
                                <span className="ml-2 text-text-secondary font-normal">
                                    ({permissions.length})
                                </span>
                            )}
                        </h4>
                        {membersWithoutPermission.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddDialog(true)}
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {t('permission:action.add', { defaultValue: '添加权限' })}
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <svg className="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : permissions.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary">
                            <svg className="w-12 h-12 mx-auto text-text-tertiary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <p className="text-sm">{t('permission:empty', { defaultValue: '暂无权限设置，团队成员需要被授权才能访问此项目' })}</p>
                            {membersWithoutPermission.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => setShowAddDialog(true)}
                                >
                                    {t('permission:action.addFirst', { defaultValue: '添加第一个权限' })}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {permissions.map((permission) => {
                                const config = getPermissionConfig(permission.permission);
                                return (
                                    <div
                                        key={permission.id}
                                        className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-border-hover transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <TeamAvatar
                                                name={permission.member.user.username}
                                                avatarUrl={permission.member.user.avatar}
                                                size="md"
                                            />
                                            <div>
                                                <p className="font-medium text-text-primary">
                                                    {permission.member.user.username}
                                                </p>
                                                <p className="text-xs text-text-secondary">
                                                    {permission.member.user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* 权限选择 */}
                                            <select
                                                value={permission.permission}
                                                onChange={(e) => handleUpdatePermission(permission.id, e.target.value as ProjectPermissionType)}
                                                disabled={isSaving}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-primary/20 ${config.className}`}
                                            >
                                                <option value={ProjectPermissionType.VIEW}>
                                                    {t('permission:type.view', { defaultValue: '查看' })}
                                                </option>
                                                <option value={ProjectPermissionType.EDIT}>
                                                    {t('permission:type.edit', { defaultValue: '编辑' })}
                                                </option>
                                            </select>

                                            {/* 删除按钮 */}
                                            <button
                                                onClick={() => handleDeletePermission(permission)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title={t('permission:action.remove', { defaultValue: '移除权限' })}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* 添加权限对话框 */}
            {showAddDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddDialog(false)} />
                    <div className="relative bg-surface rounded-xl shadow-xl p-6 w-full max-w-md mx-4 border border-border">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">
                            {t('permission:dialog.addTitle', { defaultValue: '添加项目权限' })}
                        </h3>

                        <div className="space-y-4">
                            {/* 选择成员 */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    {t('permission:dialog.selectMember', { defaultValue: '选择成员' })}
                                </label>
                                <select
                                    value={addMemberId}
                                    onChange={(e) => setAddMemberId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="">{t('permission:dialog.selectMemberPlaceholder', { defaultValue: '请选择成员' })}</option>
                                    {membersWithoutPermission.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.user.username} ({member.user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 选择权限类型 */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    {t('permission:dialog.selectPermission', { defaultValue: '权限类型' })}
                                </label>
                                <div className="flex gap-3">
                                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                                        addPermission === ProjectPermissionType.VIEW
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:border-border-hover'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="permission"
                                            value={ProjectPermissionType.VIEW}
                                            checked={addPermission === ProjectPermissionType.VIEW}
                                            onChange={() => setAddPermission(ProjectPermissionType.VIEW)}
                                            className="sr-only"
                                        />
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="font-medium">{t('permission:type.view', { defaultValue: '查看' })}</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                                        addPermission === ProjectPermissionType.EDIT
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:border-border-hover'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="permission"
                                            value={ProjectPermissionType.EDIT}
                                            checked={addPermission === ProjectPermissionType.EDIT}
                                            onChange={() => setAddPermission(ProjectPermissionType.EDIT)}
                                            className="sr-only"
                                        />
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="font-medium">{t('permission:type.edit', { defaultValue: '编辑' })}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
                                {t('common:action.cancel', { defaultValue: '取消' })}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddPermission}
                                disabled={!addMemberId || isSaving}
                            >
                                {isSaving ? t('common:status.saving', { defaultValue: '保存中...' }) : t('common:action.confirm', { defaultValue: '确定' })}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionManager;
