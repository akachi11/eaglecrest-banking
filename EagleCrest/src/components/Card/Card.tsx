import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
    padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
    sm: 'p-3',
    md: 'p-[18px]',
    lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    onClick,
    hoverable = false,
    padding = 'md',
}) => {
    const classes = [
        'bg-bg-card border border-border rounded-lg transition-colors duration-150',
        hoverable ? 'cursor-pointer hover:border-border-strong' : '',
        paddingClasses[padding],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    title: string;
    action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-medium text-text-primary">{title}</span>
        {action && <div>{action}</div>}
    </div>
);
