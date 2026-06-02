import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Store, Tag, MessageSquare, LogOut, LayoutDashboard } from 'lucide-react';
import { auth } from '../../lib/auth';
import { RequireAuth } from '../../components/RequireAuth';

const navItems = [
  { to: '/_console', label: 'Overview', icon: <LayoutDashboard size={16} />, end: true },
  { to: '/_console/users', label: 'Users', icon: <Users size={16} />, end: false },
  { to: '/_console/businesses', label: 'Businesses', icon: <Store size={16} />, end: false },
  { to: '/_console/categories', label: 'Categories', icon: <Tag size={16} />, end: false },
  { to: '/_console/reviews', label: 'Reviews', icon: <MessageSquare size={16} />, end: false },
];

export function ConsoleLayout() {
  const navigate = useNavigate();
  const { data: session } = auth.useSession();

  return (
    <RequireAuth roles={['admin']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
        <header style={{
          display: 'flex', alignItems: 'center', gap: 24, padding: '12px 24px',
          background: 'var(--bg-inverse)', color: 'var(--fg-on-dark)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <Link to="/_console" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none' }}>
            <ShieldCheck size={20} />
            <span style={{ font: 'var(--t-h3)', fontWeight: 700 }}>console</span>
          </Link>

          <nav style={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
            {navItems.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} style={({ isActive }) => ({
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                font: 'var(--t-body-sm)', fontWeight: 500,
                color: isActive ? 'var(--fg-on-dark)' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              })}>
                {it.icon} {it.label}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ font: 'var(--t-caption)', color: 'rgba(255,255,255,0.6)' }}>
              {session?.user.email}
            </span>
            <button onClick={async () => { await auth.signOut(); navigate('/_console/login'); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 8, padding: '6px 12px', font: 'var(--t-body-sm)',
                color: 'var(--fg-on-dark)',
              }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>

        <main className="container" style={{ flex: 1, paddingBlock: 32 }}>
          <Outlet />
        </main>
      </div>
    </RequireAuth>
  );
}
