import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, type Role } from '../lib/auth';

type Props = {
  children: React.ReactNode;
  roles?: Role[];
};

export function RequireAuth({ children, roles }: Props) {
  const { data: session, isPending } = auth.useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 200 }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  const userRole = (session.user as { role?: Role }).role;
  if (roles && (!userRole || !roles.includes(userRole))) {
    return (
      <div style={{ paddingBlock: 64, textAlign: 'center' }}>
        <h2 className="h2">Not for your account</h2>
        <p className="body" style={{ marginTop: 12, color: 'var(--fg-2)' }}>
          This area is only for {roles.join(' or ')} accounts.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
