/**
 * 任务评论组件
 *
 * 显示任务的评论列表，支持创建和删除评论
 */

import React, { useState, useEffect, useCallback } from 'react';
import TeamAvatar from '../team/TeamAvatar';
import Button from '../Button';
import { useI18n } from '../../hooks/useI18n';
import { useUserStore } from '../../store/userStore';
import commentService from '../../services/commentService';
import { TaskComment } from '../../types/commentTypes';
import { toast } from '../ui/Toast';
import globalConfirmDialog from '../../services/globalConfirmDialog';

interface TaskCommentsProps {
    taskId: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
    const { t } = useI18n();
    const { user: currentUser } = useUserStore();
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    // 获取评论列表
    const fetchComments = useCallback(async () => {
        if (!taskId) return;

        setIsLoading(true);
        try {
            const data = await commentService.getCommentsByTask(taskId);
            setComments(data);
        } catch (error) {
            console.error('获取评论失败:', error);
            // 不显示 toast，因为可能是服务不可用
        } finally {
            setIsLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // 发送评论
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSending) return;

        setIsSending(true);
        try {
            const comment = await commentService.createComment(taskId, newComment.trim());
            setComments((prev) => [...prev, comment]);
            setNewComment('');
            toast.success(t('comment:message.created', { defaultValue: '评论已发送' }));
        } catch (error) {
            console.error('发送评论失败:', error);
            toast.error(t('comment:message.createFailed', { defaultValue: '发送评论失败' }));
        } finally {
            setIsSending(false);
        }
    };

    // 删除评论
    const handleDelete = (comment: TaskComment) => {
        // 只有评论作者可以删除自己的评论
        if (comment.userId !== currentUser?.id) {
            toast.error(t('comment:message.noDeletePermission', { defaultValue: '只能删除自己的评论' }));
            return;
        }

        globalConfirmDialog.show(
            {
                title: t('comment:action.delete', { defaultValue: '删除评论' }),
                message: t('comment:message.confirmDelete', { defaultValue: '确定要删除这条评论吗？' }),
                type: 'danger',
                confirmText: t('common:action.confirm', { defaultValue: '确定' }),
            },
            async () => {
                setDeletingIds((prev) => new Set(prev).add(comment.id));
                try {
                    await commentService.deleteComment(comment.id);
                    setComments((prev) => prev.filter((c) => c.id !== comment.id));
                    toast.success(t('comment:message.deleted', { defaultValue: '评论已删除' }));
                } catch (error) {
                    console.error('删除评论失败:', error);
                    toast.error(t('comment:message.deleteFailed', { defaultValue: '删除评论失败' }));
                } finally {
                    setDeletingIds((prev) => {
                        const next = new Set(prev);
                        next.delete(comment.id);
                        return next;
                    });
                }
            }
        );
    };

    // 格式化时间
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return t('comment:time.justNow', { defaultValue: '刚刚' });
        if (minutes < 60) return t('comment:time.minutesAgo', { defaultValue: `${minutes} 分钟前`, count: minutes });
        if (hours < 24) return t('comment:time.hoursAgo', { defaultValue: `${hours} 小时前`, count: hours });
        if (days < 7) return t('comment:time.daysAgo', { defaultValue: `${days} 天前`, count: days });
        return date.toLocaleDateString('zh-CN');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                    {t('comment:title', { defaultValue: '评论' })}
                    {comments.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-text-secondary">
                            ({comments.length})
                        </span>
                    )}
                </h3>
            </div>

            {/* 评论列表 */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <svg className="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-6 text-text-secondary">
                        <svg className="w-10 h-10 mx-auto text-text-tertiary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">{t('comment:empty', { defaultValue: '暂无评论，来添加第一条评论吧' })}</p>
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isDeleting = deletingIds.has(comment.id);
                        const isOwner = comment.userId === currentUser?.id;

                        return (
                            <div
                                key={comment.id}
                                className={`flex gap-3 group ${isDeleting ? 'opacity-50' : ''}`}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <TeamAvatar
                                        name={comment.user.username}
                                        avatarUrl={comment.user.avatar}
                                        size="sm"
                                        className="rounded-full"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-text-primary">
                                            {comment.user.username}
                                        </span>
                                        <span className="text-xs text-text-tertiary">
                                            {formatTime(comment.createdAt)}
                                        </span>
                                        {isOwner && !isDeleting && (
                                            <button
                                                onClick={() => handleDelete(comment)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-red-500 rounded transition-all"
                                                title={t('comment:action.delete', { defaultValue: '删除评论' })}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                        {isDeleting && (
                                            <span className="text-xs text-text-tertiary italic">
                                                {t('comment:message.deleting', { defaultValue: '删除中...' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-text-secondary mt-1 whitespace-pre-wrap break-words">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 评论输入 */}
            <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-border">
                <div className="flex-shrink-0">
                    <TeamAvatar
                        name={currentUser?.username || 'User'}
                        avatarUrl={currentUser?.avatar}
                        size="sm"
                        className="rounded-full"
                    />
                </div>
                <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('comment:placeholder', { defaultValue: '写下你的评论...' })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none min-h-[80px] transition-all"
                        disabled={isSending}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-text-tertiary">
                            {t('comment:hint.submit', { defaultValue: 'Enter 发送，Shift+Enter 换行' })}
                        </span>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!newComment.trim() || isSending}
                        >
                            {isSending ? (
                                <>
                                    <svg className="w-4 h-4 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('comment:action.sending', { defaultValue: '发送中' })}
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    {t('comment:action.send', { defaultValue: '发送' })}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TaskComments;
