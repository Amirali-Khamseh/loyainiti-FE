import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Compass, QrCode, History, LayoutDashboard, ScanLine, UtensilsCrossed, Store, LogOut, LogIn, Sparkles } from 'lucide-react';
import { auth, type Role } from '../lib/auth';
import logoUrl from '../design-system/assets/logo.svg';

const headerStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: 'rgba(251, 248, 243, 0.92)',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid var(--border-subtle)',
};

const navLinkBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  borderRadius: 10,
  textDecoration: 'none',
  font: 'var(--t-body-sm)',
  fontWeight: 500,
  color: 'var(--fg-2)',
};

function getNavLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    ...navLinkBase,
    color: isActive ? 'var(--action)' : 'var(--fg-2)',
    background: isActive ? 'var(--action-subtle-bg)' : 'transparent',
  };
}

type Item = { to: string; label: string; icon: React.ReactNode };

const customerItems: Item[] = [
  { to: '/', label: 'Explore', icon: <Compass size={16} /> },
  { to: '/my-qr', label: 'My QR', icon: <QrCode size={16} /> },
  { to: '/visits', label: 'Visits', icon: <History size={16} /> },
];

const businessItems: Item[] = [
  { to: '/admin/stats', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/admin/scan', label: 'Scan', icon: <ScanLine size={16} /> },
  { to: '/admin/menus', label: 'Menus & Rewards', icon: <UtensilsCrossed size={16} /> },
  { to: '/admin/business', label: 'Profile', icon: <Store size={16} /> },
];

export function AppShell() {
  const navigate = useNavigate();
  const { data: session, isPending } = auth.useSession();
  // `role` is a BE-side additional field; the client types don't see it, so we cast.
  const role: Role | undefined = (session?.user as { role?: Role } | undefined)?.role;
  const isStaff = role === 'business_owner' || role === 'staff' || role === 'admin';
  // Shops don't need a personal QR (they're the ones scanning, not being scanned).
  // Give staff the business nav only; customers keep the customer nav.
  const items = isStaff ? businessItems : customerItems;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={headerStyle}>
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            paddingTop: 12,
            paddingBottom: 12,
          }}
        >
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <img src={logoUrl} alt="Loyainiti" style={{ height: 28 }} />
          </Link>

          {session && (
            <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} end style={getNavLinkStyle}>
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
                <span className="caption" style={{ color: 'var(--fg-3)' }}>
                  {session.user.email}
                </span>
                <button
                  onClick={async () => {
                    await auth.signOut();
                    navigate('/sign-in');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'transparent',
                    border: '1px solid var(--border-default)',
                    borderRadius: 10,
                    padding: '6px 12px',
                    font: 'var(--t-body-sm)',
                    color: 'var(--fg-2)',
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
                  to="/sign-up"
                  style={() => ({
                    ...navLinkBase,
                    background: 'var(--action)',
                    color: 'var(--action-fg)',
                    fontWeight: 600,
                  })}
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
          paddingBlock: 24,
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 32,
          color: 'var(--fg-3)',
          font: 'var(--t-caption)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          <span className="brand-stamp" />
          &nbsp;loyainiti - loyalty without limits
        </span>
        <span className="mono">v0.1.0</span>
      </footer>
    </div>
  );
}
