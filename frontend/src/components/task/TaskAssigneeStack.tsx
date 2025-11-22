import React from 'react';
import TeamAvatar from '../team/TeamAvatar';
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

    const sizeClasses = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
    };

    return (
        <div className="flex items-center -space-x-2">
            {displayAssignees.map((assignee) => (
                <div
                    key={assignee.id}
                    className="relative ring-2 ring-surface rounded-full"
                    title={assignee.name}
                >
                    <TeamAvatar
                        name={assignee.name}
                        avatarUrl={assignee.avatarUrl}
                        size={size}
                        className="rounded-full"
                    />
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className={`relative flex items-center justify-center bg-surface-hover text-text-secondary font-medium ring-2 ring-surface rounded-full ${sizeClasses[size]}`}
                    title={`+${remainingCount} ${t('team:common.others', { defaultValue: 'others' })}`}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};

export default TaskAssigneeStack;
