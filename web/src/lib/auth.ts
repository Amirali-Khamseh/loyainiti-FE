import { createAuthClient } from 'better-auth/react';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { API_URL } from './api';

/**
 * Better Auth React client. Uses session cookies (set by the BE), works
 * cross-origin because BE CORS is `origin: true, credentials: true`.
 *
 * Surface:
 *   auth.signIn.email({ email, password })
 *   auth.signUp.email({ email, password, name, country, city })
 *   auth.forgetPassword({ email })
 *   auth.signOut()
 *   const { data: session } = auth.useSession()
 */
export const auth = createAuthClient({
  baseURL: API_URL,
  plugins: [
    adminClient(),
    // Teaches the client about the BE's custom user fields so signUp.email is
    // typed to accept country/city and they appear on session.user.
    inferAdditionalFields({
      user: {
        country: { type: 'string', required: false },
        city: { type: 'string', required: false },
      },
    }),
  ],
});

export type Role = 'customer' | 'business_owner' | 'staff' | 'admin';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  country?: string | null;
  city?: string | null;
};
