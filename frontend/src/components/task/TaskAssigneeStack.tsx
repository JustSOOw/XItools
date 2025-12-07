import React from 'react';
import { useI18n } from '../../hooks/useI18n';

interface Assignee {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface TaskAssigneeStackProps {
    assignees: Assignee[];
    maxDisplay?: number;
    size?: 'sm' | 'md';
}

const TaskAssigneeStack: React.FC<TaskAssigneeStackProps> = ({
    assignees,
    maxDisplay = 3,
    size = 'sm',
}) => {
    const { t } = useI18n();
    if (!assignees || assignees.length === 0) return null;

    const displayAssignees = assignees.slice(0, maxDisplay);
    const remainingCount = assignees.length - maxDisplay;

    // 自定义尺寸类 - 任务卡片上使用更小的头像
    const sizeConfig = {
        sm: {
            container: 'w-5 h-5',
            text: 'text-[9px]',
            remaining: 'w-5 h-5 text-[9px]',
        },
        md: {
            container: 'w-7 h-7',
            text: 'text-[11px]',
            remaining: 'w-7 h-7 text-[11px]',
        },
    };

    const config = sizeConfig[size];

    return (
        <div className="flex items-center -space-x-1.5">
            {displayAssignees.map((assignee) => (
                <div
                    key={assignee.id}
                    className="relative ring-2 ring-surface rounded-full"
                    title={assignee.name}
                >
                    {assignee.avatarUrl ? (
                        <img
                            src={assignee.avatarUrl}
                            alt={assignee.name}
                            className={`${config.container} rounded-full object-cover`}
                        />
                    ) : (
                        <div
                            className={`${config.container} ${config.text} rounded-full flex items-center justify-center font-bold text-white`}
                            style={{ backgroundColor: getColorFromName(assignee.name) }}
                        >
                            {getInitials(assignee.name)}
                        </div>
                    )}
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className={`relative flex items-center justify-center bg-surface-hover text-text-secondary font-medium ring-2 ring-surface rounded-full ${config.remaining}`}
                    title={`+${remainingCount} ${t('team:common.others', { defaultValue: 'others' })}`}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};

// 从名称生成首字母
function getInitials(name: string): string {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

// 从名称生成一致的颜色
function getColorFromName(name: string): string {
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default TaskAssigneeStack;
