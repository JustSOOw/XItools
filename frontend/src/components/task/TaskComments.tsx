import React, { useState, useEffect } from 'react';
import TeamAvatar from '../team/TeamAvatar';
import Button from '../Button';
import { useI18n } from '../../hooks/useI18n';

interface Comment {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    createdAt: string;
    user: {
        name: string;
        avatarUrl?: string;
    };
    status?: 'sending' | 'sent' | 'failed';
}

interface TaskCommentsProps {
    taskId: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
    const { t } = useI18n();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    // Mock fetch comments
    useEffect(() => {
        // Simulate API call
        setComments([
            {
                id: '1',
                taskId,
                userId: 'user-1',
                content: 'This looks good, but needs more tests.',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                user: { name: 'Alice' },
                status: 'sent',
            },
        ]);
    }, [taskId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const tempId = Math.random().toString(36).substr(2, 9);
        const optimisticComment: Comment = {
            id: tempId,
            taskId,
            userId: 'current-user', // Should get from auth store
            content: newComment,
            createdAt: new Date().toISOString(),
            user: { name: 'Me' }, // Should get from auth store
            status: 'sending',
        };

        // Optimistic update
        setComments((prev) => [...prev, optimisticComment]);
        setNewComment('');

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Update status to sent
            setComments((prev) =>
                prev.map((c) => (c.id === tempId ? { ...c, status: 'sent' } : c))
            );
        } catch (error) {
            // Update status to failed
            setComments((prev) =>
                prev.map((c) => (c.id === tempId ? { ...c, status: 'failed' } : c))
            );
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">
                {t('team:task.comments', { defaultValue: '评论' })}
            </h3>

            {/* Comment List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                        <div className="flex-shrink-0 mt-1">
                            <TeamAvatar name={comment.user.name} avatarUrl={comment.user.avatarUrl} size="sm" className="rounded-full" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-text-primary">
                                    {comment.user.name}
                                </span>
                                <span className="text-xs text-text-tertiary">
                                    {new Date(comment.createdAt).toLocaleString()}
                                </span>
                                {comment.status === 'sending' && (
                                    <span className="text-xs text-text-tertiary italic">{t('team:message.sending', { defaultValue: '发送中...' })}</span>
                                )}
                                {comment.status === 'failed' && (
                                    <span className="text-xs text-red-500">{t('team:message.sendFailed', { defaultValue: '发送失败' })}</span>
                                )}
                            </div>
                            <div className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
                                {comment.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-shrink-0">
                    <TeamAvatar name="Me" size="sm" className="rounded-full" />
                </div>
                <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('team:task.writeComment', { defaultValue: '写下你的评论...' })}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none min-h-[80px]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <div className="flex justify-end mt-2">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!newComment.trim()}
                        >
                            {t('team:action.send', { defaultValue: '发送' })}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TaskComments;
