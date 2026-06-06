import { Platform } from 'react-native';
import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const isWeb = Platform.OS === 'web';

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
    ? []
    : [
        expoClient({
          scheme: 'loyainiti',
          storagePrefix: 'loyainiti',
          storage: SecureStore,
        }),
      ],
});

export type Role = 'customer' | 'business_owner' | 'staff' | 'admin';

export const API_URL = baseURL;
