/**
 * 通知中心组件
 *
 * 显示用户的所有通知，支持筛选、标记已读、详情展开和邀请快速操作
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useI18n } from '../../hooks/useI18n';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationType, ResourceType, Notification } from '../../types/notificationTypes';
import invitationService from '../../services/invitationService';
import { toast } from '../ui/Toast';

const NotificationCenter: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotificationStore();

    // 初始获取未读数量
    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // 打开通知中心时获取通知列表
    useEffect(() => {
        if (isOpen) {
            fetchNotifications({
                page: 1,
                pageSize: 20,
                isRead: activeTab === 'unread' ? false : undefined,
            });
        }
    }, [isOpen, activeTab, fetchNotifications]);

    // 关闭通知中心时清除选中的通知
    useEffect(() => {
        if (!isOpen) {
            setSelectedNotification(null);
        }
    }, [isOpen]);

    // 筛选通知
    const filteredNotifications = activeTab === 'all'
        ? (notifications || [])
        : (notifications || []).filter((n) => !n.isRead);

    // 标记单个通知为已读
    const handleMarkAsRead = useCallback(async (id: string) => {
        await markAsRead(id);
    }, [markAsRead]);

    // 标记全部已读
    const handleMarkAllAsRead = useCallback(async () => {
        await markAllAsRead();
        setSelectedNotification(null);
    }, [markAllAsRead]);

    // 点击通知展开详情
    const handleNotificationClick = useCallback(async (notification: Notification, e: React.MouseEvent) => {
        e.stopPropagation();

        // 展开详情面板
        setSelectedNotification(notification);

        // 如果未读，标���为已读
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }
    }, [handleMarkAsRead]);

    // 接受邀请
    const handleAcceptInvitation = useCallback(async () => {
        if (!selectedNotification?.resourceId) return;

        setIsProcessing(true);
        try {
            await invitationService.acceptInvitation(selectedNotification.resourceId);
            toast.success('已成功加入团队');

            // 删除通知
            await deleteNotification(selectedNotification.id);
            setSelectedNotification(null);

            // 刷新页面以加载新的团队数据
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || '接受邀请失败');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedNotification, deleteNotification]);

    // 拒绝邀请
    const handleRejectInvitation = useCallback(async () => {
        if (!selectedNotification?.resourceId) return;

        setIsProcessing(true);
        try {
            await invitationService.rejectInvitation(selectedNotification.resourceId);
            toast.success('已拒绝邀请');

            // 删除通知
            await deleteNotification(selectedNotification.id);
            setSelectedNotification(null);
        } catch (error: any) {
            toast.error(error.message || '拒绝邀请失败');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedNotification, deleteNotification]);

    // 查看详情（跳转）
    const handleViewDetails = useCallback(() => {
        if (!selectedNotification) return;

        const { resourceType, resourceId } = selectedNotification;

        if (resourceType && resourceId) {
            switch (resourceType) {
                case ResourceType.TASK:
                    navigate(`/board?taskId=${resourceId}`);
                    break;
                case ResourceType.TEAM:
                    navigate(`/team/settings`);
                    break;
                case ResourceType.PROJECT:
                    navigate(`/project/${resourceId}`);
                    break;
                case ResourceType.INVITATION:
                    // 邀请通知不跳转，直接在通知中心处理
                    return;
            }
        }
        setIsOpen(false);
    }, [selectedNotification, navigate]);

    // 删除通知
    const handleDelete = useCallback(async () => {
        if (!selectedNotification) return;

        try {
            await deleteNotification(selectedNotification.id);
            setSelectedNotification(null);
            toast.success('已删除通知');
        } catch (error: any) {
            toast.error(error.message || '删除通知失败');
        }
    }, [selectedNotification, deleteNotification]);

    // 切换已读/未读
    const handleToggleRead = useCallback(async () => {
        if (!selectedNotification) return;

        if (selectedNotification.isRead) {
            // 当前没有标记为未读的API，暂时只支持标记为已读
            toast.info('暂不支持标记为未读');
        } else {
            await handleMarkAsRead(selectedNotification.id);
        }
    }, [selectedNotification, handleMarkAsRead]);

    // 获取通知类型图标
    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.TASK_ASSIGNED:
                return (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                );
            case NotificationType.TASK_COMMENTED:
                return (
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                );
            case NotificationType.TEAM_INVITATION:
                return (
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                );
            case NotificationType.INVITATION_ACCEPTED:
                return (
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case NotificationType.PERMISSION_CHANGED:
                return (
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                );
            case NotificationType.MEMBER_JOINED:
                return (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                );
            case NotificationType.MEMBER_LEFT:
                return (
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                );
        }
    };

    // 获取通知类型标题
    const getNotificationTypeTitle = (type: NotificationType) => {
        const typeMap: Record<NotificationType, string> = {
            [NotificationType.TASK_ASSIGNED]: t('notification:type.taskAssigned', { defaultValue: '任务分配' }),
            [NotificationType.TASK_COMMENTED]: t('notification:type.taskCommented', { defaultValue: '任务评论' }),
            [NotificationType.TEAM_INVITATION]: t('notification:type.teamInvitation', { defaultValue: '团队邀请' }),
            [NotificationType.INVITATION_ACCEPTED]: t('notification:type.invitationAccepted', { defaultValue: '邀请已接受' }),
            [NotificationType.PERMISSION_CHANGED]: t('notification:type.permissionChanged', { defaultValue: '权限变更' }),
            [NotificationType.MEMBER_JOINED]: t('notification:type.memberJoined', { defaultValue: '成员加入' }),
            [NotificationType.MEMBER_LEFT]: t('notification:type.memberLeft', { defaultValue: '成员离开' }),
        };
        return typeMap[type] || type;
    };

    // 格式化时间
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return t('notification:time.justNow', { defaultValue: '刚刚' });
        if (minutes < 60) return t('notification:time.minutesAgo', { defaultValue: `${minutes} 分钟前`, count: minutes });
        if (hours < 24) return t('notification:time.hoursAgo', { defaultValue: `${hours} 小时前`, count: hours });
        if (days < 7) return t('notification:time.daysAgo', { defaultValue: `${days} 天前`, count: days });
        return date.toLocaleDateString('zh-CN');
    };

    // 格式化完整时间
    const formatFullTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="relative">
            {/* 铃铛图标 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-full transition-colors"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-surface">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* 下拉面板 */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-[600px] bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden flex max-h-[500px]">
                        {/* 左侧：通知列表 */}
                        <div className={classNames(
                            'flex flex-col transition-all duration-200',
                            selectedNotification ? 'w-[280px]' : 'w-full'
                        )}>
                            {/* 头部 */}
                            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                                <h3 className="font-semibold text-text-primary">
                                    {t('notification:title', { defaultValue: '通知中心' })}
                                </h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-primary hover:text-primary-hover transition-colors"
                                    >
                                        {t('notification:markAllRead', { defaultValue: '全部已读' })}
                                    </button>
                                )}
                            </div>

                            {/* 标签页 */}
                            <div className="flex border-b border-border">
                                <button
                                    className={classNames(
                                        'flex-1 py-2.5 text-sm font-medium transition-colors',
                                        activeTab === 'all'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-text-secondary hover:text-text-primary'
                                    )}
                                    onClick={() => setActiveTab('all')}
                                >
                                    {t('notification:tab.all', { defaultValue: '全部' })}
                                </button>
                                <button
                                    className={classNames(
                                        'flex-1 py-2.5 text-sm font-medium transition-colors',
                                        activeTab === 'unread'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-text-secondary hover:text-text-primary'
                                    )}
                                    onClick={() => setActiveTab('unread')}
                                >
                                    {t('notification:tab.unread', { defaultValue: '未读' })}
                                    {unreadCount > 0 && (
                                        <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* 通知列表 */}
                            <div className="overflow-y-auto flex-1">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <svg className="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <svg className="w-12 h-12 mx-auto text-text-tertiary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        <p className="text-text-secondary text-sm">
                                            {t('notification:empty', { defaultValue: '暂无通知' })}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {filteredNotifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={(e) => handleNotificationClick(notification, e)}
                                                className={classNames(
                                                    'p-3 hover:bg-surface-hover cursor-pointer transition-colors flex gap-2',
                                                    !notification.isRead && 'bg-primary/5',
                                                    selectedNotification?.id === notification.id && 'bg-primary/10'
                                                )}
                                            >
                                                {/* 类型图标 */}
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                </div>

                                                {/* 内容 */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-text-primary truncate">
                                                        {notification.title || getNotificationTypeTitle(notification.type)}
                                                    </p>
                                                    <p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5">
                                                        {notification.content}
                                                    </p>
                                                    <p className="text-[10px] text-text-tertiary mt-1">
                                                        {formatTime(notification.createdAt)}
                                                    </p>
                                                </div>

                                                {/* 未读标识 */}
                                                {!notification.isRead && (
                                                    <div className="flex-shrink-0 self-center">
                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 右侧：详情面板 */}
                        {selectedNotification && (
                            <div className="w-[320px] border-l border-border bg-surface flex flex-col">
                                {/* 头部 */}
                                <div className="p-4 border-b border-border flex justify-between items-center">
                                    <h3 className="font-semibold text-text-primary text-sm">
                                        {t('notification:detail', { defaultValue: '通知详情' })}
                                    </h3>
                                    <button
                                        onClick={() => setSelectedNotification(null)}
                                        className="p-1 hover:bg-surface-hover rounded transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* 内容 */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {/* 图标和标题 */}
                                    <div className="flex items-start gap-3">
                                        {getNotificationIcon(selectedNotification.type)}
                                        <div className="flex-1">
                                            <h4 className="font-medium text-text-primary text-sm">
                                                {selectedNotification.title || getNotificationTypeTitle(selectedNotification.type)}
                                            </h4>
                                            <p className="text-xs text-text-tertiary mt-1">
                                                {formatFullTime(selectedNotification.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 完整内容 */}
                                    <div className="bg-surface-hover rounded-lg p-3">
                                        <p className="text-sm text-text-primary whitespace-pre-wrap">
                                            {selectedNotification.content}
                                        </p>
                                    </div>

                                    {/* 操作按钮 */}
                                    <div className="space-y-2">
                                        {/* 团队邀请特殊操作 */}
                                        {selectedNotification.type === NotificationType.TEAM_INVITATION && (
                                            <div className="space-y-2">
                                                <button
                                                    onClick={handleAcceptInvitation}
                                                    disabled={isProcessing}
                                                    className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            处理中...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            接受邀请
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleRejectInvitation}
                                                    disabled={isProcessing}
                                                    className="w-full px-4 py-2 bg-surface-hover hover:bg-border text-text-primary rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    拒绝
                                                </button>
                                            </div>
                                        )}

                                        {/* 其他通知类型的操作 */}
                                        {selectedNotification.type !== NotificationType.TEAM_INVITATION && (
                                            <>
                                                {selectedNotification.resourceType && selectedNotification.resourceId && (
                                                    <button
                                                        onClick={handleViewDetails}
                                                        className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        查看详情
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleDelete}
                                                    className="w-full px-4 py-2 bg-surface-hover hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    删除通知
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
