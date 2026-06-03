/**
 * Toast shim around react-toastify.
 *
 * The rest of the app calls `useToast()` and gets back { success, error, info, show }.
 * We keep that surface stable while delegating actual rendering to react-toastify,
 * which gives us nicer animations, stacking, swipe-to-dismiss, and a11y for free.
 *
 * <ToastProvider> still exists as a no-op for backwards compatibility with the
 * older custom provider; the real container is mounted globally in main.tsx.
 */
import React, { useMemo } from 'react';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ToastKind = 'success' | 'error' | 'info';

type ToastApi = {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

/** Legacy wrapper - no longer required, kept so existing imports don't break. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** Mount once at the app root (next to <RouterProvider>). */
export function Toaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
      transition={Slide}
      style={{ zIndex: 99999 }}
    />
  );
}

export function useToast(): ToastApi {
  return useMemo<ToastApi>(
    () => ({
      show: (m, kind = 'info') => {
        if (kind === 'success') toast.success(m);
        else if (kind === 'error') toast.error(m);
        else toast.info(m);
      },
      success: (m) => toast.success(m),
      error: (m) => toast.error(m),
      info: (m) => toast.info(m),
    }),
    [],
  );
}
