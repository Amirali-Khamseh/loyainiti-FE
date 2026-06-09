import React from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../../design-system/assets/logo.svg';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

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
        <Link to="/" style={{ display: 'inline-flex' }}>
          <img src={logoUrl} alt="Loyainiti" style={{ height: 36, marginBottom: 32 }} />
        </Link>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 4,
            padding: 32,
            boxShadow: 'var(--shadow-2)',
          }}
        >
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
