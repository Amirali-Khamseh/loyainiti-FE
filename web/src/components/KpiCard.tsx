import React from 'react';
import { Card } from './Card';

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
};

export function KpiCard({ label, value, hint, trend }: KpiCardProps) {
  return (
    <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="label">{label}</span>
      <span className="num-xl">{value}</span>
      {hint && <span className="caption">{hint}</span>}
      {trend && (
        <span
          style={{
            font: 'var(--t-caption)',
            color:
              trend.direction === 'up'
                ? 'var(--success)'
                : trend.direction === 'down'
                  ? 'var(--danger)'
                  : 'var(--fg-3)',
          }}
        >
          {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '-'} {trend.label}
        </span>
      )}
    </Card>
  );
}
