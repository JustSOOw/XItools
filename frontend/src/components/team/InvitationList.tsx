/**
 * 邀请记录列表组件
 *
 * 显示团队的所有邀请记录，支持撤销待处理的邀请
 */

import React, { useEffect, useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useI18n } from '../../hooks/useI18n';
import { TeamInvitation, InvitationStatus } from '../../types/teamTypes';
import Button from '../Button';
import globalConfirmDialog from '../../services/globalConfirmDialog';

interface InvitationListProps {
    teamId: string;
    onInviteClick?: () => void;
}

const InvitationList: React.FC<InvitationListProps> = ({ teamId, onInviteClick }) => {
    const { t } = useI18n();
    const { invitations, fetchInvitations, revokeInvitation, isLoading } = useTeamStore();
    const [filter, setFilter] = useState<'all' | InvitationStatus>('all');

    useEffect(() => {
        fetchInvitations(teamId);
    }, [teamId, fetchInvitations]);

    // 过滤邀请列表
    const filteredInvitations = filter === 'all'
        ? invitations
        : invitations.filter(inv => inv.status === filter);

    // 获取状态显示配置
    const getStatusConfig = (status: InvitationStatus) => {
        switch (status) {
            case InvitationStatus.PENDING:
                return {
                    label: t('team:invitation.status.pending', { defaultValue: '待处理' }),
                    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                    icon: (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                };
            case InvitationStatus.ACCEPTED:
                return {
                    label: t('team:invitation.status.accepted', { defaultValue: '已接受' }),
                    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                    icon: (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ),
                };
            case InvitationStatus.REJECTED:
                return {
                    label: t('team:invitation.status.rejected', { defaultValue: '已拒绝' }),
                    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    icon: (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ),
                };
            case InvitationStatus.EXPIRED:
                return {
                    label: t('team:invitation.status.expired', { defaultValue: '已过期' }),
                    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                    icon: (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                };
            case InvitationStatus.CANCELLED:
                return {
                    label: t('team:invitation.status.cancelled', { defaultValue: '已撤销' }),
                    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                    icon: (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    ),
                };
            default:
                return {
                    label: status,
                    className: 'bg-gray-100 text-gray-600',
                    icon: null,
                };
        }
    };

    // 撤销邀请
    const handleRevoke = (invitation: TeamInvitation) => {
        globalConfirmDialog.show(
            {
                title: t('team:invitation.revokeTitle', { defaultValue: '撤销邀请' }),
                message: t('team:invitation.revokeMessage', {
                    defaultValue: `确定要撤销对 ${invitation.invitedEmail} 的邀请吗？`,
                    email: invitation.invitedEmail,
                }),
                type: 'warning',
                confirmText: t('common:action.confirm', { defaultValue: '确定' }),
            },
            async () => {
                await revokeInvitation(invitation.id);
            }
        );
    };

    // 格式化时间
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // 检查是否已过期
    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    // 统计各状态数量
    const statusCounts = {
        all: invitations.length,
        [InvitationStatus.PENDING]: invitations.filter(i => i.status === InvitationStatus.PENDING).length,
        [InvitationStatus.ACCEPTED]: invitations.filter(i => i.status === InvitationStatus.ACCEPTED).length,
        [InvitationStatus.REJECTED]: invitations.filter(i => i.status === InvitationStatus.REJECTED).length,
        [InvitationStatus.EXPIRED]: invitations.filter(i => i.status === InvitationStatus.EXPIRED).length,
        [InvitationStatus.CANCELLED]: invitations.filter(i => i.status === InvitationStatus.CANCELLED).length,
    };

    return (
        <div className="space-y-4">
            {/* 顶部操作栏 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-text-primary">
                        {t('team:invitation.title', { defaultValue: '邀请记录' })}
                    </h3>
                    <span className="text-sm text-text-secondary">
                        ({invitations.length})
                    </span>
                </div>
                {onInviteClick && (
                    <Button onClick={onInviteClick} variant="primary" size="sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {t('team:invitation.invite', { defaultValue: '邀请成员' })}
                    </Button>
                )}
            </div>

            {/* 筛选标签 */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        filter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-surface-hover text-text-secondary hover:text-text-primary'
                    }`}
                >
                    {t('common:filter.all', { defaultValue: '全部' })} ({statusCounts.all})
                </button>
                <button
                    onClick={() => setFilter(InvitationStatus.PENDING)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        filter === InvitationStatus.PENDING
                            ? 'bg-yellow-500 text-white'
                            : 'bg-surface-hover text-text-secondary hover:text-text-primary'
                    }`}
                >
                    {t('team:invitation.status.pending', { defaultValue: '待处理' })} ({statusCounts[InvitationStatus.PENDING]})
                </button>
                <button
                    onClick={() => setFilter(InvitationStatus.ACCEPTED)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        filter === InvitationStatus.ACCEPTED
                            ? 'bg-green-500 text-white'
                            : 'bg-surface-hover text-text-secondary hover:text-text-primary'
                    }`}
                >
                    {t('team:invitation.status.accepted', { defaultValue: '已接受' })} ({statusCounts[InvitationStatus.ACCEPTED]})
                </button>
            </div>

            {/* 邀请列表 */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : filteredInvitations.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="w-12 h-12 mx-auto text-text-tertiary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-text-secondary">
                        {filter === 'all'
                            ? t('team:invitation.empty', { defaultValue: '暂无邀请记录' })
                            : t('team:invitation.emptyFilter', { defaultValue: '没有符合条件的邀请' })}
                    </p>
                    {filter === 'all' && onInviteClick && (
                        <Button onClick={onInviteClick} variant="outline" size="sm" className="mt-4">
                            {t('team:invitation.inviteFirst', { defaultValue: '邀请第一位成员' })}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredInvitations.map((invitation) => {
                        const statusConfig = getStatusConfig(invitation.status);
                        const expired = invitation.status === InvitationStatus.PENDING && isExpired(invitation.expiresAt);

                        return (
                            <div
                                key={invitation.id}
                                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-border-hover transition-colors"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* 邮箱图标 */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>

                                    {/* 邀请信息 */}
                                    <div className="min-w-0">
                                        <p className="font-medium text-text-primary truncate">
                                            {invitation.invitedEmail}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                                            <span>
                                                {t('team:invitation.sentAt', { defaultValue: '发送于' })} {formatDate(invitation.createdAt)}
                                            </span>
                                            {invitation.status === InvitationStatus.PENDING && !expired && (
                                                <>
                                                    <span className="text-text-tertiary">•</span>
                                                    <span>
                                                        {t('team:invitation.expiresAt', { defaultValue: '过期于' })} {formatDate(invitation.expiresAt)}
                                                    </span>
                                                </>
                                            )}
                                            {invitation.acceptedAt && (
                                                <>
                                                    <span className="text-text-tertiary">•</span>
                                                    <span className="text-green-600 dark:text-green-400">
                                                        {t('team:invitation.acceptedAt', { defaultValue: '接受于' })} {formatDate(invitation.acceptedAt)}
                                                    </span>
                                                </>
                                            )}
                                            {invitation.rejectedAt && (
                                                <>
                                                    <span className="text-text-tertiary">•</span>
                                                    <span className="text-red-600 dark:text-red-400">
                                                        {t('team:invitation.rejectedAt', { defaultValue: '拒绝于' })} {formatDate(invitation.rejectedAt)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {/* 状态标签 */}
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                                        expired ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : statusConfig.className
                                    }`}>
                                        {expired ? (
                                            <>
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {t('team:invitation.status.expired', { defaultValue: '已过期' })}
                                            </>
                                        ) : (
                                            <>
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </>
                                        )}
                                    </span>

                                    {/* 操作按钮 */}
                                    {invitation.status === InvitationStatus.PENDING && !expired && (
                                        <button
                                            onClick={() => handleRevoke(invitation)}
                                            className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title={t('team:invitation.revoke', { defaultValue: '撤销邀请' })}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InvitationList;
