import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, Users, Store, Tag, MessageSquare } from 'lucide-react';
import { auth } from '../../lib/auth';
import { Card } from '../../components/Card';

/**
 * Admin console landing. Phase 1 ships the gated shell + the cards below as
 * placeholders; Users / Businesses / Categories / Reviews management are wired
 * up in Phase 4. Everything here is reachable only at /_console with role=admin.
 */
const sections = [
  { icon: <Users size={20} />, title: 'Users', desc: 'Roles, bans, impersonation' },
  { icon: <Store size={20} />, title: 'Businesses', desc: 'Assign staff & roles' },
  { icon: <Tag size={20} />, title: 'Categories', desc: 'Manage the category list' },
  { icon: <MessageSquare size={20} />, title: 'Reviews', desc: 'Moderate flagged reviews' },
];

export function ConsoleHome() {
  const navigate = useNavigate();
  const { data: session } = auth.useSession();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-inverse, #1F1611)',
          color: 'var(--fg-on-dark, #FBF8F3)',
        }}
      >
        <ShieldCheck size={22} />
        <span className="label" style={{ color: 'inherit' }}>
          Admin console
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="caption" style={{ color: 'inherit', opacity: 0.8 }}>
            {session?.user.email}
          </span>
          <button
            onClick={async () => {
              await auth.signOut();
              navigate('/_console/login');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 10,
              padding: '6px 12px',
              font: 'var(--t-body-sm)',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="container" style={{ paddingBlock: 32 }}>
        <h1 className="display-2">Welcome, admin</h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8, marginBottom: 24 }}>
          Manage the loyainiti network. Full tooling lands shortly.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {sections.map((s) => (
            <Card key={s.title} padding={24} variant="muted">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--action)' }}>
                {s.icon}
                <h3 className="h3">{s.title}</h3>
              </div>
              <p className="body-sm" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
                {s.desc}
              </p>
              <p className="caption" style={{ color: 'var(--fg-3)', marginTop: 12 }}>
                Coming in Phase 4
              </p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
