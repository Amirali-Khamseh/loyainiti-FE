import { createAuthClient } from 'better-auth/react';
import { API_URL } from './api';

/**
 * Better Auth React client. Uses session cookies (set by the BE), works
 * cross-origin because BE CORS is `origin: true, credentials: true`.
 *
 * Surface:
 *   auth.signIn.email({ email, password })
 *   auth.signUp.email({ email, password, name })
 *   auth.forgetPassword({ email })
 *   auth.signOut()
 *   const { data: session } = auth.useSession()
 */
export const auth = createAuthClient({
  baseURL: API_URL,
});

export type Role = 'customer' | 'business_owner' | 'staff' | 'admin';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};
