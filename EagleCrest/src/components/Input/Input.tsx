import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
    prefix?: string;
    suffix?: string;
    icon?: string;
}

const baseInput =
    'w-full bg-bg-card border border-border rounded-md text-text-primary font-body text-sm px-3.5 py-2.5 transition-colors duration-150 outline-none placeholder:text-text-muted hover:border-border-strong focus:border-gold-dim focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)]';

export const Input: React.FC<InputProps> = ({
    label,
    hint,
    error,
    prefix,
    suffix,
    icon,
    className = '',
    id,
    ...rest
}) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium" htmlFor={inputId}>
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                {icon && (
                    <i className={`ti ${icon} absolute left-3 text-base text-text-muted pointer-events-none`} aria-hidden="true" />
                )}
                {prefix && <span className="absolute left-[13px] text-sm text-text-muted pointer-events-none z-[1]">{prefix}</span>}
                <input
                    id={inputId}
                    className={[
                        baseInput,
                        error ? '!border-danger/50 focus:!shadow-[0_0_0_3px_rgba(224,85,85,0.08)]' : '',
                        icon ? 'pl-[38px]' : '',
                        prefix ? 'pl-[30px]' : '',
                        suffix ? 'pr-10' : '',
                        className,
                    ].filter(Boolean).join(' ')}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...rest}
                />
                {suffix && <span className="absolute right-[13px] text-xs text-text-muted pointer-events-none">{suffix}</span>}
            </div>
            {error && (
                <p id={`${inputId}-error`} className="text-[11px] text-danger">
                    {error}
                </p>
            )}
            {hint && !error && (
                <p id={`${inputId}-hint`} className="text-[11px] text-text-muted">
                    {hint}
                </p>
            )}
        </div>
    );
};
