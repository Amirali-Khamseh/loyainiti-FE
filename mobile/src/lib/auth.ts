import { Platform } from 'react-native';
import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

// Teaches the client about the BE's custom user fields so signUp.email accepts
// country/city and they appear on session.user.
const additionalFields = inferAdditionalFields({
  user: {
    country: { type: 'string', required: false },
    city: { type: 'string', required: false },
  },
});

const isWeb = Platform.OS === 'web';

/**
 * API base URL.
 *
 * Web: derive it from the page's own host so the BE is always *same-site*
 * with the browser tab. This matters because web auth is cookie-based and
 * the session cookie is SameSite=Lax — if the API lived on a different host
 * (e.g. a LAN IP while the page is on localhost) the browser would treat the
 * cookie as cross-site and silently drop it, so get-session would return
 * null and every signed-in screen would bounce back to sign-in. The BE runs
 * on port 3000 regardless of which port Metro serves the web bundle from.
 *
 * Native: there is no page host and auth is bearer-token based (no cookie),
 * so we use EXPO_PUBLIC_API_URL — set this to your machine's LAN IP so a
 * physical phone on the same Wi-Fi can reach the BE.
 */
const baseURL =
  isWeb && typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000');

/**
 * Better Auth client.
 *
 * Native (iOS / Android): the @better-auth/expo plugin stores the bearer
 * token in expo-secure-store and attaches it to every fetch as
 * Authorization: Bearer ....
 *
 * Web (Expo Metro preview): the expo plugin is skipped entirely. Two
 * reasons:
 *
 *   1. expo-secure-store's SDK 52 web stub is incomplete - getItemAsync
 *      throws `_ExpoSecureStore.default.getValueWithKeyAsync is not a
 *      function`, which crashes auth.useSession() and every screen
 *      below it.
 *   2. Web doesn't need bearer tokens. The BE issues a session cookie
 *      and the browser can send it back on every request - if we opt
 *      into credentials. createAuthClient's default fetch does NOT
 *      include credentials, so we pass them via fetchOptions below
 *      AND mirror the same setting in src/lib/api.ts for our own
 *      data calls.
 *
 * Without the explicit credentials option, the React client silently
 * fails every internal auth call (sign-in succeeds in the eyes of the
 * BE but the cookie is dropped by the browser, get-session sends no
 * cookie back, every screen ends up empty).
 */
export const auth = createAuthClient({
  baseURL,
  fetchOptions: isWeb ? { credentials: 'include' } : undefined,
  plugins: isWeb
    ? [additionalFields]
    : [
        additionalFields,
        expoClient({
          scheme: 'loyainiti',
          storagePrefix: 'loyainiti',
          storage: SecureStore,
        }),
      ],
});

export type Role = 'customer' | 'business_owner' | 'staff' | 'admin';

export const API_URL = baseURL;
