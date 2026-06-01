import React from 'react';
import { Outlet } from 'react-router-dom';
import { RequireAuth } from '../../components/RequireAuth';

/**
 * Admin console shell — simply gates everything under /_console to
 * role=admin. The actual header/nav lives inside ConsoleHome.
 */
export function ConsoleLayout() {
  return (
    <RequireAuth roles={['admin']}>
      <Outlet />
    </RequireAuth>
  );
}
