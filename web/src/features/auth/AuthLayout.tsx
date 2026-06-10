import React from 'react';
import { Link } from 'react-router-dom';
import logoDarkUrl from '../../design-system/assets/logo-dark.svg';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

// Override CSS vars for all child components (Input, Button, text) so they
// render correctly against the white card background.
const lightVars: React.CSSProperties = {
  '--fg-1': '#052698',
  '--fg-2': '#1E3880',
  '--fg-3': '#878EA0',
  '--bg-card': '#F0F4FA',
  '--bg-muted': '#E8EEF8',
  '--border-default': 'rgba(5,38,152,0.15)',
  '--border-subtle': 'rgba(5,38,152,0.08)',
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
          'radial-gradient(900px 500px at 75% -5%, rgba(17,107,248,0.18), transparent), var(--bg-canvas)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div
          style={{
            ...lightVars,
            background: '#ffffff',
            border: '1px solid rgba(5,38,152,0.1)',
            borderRadius: 4,
            padding: 32,
            boxShadow: 'var(--shadow-2)',
          }}
        >
          <Link to="/" style={{ display: 'inline-flex', marginBottom: 28 }}>
            <img src={logoDarkUrl} alt="Loyainiti" style={{ height: 32 }} />
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
