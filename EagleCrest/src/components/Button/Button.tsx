import React from 'react';
import type { ButtonVariant, ButtonSize } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-xs px-3.5 py-[7px] rounded-sm',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-[15px] px-7 py-[13px] rounded-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gold text-[#0f0f0f] border border-transparent enabled:hover:bg-gold-light',
    secondary: 'bg-transparent text-gold border border-border-strong enabled:hover:bg-gold/[0.08]',
    ghost: 'bg-bg-elevated text-text-primary border border-border enabled:hover:bg-bg-hover',
    danger: 'bg-transparent text-danger border border-danger/30 enabled:hover:bg-danger/[0.08]',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...rest
}) => {
    const classes = [
        'inline-flex items-center justify-center gap-[7px] border-none rounded-md font-body font-medium tracking-[0.02em] cursor-pointer transition-all duration-150 whitespace-nowrap no-underline enabled:active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} disabled={disabled || loading} {...rest}>
            {loading && <i className="ti ti-loader-2 animate-spin" style={{ fontSize: 14 }} aria-hidden="true" />}
            {!loading && icon && iconPosition === 'left' && (
                <i className={`ti ${icon}`} style={{ fontSize: size === 'sm' ? 13 : 15 }} aria-hidden="true" />
            )}
            {children && <span>{children}</span>}
            {!loading && icon && iconPosition === 'right' && (
                <i className={`ti ${icon}`} style={{ fontSize: size === 'sm' ? 13 : 15 }} aria-hidden="true" />
            )}
        </button>
    );
};
