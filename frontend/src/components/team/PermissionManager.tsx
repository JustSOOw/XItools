/**
 * 项目权限管理组件
 *
 * 权限规则：
 * - 所有者 (owner)：拥有所有权限，不在此列表显示
 * - 管理员 (admin)：拥有所有项目的查看和编辑权限，不需要设置
 * - 成员 (member)：默认拥有查看权限，可以授予编辑权限
 * - 访客 (guest)：默认无任何权限，只能授予查看权限，不能授予编辑权限
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNavigationStore, Project } from '../../store/navigationStore';
import { useTeamStore } from '../../store/teamStore';
import permissionService from '../../services/permissionService';
import { ProjectPermissionDetail, ProjectPermissionType } from '../../types/permissionTypes';
import { TeamMember } from '../../types/teamTypes';
import { toast } from '../ui/Toast';
import TeamAvatar from './TeamAvatar';
import Button from '../Button';
import {
    EyeIcon,
    PencilSquareIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

interface PermissionManagerProps {
    teamId: string;
}

interface MemberPermissions {
    member: TeamMember;
    editableProjects: Set<string>; // 可编辑的项目ID集合（仅对 member 有效）
    viewableProjects: Set<string>; // 可查看的项目ID集合（仅对 guest 有效）
    permissions: ProjectPermissionDetail[]; // 原始权限数据
    isGuest: boolean; // 是否为访客
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ teamId }) => {
    const { t } = useI18n();
    const { projects, workspaces } = useNavigationStore();
    const { members, fetchMembers } = useTeamStore();

    const [memberPermissions, setMemberPermissions] = useState<MemberPermissions[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());

    // 使用 useMemo 缓存计算结果
    const teamWorkspaces = useMemo(
        () => workspaces.filter(w => w.teamId === teamId),
        [workspaces, teamId]
    );

    const teamWorkspaceIds = useMemo(
        () => new Set(teamWorkspaces.map(w => w.id)),
        [teamWorkspaces]
    );

    const teamProjects = useMemo(
        () => projects.filter(p => teamWorkspaceIds.has(p.workspaceId)),
        [projects, teamWorkspaceIds]
    );

    // 过滤掉团队所有者和管理员（他们不需要管理权限）
    const managableMembers = useMemo(
        () => members.filter(m => {
            const role = m.role.toLowerCase();
            return role !== 'owner' && role !== 'admin';
        }),
        [members]
    );

    const hasLoadedRef = useRef(false);
    const lastFetchKeyRef = useRef('');

    useEffect(() => {
        if (teamId && members.length === 0) {
            fetchMembers(teamId);
        }
    }, [teamId, members.length, fetchMembers]);

    const fetchAllPermissions = useCallback(async (forceRefresh = false) => {
        const fetchKey = `${teamProjects.map(p => p.id).join(',')}_${managableMembers.map(m => m.id).join(',')}`;

        if (!forceRefresh && lastFetchKeyRef.current === fetchKey && hasLoadedRef.current) {
            return;
        }

        if (teamProjects.length === 0 || managableMembers.length === 0) {
            setMemberPermissions([]);
            hasLoadedRef.current = true;
            lastFetchKeyRef.current = fetchKey;
            return;
        }

        setIsLoading(true);
        try {
            const allPermissions: ProjectPermissionDetail[] = [];
            for (const project of teamProjects) {
                const projectPerms = await permissionService.getProjectPermissions(project.id);
                allPermissions.push(...projectPerms);
            }

            const permissionsByMember: MemberPermissions[] = managableMembers.map(member => {
                const memberPerms = allPermissions.filter(p => p.memberId === member.id);
                const isGuest = member.role.toLowerCase() === 'guest';

                // 对于访客，收集查看权限；对于成员，收集编辑权限
                const editableProjects = new Set(
                    memberPerms
                        .filter(p => p.permission === ProjectPermissionType.EDIT)
                        .map(p => p.projectId)
                );

                const viewableProjects = new Set(
                    memberPerms
                        .filter(p => p.permission === ProjectPermissionType.VIEW)
                        .map(p => p.projectId)
                );

                return {
                    member,
                    editableProjects,
                    viewableProjects,
                    permissions: memberPerms,
                    isGuest,
                };
            });

            setMemberPermissions(permissionsByMember);
            hasLoadedRef.current = true;
            lastFetchKeyRef.current = fetchKey;
        } catch (error) {
            console.error('获取权限列表失败:', error);
            toast.error(t('permission:message.fetchFailed', { defaultValue: '获取权限列表失败' }));
        } finally {
            setIsLoading(false);
        }
    }, [teamProjects, managableMembers, t]);

    useEffect(() => {
        fetchAllPermissions();
    }, [fetchAllPermissions]);

    const toggleMemberExpanded = (memberId: string) => {
        setExpandedMembers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(memberId)) {
                newSet.delete(memberId);
            } else {
                newSet.add(memberId);
            }
            return newSet;
        });
    };

    // 切换访客的查看权限
    const handleToggleViewPermission = async (
        memberPerm: MemberPermissions,
        project: Project,
        hasView: boolean
    ) => {
        const memberId = memberPerm.member.id;
        setIsSaving(memberId);

        try {
            if (hasView) {
                // 移除查看权限
                const existingPerm = memberPerm.permissions.find(
                    p => p.projectId === project.id
                );
                if (existingPerm) {
                    await permissionService.deleteProjectPermission(project.id, existingPerm.id);
                }
            } else {
                // 添加查看权限
                await permissionService.setProjectPermission(project.id, {
                    memberId,
                    permission: ProjectPermissionType.VIEW,
                });
            }

            await fetchAllPermissions(true);
            toast.success(
                hasView
                    ? t('permission:message.viewRemoved', { defaultValue: '已移除查看权限' })
                    : t('permission:message.viewGranted', { defaultValue: '已授予查看权限' })
            );
        } catch (error) {
            console.error('更新权限失败:', error);
            toast.error(t('permission:message.updateFailed', { defaultValue: '更新权限失败' }));
        } finally {
            setIsSaving(null);
        }
    };

    // 切换成员的编辑权限
    const handleToggleEditPermission = async (
        memberPerm: MemberPermissions,
        project: Project,
        hasEdit: boolean
    ) => {
        const memberId = memberPerm.member.id;
        setIsSaving(memberId);

        try {
            if (hasEdit) {
                const existingPerm = memberPerm.permissions.find(
                    p => p.projectId === project.id && p.permission === ProjectPermissionType.EDIT
                );
                if (existingPerm) {
                    await permissionService.updateProjectPermission(project.id, existingPerm.id, {
                        permission: ProjectPermissionType.VIEW,
                    });
                }
            } else {
                const existingPerm = memberPerm.permissions.find(p => p.projectId === project.id);
                if (existingPerm) {
                    await permissionService.updateProjectPermission(project.id, existingPerm.id, {
                        permission: ProjectPermissionType.EDIT,
                    });
                } else {
                    await permissionService.setProjectPermission(project.id, {
                        memberId,
                        permission: ProjectPermissionType.EDIT,
                    });
                }
            }

            await fetchAllPermissions(true);
            toast.success(
                hasEdit
                    ? t('permission:message.editRemoved', { defaultValue: '已移除编辑权限' })
                    : t('permission:message.editGranted', { defaultValue: '已授予编辑权限' })
            );
        } catch (error) {
            console.error('更新权限失败:', error);
            toast.error(t('permission:message.updateFailed', { defaultValue: '更新权限失败' }));
        } finally {
            setIsSaving(null);
        }
    };

    // 批量设置访客查看权限
    const handleBatchSetViewPermission = async (memberPerm: MemberPermissions, grantView: boolean) => {
        const memberId = memberPerm.member.id;
        setIsSaving(memberId);

        try {
            for (const project of teamProjects) {
                const hasView = memberPerm.viewableProjects.has(project.id);
                if (grantView && !hasView) {
                    await permissionService.setProjectPermission(project.id, {
                        memberId,
                        permission: ProjectPermissionType.VIEW,
                    });
                } else if (!grantView && hasView) {
                    const existingPerm = memberPerm.permissions.find(p => p.projectId === project.id);
                    if (existingPerm) {
                        await permissionService.deleteProjectPermission(project.id, existingPerm.id);
                    }
                }
            }

            await fetchAllPermissions(true);
            toast.success(
                grantView
                    ? t('permission:message.allViewGranted', { defaultValue: '已授予所有项目查看权限' })
                    : t('permission:message.allViewRemoved', { defaultValue: '已移除所有项目查看权限' })
            );
        } catch (error) {
            console.error('批量更新权限失败:', error);
            toast.error(t('permission:message.batchUpdateFailed', { defaultValue: '批量更新权限失败' }));
        } finally {
            setIsSaving(null);
        }
    };

    // 批量设置成员编辑权限
    const handleBatchSetEditPermission = async (memberPerm: MemberPermissions, grantEdit: boolean) => {
        const memberId = memberPerm.member.id;
        setIsSaving(memberId);

        try {
            for (const project of teamProjects) {
                const hasEdit = memberPerm.editableProjects.has(project.id);
                if (grantEdit && !hasEdit) {
                    const existingPerm = memberPerm.permissions.find(p => p.projectId === project.id);
                    if (existingPerm) {
                        await permissionService.updateProjectPermission(project.id, existingPerm.id, {
                            permission: ProjectPermissionType.EDIT,
                        });
                    } else {
                        await permissionService.setProjectPermission(project.id, {
                            memberId,
                            permission: ProjectPermissionType.EDIT,
                        });
                    }
                } else if (!grantEdit && hasEdit) {
                    const existingPerm = memberPerm.permissions.find(
                        p => p.projectId === project.id && p.permission === ProjectPermissionType.EDIT
                    );
                    if (existingPerm) {
                        await permissionService.updateProjectPermission(project.id, existingPerm.id, {
                            permission: ProjectPermissionType.VIEW,
                        });
                    }
                }
            }

            await fetchAllPermissions(true);
            toast.success(
                grantEdit
                    ? t('permission:message.allEditGranted', { defaultValue: '已授予所有项目编辑权限' })
                    : t('permission:message.allEditRemoved', { defaultValue: '已移除所有项目编辑权限' })
            );
        } catch (error) {
            console.error('批量更新权限失败:', error);
            toast.error(t('permission:message.batchUpdateFailed', { defaultValue: '批量更新权限失败' }));
        } finally {
            setIsSaving(null);
        }
    };

    const getRoleConfig = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return {
                    label: t('team:role.admin', { defaultValue: '管理员' }),
                    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                };
            case 'member':
                return {
                    label: t('team:role.member', { defaultValue: '成员' }),
                    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                };
            case 'guest':
                return {
                    label: t('team:role.guest', { defaultValue: '访客' }),
                    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                };
            default:
                return {
                    label: role,
                    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                };
        }
    };

    // 渲染访客的项目权限行
    const renderGuestProjectRow = (
        memberPerm: MemberPermissions,
        project: Project,
        isSavingThis: boolean
    ) => {
        const hasView = memberPerm.viewableProjects.has(project.id);
        const workspace = teamWorkspaces.find(w => w.id === project.workspaceId);

        return (
            <div
                key={project.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-text-primary">{project.name}</p>
                        {workspace && <p className="text-xs text-text-tertiary">{workspace.name}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* 访客只能切换查看权限 */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleViewPermission(memberPerm, project, hasView);
                        }}
                        disabled={isSavingThis}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                            hasView
                                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                : 'bg-transparent text-text-secondary border-border hover:border-green-300 hover:text-green-600'
                        }`}
                    >
                        {hasView ? (
                            <>
                                <CheckIcon className="w-3.5 h-3.5" />
                                <EyeIcon className="w-3.5 h-3.5" />
                                {t('permission:type.view', { defaultValue: '查看' })}
                            </>
                        ) : (
                            <>
                                <EyeIcon className="w-3.5 h-3.5" />
                                {t('permission:action.grantView', { defaultValue: '授予查看' })}
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    // 渲染成员的项目权限行
    const renderMemberProjectRow = (
        memberPerm: MemberPermissions,
        project: Project,
        isSavingThis: boolean
    ) => {
        const hasEdit = memberPerm.editableProjects.has(project.id);
        const workspace = teamWorkspaces.find(w => w.id === project.workspaceId);

        return (
            <div
                key={project.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-text-primary">{project.name}</p>
                        {workspace && <p className="text-xs text-text-tertiary">{workspace.name}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* 成员默认有查看权限 */}
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <EyeIcon className="w-3.5 h-3.5" />
                        {t('permission:type.view', { defaultValue: '查看' })}
                    </span>

                    {/* 成员可以切换编辑权限 */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleEditPermission(memberPerm, project, hasEdit);
                        }}
                        disabled={isSavingThis}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                            hasEdit
                                ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                : 'bg-transparent text-text-secondary border-border hover:border-blue-300 hover:text-blue-600'
                        }`}
                    >
                        {hasEdit ? (
                            <>
                                <CheckIcon className="w-3.5 h-3.5" />
                                <PencilSquareIcon className="w-3.5 h-3.5" />
                                {t('permission:type.edit', { defaultValue: '编辑' })}
                            </>
                        ) : (
                            <>
                                <PencilSquareIcon className="w-3.5 h-3.5" />
                                {t('permission:action.grantEdit', { defaultValue: '授予编辑' })}
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            ) : teamProjects.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                    <svg className="w-16 h-16 mx-auto text-text-tertiary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-lg font-medium mb-1">{t('permission:empty.noProjects', { defaultValue: '暂无项目' })}</p>
                    <p className="text-sm">{t('permission:empty.createProjectFirst', { defaultValue: '请先在团队工作区中创建项目' })}</p>
                </div>
            ) : managableMembers.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                    <svg className="w-16 h-16 mx-auto text-text-tertiary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium mb-1">{t('permission:empty.noMembers', { defaultValue: '暂无需要管理权限的成员' })}</p>
                    <p className="text-sm">{t('permission:empty.inviteMembersFirst', { defaultValue: '所有者和管理员自动拥有所有权限' })}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {memberPermissions.map(memberPerm => {
                        const isExpanded = expandedMembers.has(memberPerm.member.id);
                        const roleConfig = getRoleConfig(memberPerm.member.role);
                        const totalProjects = teamProjects.length;
                        const isSavingThis = isSaving === memberPerm.member.id;

                        // 根据角色计算统计数据
                        const viewCount = memberPerm.isGuest ? memberPerm.viewableProjects.size : totalProjects;
                        const editCount = memberPerm.isGuest ? 0 : memberPerm.editableProjects.size;

                        return (
                            <div key={memberPerm.member.id} className="border border-border rounded-lg overflow-hidden">
                                {/* 成员头部 */}
                                <div
                                    className="flex items-center justify-between p-4 bg-surface hover:bg-surface/80 cursor-pointer transition-colors"
                                    onClick={() => toggleMemberExpanded(memberPerm.member.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <ChevronDownIcon className="w-5 h-5 text-text-secondary" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5 text-text-secondary" />
                                        )}
                                        <TeamAvatar
                                            name={memberPerm.member.user.username}
                                            avatarUrl={memberPerm.member.user.avatar}
                                            size="md"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-text-primary">
                                                    {memberPerm.member.user.username}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleConfig.className}`}>
                                                    {roleConfig.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-secondary">{memberPerm.member.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* 权限统计 */}
                                        <div className="text-right text-sm">
                                            <div className="flex items-center gap-1 text-text-secondary">
                                                <EyeIcon className="w-4 h-4" />
                                                <span className={viewCount > 0 ? 'text-green-600 font-medium' : ''}>{viewCount}</span>
                                                {!memberPerm.isGuest && (
                                                    <>
                                                        <span className="text-text-tertiary">/</span>
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                        <span className={editCount > 0 ? 'text-blue-600 font-medium' : ''}>{editCount}</span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-xs text-text-tertiary">
                                                {memberPerm.isGuest
                                                    ? t('permission:stat.viewOnly', { defaultValue: '可查看' })
                                                    : t('permission:stat.viewEdit', { defaultValue: '查看 / 编辑' })
                                                }
                                            </p>
                                        </div>

                                        {isSavingThis && (
                                            <svg className="w-5 h-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* 展开的项目权限列表 */}
                                {isExpanded && (
                                    <div className="border-t border-border bg-background">
                                        {/* 批量操作 */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-surface/50">
                                            <span className="text-sm text-text-secondary">
                                                {memberPerm.isGuest
                                                    ? t('permission:batch.titleView', { defaultValue: '批量设置查看权限' })
                                                    : t('permission:batch.title', { defaultValue: '批量设置编辑权限' })
                                                }
                                            </span>
                                            <div className="flex gap-2">
                                                {memberPerm.isGuest ? (
                                                    // 访客：批量设置查看权限
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBatchSetViewPermission(memberPerm, true);
                                                            }}
                                                            disabled={isSavingThis || viewCount === totalProjects}
                                                        >
                                                            {t('permission:batch.grantAllView', { defaultValue: '全部授予' })}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBatchSetViewPermission(memberPerm, false);
                                                            }}
                                                            disabled={isSavingThis || viewCount === 0}
                                                        >
                                                            {t('permission:batch.revokeAllView', { defaultValue: '全部移除' })}
                                                        </Button>
                                                    </>
                                                ) : (
                                                    // 成员：批量设置编辑权限
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBatchSetEditPermission(memberPerm, true);
                                                            }}
                                                            disabled={isSavingThis || editCount === totalProjects}
                                                        >
                                                            {t('permission:batch.grantAll', { defaultValue: '全部授予' })}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBatchSetEditPermission(memberPerm, false);
                                                            }}
                                                            disabled={isSavingThis || editCount === 0}
                                                        >
                                                            {t('permission:batch.revokeAll', { defaultValue: '全部移除' })}
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* 项目列表 */}
                                        <div className="divide-y divide-border/50">
                                            {teamProjects.map(project =>
                                                memberPerm.isGuest
                                                    ? renderGuestProjectRow(memberPerm, project, isSavingThis)
                                                    : renderMemberProjectRow(memberPerm, project, isSavingThis)
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PermissionManager;
