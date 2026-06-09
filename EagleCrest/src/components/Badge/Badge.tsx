import React from 'react';
import type { BadgeVariant } from '../../types';

interface BadgeProps {
    variant?: BadgeVariant;
    dot?: boolean;
    children: React.ReactNode;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-success/15 text-success',
    warning: 'bg-gold/15 text-gold',
    danger: 'bg-danger/15 text-danger',
    info: 'bg-info/15 text-info',
    neutral: 'bg-bg-elevated text-text-secondary border border-border',
};

export const Badge: React.FC<BadgeProps> = ({
    variant = 'neutral',
    dot = false,
    children,
    className = '',
}) => {
    const classes = [
        'inline-flex items-center gap-[5px] text-[11px] font-medium px-2.5 py-1 rounded-[20px] tracking-[0.04em] whitespace-nowrap',
        variantClasses[variant],
        dot ? 'before:content-[""] before:inline-block before:w-[5px] before:h-[5px] before:rounded-full before:bg-current before:shrink-0' : '',
        className,
    ].filter(Boolean).join(' ');

    return <span className={classes}>{children}</span>;
};
