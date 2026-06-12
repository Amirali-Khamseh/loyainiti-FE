import React from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../../design-system/assets/Logo_final.png';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

// Dark card surface vars for child components (Input, Button, text), so the
// auth card matches the Cobalt near-black theme.
const cardVars: React.CSSProperties = {
  '--fg-1': '#FFFFFF',
  '--fg-2': '#e4e4e7',
  '--fg-3': '#a1a1aa',
  '--bg-card': '#18181b',
  '--bg-muted': '#121214',
  '--border-default': '#3f3f46',
  '--border-subtle': '#27272a',
} as React.CSSProperties;

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'radial-gradient(900px 500px at 75% -5%, rgba(34,211,238,0.16), transparent), var(--bg-canvas)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div
          style={{
            ...cardVars,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: 32,
            boxShadow: 'var(--shadow-2)',
          }}
        >
          <Link to="/" style={{ display: 'inline-flex', marginBottom: 28 }}>
            <img src={logoUrl} alt="loyainiti" style={{ height: 40 }} />
          </Link>
          <h1 className="h1" style={{ marginBottom: 8 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ font: 'var(--t-body)', color: 'var(--fg-2)', margin: 0, marginBottom: 24 }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {footer && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 16,
              font: 'var(--t-body-sm)',
              color: 'var(--fg-2)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
