import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useI18n } from '../../hooks/useI18n';
import Portal from '../Portal';

// Mock notification type
interface Notification {
    id: string;
    type: 'task_assigned' | 'task_commented' | 'team_invitation' | 'project_permission';
    title: string;
    content: string;
    resourceType: 'task' | 'project' | 'team';
    resourceId: string;
    isRead: boolean;
    createdAt: string;
}

const NotificationCenter: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    // Mock fetch notifications
    useEffect(() => {
        // Simulate API call
        const mockNotifications: Notification[] = [
            {
                id: '1',
                type: 'task_assigned',
                title: 'Task Assigned', // Title will be translated in render
                content: 'Alice 指派给你了 "修复登录 Bug"',
                resourceType: 'task',
                resourceId: 'task-123',
                isRead: false,
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                type: 'team_invitation',
                title: 'Team Invitation', // Title will be translated in render
                content: 'Bob 邀请你加入 "工程团队"',
                resourceType: 'team',
                resourceId: 'team-456',
                isRead: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
        ];
        setNotifications(mockNotifications);
    }, []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const filteredNotifications =
        activeTab === 'all' ? notifications : notifications.filter((n) => !n.isRead);

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }

        // Routing logic
        switch (notification.resourceType) {
            case 'task':
                // Assuming we have a route to open task detail directly or we navigate to board and open modal
                // For now, let's assume a direct link or query param
                navigate(`/board?taskId=${notification.resourceId}`);
                break;
            case 'team':
                navigate(`/team/settings?teamId=${notification.resourceId}`);
                break;
            case 'project':
                navigate(`/project/${notification.resourceId}`);
                break;
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
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

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[500px]">
                        {/* Header */}
                        <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                            <h3 className="font-semibold text-text-primary">{t('team:notification.title', { defaultValue: '通知中心' })}</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary hover:text-primary-hover"
                                >
                                    {t('team:notification.markAllRead', { defaultValue: '全部已读' })}
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            <button
                                className={classNames(
                                    'flex-1 py-2 text-sm font-medium transition-colors',
                                    activeTab === 'all'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                )}
                                onClick={() => setActiveTab('all')}
                            >
                                {t('team:notification.all', { defaultValue: '全部' })}
                            </button>
                            <button
                                className={classNames(
                                    'flex-1 py-2 text-sm font-medium transition-colors',
                                    activeTab === 'unread'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                )}
                                onClick={() => setActiveTab('unread')}
                            >
                                {t('team:notification.unread', { defaultValue: '未读' })}
                            </button>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1">
                            {filteredNotifications.length === 0 ? (
                                <div className="p-8 text-center text-text-secondary text-sm">
                                    {t('team:notification.empty', { defaultValue: '暂无通知' })}
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={classNames(
                                                'p-4 hover:bg-surface-hover cursor-pointer transition-colors flex gap-3',
                                                !notification.isRead && 'bg-primary/5'
                                            )}
                                        >
                                            {/* Icon based on type */}
                                            <div className="flex-shrink-0 mt-1">
                                                {notification.type === 'task_assigned' && (
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {notification.type === 'team_invitation' && (
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {/* Add more icons as needed */}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">
                                                    {t(`team:notification.type.${notification.type}`, { defaultValue: notification.title })}
                                                </p>
                                                <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">
                                                    {notification.content}
                                                </p>
                                                <p className="text-[10px] text-text-tertiary mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {!notification.isRead && (
                                                <div className="flex-shrink-0 self-center">
                                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
