import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { SignInPage } from './features/auth/SignInPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ExplorePage } from './features/explore/ExplorePage';
import { ShopPage } from './features/shop/ShopPage';
import { MyQrPage } from './features/my-qr/MyQrPage';
import { VisitsPage } from './features/visits/VisitsPage';
import { StatsPage } from './features/stats/StatsPage';
import { ScanPage } from './features/scan/ScanPage';
import { MenuAdminPage } from './features/menu-admin/MenuAdminPage';
import { BusinessProfilePage } from './features/business-profile/BusinessProfilePage';
import { StaffPage } from './features/staff/StaffPage';
import { ConsoleLoginPage } from './features/console/ConsoleLoginPage';
import { ConsoleLayout } from './features/console/ConsoleLayout';
import { ConsoleHomePage } from './features/console/ConsoleHomePage';

const STAFF = ['business_owner', 'staff'] as const;

export const router = createBrowserRouter([
  // Auth screens (no shell)
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // Everything else under the AppShell
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ExplorePage /> },
      { path: 'b/:slug', element: <ShopPage /> },
      {
        path: 'my-qr',
        element: <RequireAuth><MyQrPage /></RequireAuth>,
      },
      {
        path: 'visits',
        element: <RequireAuth><VisitsPage /></RequireAuth>,
      },
      // Onboarding: customer creates a business (promoted to business_owner after).
      // No RequireAuth wrapper here — the session may not be ready immediately
      // after sign-up when React Router renders this route. The wizard's
      // createMut will get a 401 from the API if the user somehow isn't logged in.
      {
        path: 'onboarding/business',
        element: <BusinessProfilePage />,
      },
      // Business admin (requires staff role)
      {
        path: 'admin',
        element: (
          <RequireAuth roles={[...STAFF]}>
            <Outlet />
          </RequireAuth>
        ),
        children: [
          { path: 'stats', element: <StatsPage /> },
          { path: 'scan', element: <ScanPage /> },
          { path: 'menus', element: <MenuAdminPage /> },
          { path: 'staff', element: <StaffPage /> },
          { path: 'business', element: <BusinessProfilePage /> },
        ],
      },
    ],
  },

  // Hidden SaaS admin console (not linked from the public app)
  { path: '/_console/login', element: <ConsoleLoginPage /> },
  {
    path: '/_console',
    element: <ConsoleLayout />,
    children: [{ index: true, element: <ConsoleHomePage /> }],
  },
]);
