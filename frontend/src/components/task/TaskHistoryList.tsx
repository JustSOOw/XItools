/**
 * 任务历史展示组件
 *
 * 显示任务的变更历史记录，支持分页和筛选
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../hooks/useI18n';
import taskHistoryService from '../../services/taskHistoryService';
import { TaskHistory, TaskHistoryAction, TASK_FIELD_LABELS } from '../../types/taskHistoryTypes';
import TeamAvatar from '../team/TeamAvatar';

interface TaskHistoryListProps {
    taskId: string;
}

const TaskHistoryList: React.FC<TaskHistoryListProps> = ({ taskId }) => {
    const { t } = useI18n();
    const [history, setHistory] = useState<TaskHistory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // 获取历史记录
    const fetchHistory = useCallback(async () => {
        if (!taskId) return;

        setIsLoading(true);
        try {
            const response = await taskHistoryService.getTaskHistory(taskId, {
                page,
                pageSize: 10,
            });
            setHistory(response.data);
            setTotalPages(response.totalPages);
            setTotal(response.total);
        } catch (error) {
            console.error('获取任务历史失败:', error);
        } finally {
            setIsLoading(false);
        }
    }, [taskId, page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // 格式化历史描述
    const formatDescription = (item: TaskHistory): string => {
        const fieldLabel = item.field ? TASK_FIELD_LABELS[item.field] || item.field : '';

        switch (item.action) {
            case TaskHistoryAction.CREATED:
                return t('history:action.created', { defaultValue: '创建了任务' });

            case TaskHistoryAction.DELETED:
                return t('history:action.deleted', { defaultValue: '删除了任务' });

            case TaskHistoryAction.STATUS_CHANGED:
                return t('history:action.statusChanged', {
                    defaultValue: `将状态从"${item.oldValue}"更改为"${item.newValue}"`,
                    oldValue: item.oldValue,
                    newValue: item.newValue,
                });

            case TaskHistoryAction.ASSIGNED:
                return t('history:action.assigned', { defaultValue: '分配了负责人' });

            case TaskHistoryAction.UNASSIGNED:
                return t('history:action.unassigned', { defaultValue: '取消分配负责人' });

            case TaskHistoryAction.PRIORITY_CHANGED:
                return t('history:action.priorityChanged', {
                    defaultValue: `将优先级从"${item.oldValue}"更改为"${item.newValue}"`,
                    oldValue: item.oldValue,
                    newValue: item.newValue,
                });

            case TaskHistoryAction.DUE_DATE_CHANGED:
                return t('history:action.dueDateChanged', {
                    defaultValue: `将截止日期从"${item.oldValue || '无'}"更改为"${item.newValue || '无'}"`,
                    oldValue: item.oldValue || '无',
                    newValue: item.newValue || '无',
                });

            case TaskHistoryAction.MOVED:
                return t('history:action.moved', { defaultValue: '将任务移动到其他看板' });

            case TaskHistoryAction.UPDATED:
                if (fieldLabel && item.oldValue !== undefined && item.newValue !== undefined) {
                    return t('history:action.fieldUpdated', {
                        defaultValue: `将${fieldLabel}从"${item.oldValue}"更改为"${item.newValue}"`,
                        field: fieldLabel,
                        oldValue: item.oldValue,
                        newValue: item.newValue,
                    });
                }
                return t('history:action.updated', { defaultValue: '更新了任务' });

            default:
                return t('history:action.default', {
                    defaultValue: `执行了${item.action}操作`,
                    action: item.action,
                });
        }
    };

    // 获取操作类型图标
    const getActionIcon = (action: TaskHistoryAction) => {
        switch (action) {
            case TaskHistoryAction.CREATED:
                return (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                );
            case TaskHistoryAction.DELETED:
                return (
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                );
            case TaskHistoryAction.STATUS_CHANGED:
            case TaskHistoryAction.MOVED:
                return (
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                );
            case TaskHistoryAction.ASSIGNED:
            case TaskHistoryAction.UNASSIGNED:
                return (
                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
            case TaskHistoryAction.PRIORITY_CHANGED:
                return (
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                );
            case TaskHistoryAction.DUE_DATE_CHANGED:
                return (
                    <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                );
        }
    };

    // 格式化时间
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return t('history:time.justNow', { defaultValue: '刚刚' });
        if (minutes < 60) return t('history:time.minutesAgo', { defaultValue: `${minutes} 分钟前`, count: minutes });
        if (hours < 24) return t('history:time.hoursAgo', { defaultValue: `${hours} 小时前`, count: hours });
        if (days < 7) return t('history:time.daysAgo', { defaultValue: `${days} 天前`, count: days });

        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                    {t('history:title', { defaultValue: '变更历史' })}
                    {total > 0 && (
                        <span className="ml-2 text-sm font-normal text-text-secondary">
                            ({total})
                        </span>
                    )}
                </h3>
            </div>

            {/* 历史列表 */}
            <div className="relative">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <svg className="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                        <svg className="w-12 h-12 mx-auto text-text-tertiary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">{t('history:empty', { defaultValue: '暂无变更历史记录' })}</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* 时间线 */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                        {/* 历史条目 */}
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} className="relative flex items-start gap-4 pl-2">
                                    {/* 时间线节点 */}
                                    <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                                        {getActionIcon(item.action)}
                                    </div>

                                    {/* 内容 */}
                                    <div className="flex-1 min-w-0 pb-4">
                                        <div className="flex items-start gap-3">
                                            <TeamAvatar
                                                name={item.userName || '未知用户'}
                                                size="sm"
                                                className="flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-medium text-text-primary">
                                                        {item.userName || t('history:unknownUser', { defaultValue: '未知用户' })}
                                                    </span>
                                                    <span className="text-xs text-text-tertiary">
                                                        {formatTime(item.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text-secondary mt-1">
                                                    {formatDescription(item)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-sm rounded-lg bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('common:pagination.prev', { defaultValue: '上一页' })}
                    </button>
                    <span className="text-sm text-text-secondary">
                        {t('common:pagination.pageInfo', {
                            defaultValue: `第 ${page} 页，共 ${totalPages} 页`,
                            page,
                            totalPages,
                        })}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 text-sm rounded-lg bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('common:pagination.next', { defaultValue: '下一页' })}
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskHistoryList;
