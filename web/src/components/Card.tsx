import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'muted' | 'inverse';
  padding?: number;
};

const variants: Record<NonNullable<CardProps['variant']>, React.CSSProperties> = {
  default: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-1)',
  },
  muted: {
    background: 'var(--bg-muted)',
    border: '1px solid var(--border-subtle)',
  },
  inverse: {
    background: 'var(--bg-inverse)',
    color: 'var(--fg-on-dark)',
  },
};

export function Card({ variant = 'default', padding = 20, style, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      style={{
        borderRadius: 4,
        padding,
        ...variants[variant],
        ...style,
      }}
    />
  );
}
