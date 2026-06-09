import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass, QrCode, History, LayoutDashboard, ScanLine,
  UtensilsCrossed, Store, Users, Shield, LogOut, LogIn, Sparkles, UserCircle,
} from 'lucide-react';
import { auth, type Role } from '../lib/auth';
import { api } from '../lib/api';
import logoUrl from '../design-system/assets/logo.svg';
import logoDarkUrl from '../design-system/assets/logo-dark.svg';

type MyBusiness = { id: string; staffRole: 'owner' | 'manager' | 'staff' };

const headerStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: '#FFFFFF',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(5, 38, 152, 0.12)',
  boxShadow: '0 1px 8px rgba(5, 38, 152, 0.08)',
};

const navLinkBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  borderRadius: 4,
  textDecoration: 'none',
  font: 'var(--t-body-sm)',
  fontWeight: 500,
  color: '#052698',
};

function getNavLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    ...navLinkBase,
    color: isActive ? 'var(--action)' : '#052698',
    background: isActive ? 'rgba(17, 107, 248, 0.08)' : 'transparent',
  };
}

type Item = { to: string; label: string; icon: React.ReactNode };

const customerItems: Item[] = [
  { to: '/', label: 'Explore', icon: <Compass size={16} /> },
  { to: '/my-qr', label: 'My QR', icon: <QrCode size={16} /> },
  { to: '/visits', label: 'Visits', icon: <History size={16} /> },
  { to: '/profile', label: 'Profile', icon: <UserCircle size={16} /> },
];

export function AppShell() {
  const navigate = useNavigate();
  const { data: session, isPending } = auth.useSession();
  const role: Role | undefined = (session?.user as { role?: Role } | undefined)?.role;
  const isAdmin = role === 'admin';
  const isStaff = role === 'business_owner' || role === 'staff';

  // Fetch per-business role to gate Dashboard (owner/manager) and Staff (owner).
  const myBiz = useQuery({
    queryKey: ['my-businesses'],
    queryFn: () => api<MyBusiness[]>('/api/me/businesses'),
    enabled: isStaff,
  });
  const bizRoles = (myBiz.data ?? []).map((b) => b.staffRole);
  const canSeeStats = bizRoles.includes('owner') || bizRoles.includes('manager');
  const isOwner = bizRoles.includes('owner');

  let items: Item[] = customerItems;
  if (isStaff) {
    items = [
      ...(canSeeStats ? [{ to: '/admin/stats', label: 'Dashboard', icon: <LayoutDashboard size={16} /> }] : []),
      { to: '/admin/scan', label: 'Scan', icon: <ScanLine size={16} /> },
      { to: '/admin/menus', label: 'Menus & Rewards', icon: <UtensilsCrossed size={16} /> },
      ...(isOwner ? [{ to: '/admin/staff', label: 'Staff', icon: <Users size={16} /> }] : []),
      { to: '/admin/business', label: 'Profile', icon: <Store size={16} /> },
    ];
  } else if (isAdmin) {
    items = [{ to: '/_console', label: 'Admin console', icon: <Shield size={16} /> }];
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={headerStyle}>
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', gap: 24, paddingTop: 12, paddingBottom: 12 }}
        >
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <img src={logoDarkUrl} alt="Loyainiti" style={{ height: 28 }} />
          </Link>

          {session && (
            <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.to === '/'} style={getNavLinkStyle}>
                  {it.icon} {it.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {isPending ? (
              <span className="spinner" />
            ) : session ? (
              <>
                <span className="caption" style={{ color: '#878EA0' }}>
                  {session.user.email}
                </span>
                <button
                  onClick={async () => { await auth.signOut(); navigate('/sign-in'); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'transparent', border: '1px solid rgba(5, 38, 152, 0.25)',
                    borderRadius: 4, padding: '6px 12px', font: 'var(--t-body-sm)',
                    color: '#052698', cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/sign-in" style={getNavLinkStyle}>
                  <LogIn size={14} /> Sign in
                </NavLink>
                <NavLink
                  to="/sign-in"
                  style={() => ({ ...navLinkBase, background: 'var(--action)', color: 'var(--action-fg)', fontWeight: 600 })}
                >
                  <Sparkles size={14} /> Get started
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingBlock: 32 }}>
        <Outlet />
      </main>

      <footer
        className="container"
        style={{
          paddingBlock: 24, borderTop: '1px solid var(--border-subtle)', marginTop: 32,
          color: 'var(--fg-3)', font: 'var(--t-caption)', display: 'flex', justifyContent: 'space-between',
        }}
      >
        <span><span className="brand-stamp" />&nbsp;loyainiti - loyalty without limits</span>
        <span className="mono">v0.1.0</span>
      </footer>
    </div>
  );
}
