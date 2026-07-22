import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { SignInPage } from './features/auth/SignInPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { SignUpBusinessPage } from './features/auth/SignUpBusinessPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { LandingPage } from './features/landing/LandingPage';
import { ExplorePage } from './features/explore/ExplorePage';
import { CategoryPage } from './features/explore/CategoryPage';
import { ShopPage } from './features/shop/ShopPage';
import { MyQrPage } from './features/my-qr/MyQrPage';
import { VisitsPage } from './features/visits/VisitsPage';
import { StatsPage } from './features/stats/StatsPage';
import { ScanPage } from './features/scan/ScanPage';
import { MenuAdminPage } from './features/menu-admin/MenuAdminPage';
import { BusinessProfilePage } from './features/business-profile/BusinessProfilePage';
import { StaffPage } from './features/staff/StaffPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { FavoritesPage } from './features/favorites/FavoritesPage';
import { ConsoleLoginPage } from './features/console/ConsoleLoginPage';
import { ConsoleLayout } from './features/console/ConsoleLayout';
import { ConsoleHomePage } from './features/console/ConsoleHomePage';
import { ConsoleUsersPage } from './features/console/ConsoleUsersPage';
import { ConsoleBusinessesPage } from './features/console/ConsoleBusinessesPage';
import { ConsoleCategoriesPage } from './features/console/ConsoleCategoriesPage';
import { ConsoleReviewsPage } from './features/console/ConsoleReviewsPage';
import { RouteErrorBoundary } from './components/ErrorBoundary';

const STAFF = ['business_owner', 'staff'] as const;

export const router = createBrowserRouter([
  // Pathless layout route: no `element` renders an implicit <Outlet/>, and its
  // errorElement is the single catch-all for render/loader errors across every
  // screen below — any uncaught throw shows the themed fallback.
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      // Auth screens (no shell)
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },            // customer
      { path: '/sign-up/customer', element: <SignUpPage /> },  // explicit customer route from sign-in
      { path: '/sign-up/business', element: <SignUpBusinessPage /> }, // business owner
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },

      // Everything else under the AppShell
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'explore', element: <ExplorePage /> },
          { path: 'categories/:mainSlug', element: <CategoryPage /> },
          { path: 'b/:slug', element: <ShopPage /> },
          {
            path: 'my-qr',
            element: <RequireAuth><MyQrPage /></RequireAuth>,
          },
          {
            path: 'visits',
            element: <RequireAuth><VisitsPage /></RequireAuth>,
          },
          {
            path: 'favorites',
            element: <RequireAuth><FavoritesPage /></RequireAuth>,
          },
          {
            path: 'profile',
            element: <RequireAuth><ProfilePage /></RequireAuth>,
          },
          // Onboarding: customer creates a business (promoted to business_owner after)
          {
            path: 'onboarding/business',
            element: <RequireAuth><BusinessProfilePage /></RequireAuth>,
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
        children: [
          { index: true, element: <ConsoleHomePage /> },
          { path: 'users', element: <ConsoleUsersPage /> },
          { path: 'businesses', element: <ConsoleBusinessesPage /> },
          { path: 'categories', element: <ConsoleCategoriesPage /> },
          { path: 'reviews', element: <ConsoleReviewsPage /> },
        ],
      },
    ],
  },
]);
