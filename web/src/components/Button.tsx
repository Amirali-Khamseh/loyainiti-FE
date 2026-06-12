import React from 'react';

type Variant = 'primary' | 'subtle' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
};

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderRadius: 10,
  font: 'var(--t-body)',
  fontWeight: 600,
  border: '1px solid transparent',
  transition: 'background var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-out)',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
};

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 13 },
  md: { padding: '10px 16px', fontSize: 15 },
  lg: { padding: '14px 20px', fontSize: 16 },
};

const variants: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--action)',
    color: 'var(--action-fg)',
    boxShadow: 'var(--shadow-inset)',
  },
  subtle: {
    background: 'var(--action-subtle-bg)',
    color: 'var(--action-subtle-fg)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--fg-1)',
    border: '1px solid var(--border-default)',
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{ ...baseStyle, ...sizes[size], ...variants[variant], ...style }}
    >
      {loading ? <span className="spinner" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
