import React from 'react';
import classNames from 'classnames';

interface TeamAvatarProps {
    name: string;
    avatarUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const TeamAvatar: React.FC<TeamAvatarProps> = ({ name, avatarUrl, size = 'md', className }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    // Generate a consistent color based on the team name
    const getBackgroundColor = (name: string) => {
        const colors = [
            'bg-red-500',
            'bg-orange-500',
            'bg-amber-500',
            'bg-yellow-500',
            'bg-lime-500',
            'bg-green-500',
            'bg-emerald-500',
            'bg-teal-500',
            'bg-cyan-500',
            'bg-sky-500',
            'bg-blue-500',
            'bg-indigo-500',
            'bg-violet-500',
            'bg-purple-500',
            'bg-fuchsia-500',
            'bg-pink-500',
            'bg-rose-500',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className={classNames(
                    'rounded-lg object-cover',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={classNames(
                'rounded-lg flex items-center justify-center font-bold text-white',
                getBackgroundColor(name),
                sizeClasses[size],
                className
            )}
        >
            {initials}
        </div>
    );
};

export default TeamAvatar;
