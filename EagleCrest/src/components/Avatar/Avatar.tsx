import React from 'react';
import type { AvatarSize } from '../../types';

type StatusType = 'online' | 'away' | 'offline';

interface AvatarProps {
    initials: string;
    size?: AvatarSize;
    status?: StatusType;
    className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-11 h-11 text-[15px]',
    lg: 'w-[58px] h-[58px] text-xl',
    xl: 'w-18 h-18 text-2xl',
};

const statusClasses: Record<StatusType, string> = {
    online: 'bg-success',
    away: 'bg-gold',
    offline: 'bg-text-muted',
};

export const Avatar: React.FC<AvatarProps> = ({
    initials,
    size = 'md',
    status,
    className = '',
}) => {
    const classes = [
        'rounded-full flex items-center justify-center font-semibold font-body bg-bg-elevated text-gold border-[1.5px] border-border-strong relative shrink-0 select-none',
        sizeClasses[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} aria-label={`Avatar for ${initials}`}>
            {initials.slice(0, 2).toUpperCase()}
            {status && (
                <span
                    className={`absolute bottom-px right-px w-2.5 h-2.5 rounded-full border-2 border-bg-base ${statusClasses[status]}`}
                    aria-label={status}
                />
            )}
        </div>
    );
};
