import React from 'react';
import { Card } from '../index';

interface StatCardProps {
    label: string;
    value: string;
    delta: string;
    deltaUp?: boolean;
    icon: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    delta,
    deltaUp = true,
    icon,
}) => (
    <Card hoverable>
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-secondary">{label}</span>
            <div className="w-7 h-7 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-text-muted">
                <i className={`ti ${icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
            </div>
        </div>
        <div className="text-2xl font-display font-medium text-text-primary mb-2">{value}</div>
        <div className={`inline-flex items-center gap-1 text-xs font-medium ${deltaUp ? 'text-success' : 'text-danger'}`}>
            <i
                className={`ti ${deltaUp ? 'ti-trending-up' : 'ti-trending-down'}`}
                style={{ fontSize: 12 }}
                aria-hidden="true"
            />
            {delta}
        </div>
    </Card>
);
