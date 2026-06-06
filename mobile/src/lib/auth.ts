import { Platform } from 'react-native';
import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Better Auth client.
 *
 * On native (iOS / Android) we use the @better-auth/expo plugin, which
 * stores the session bearer token in expo-secure-store. The plugin also
 * intercepts every fetch to attach the Authorization header.
 *
 * On web we deliberately skip the expo plugin and let Better Auth fall
 * back to standard cookie-based session handling. Two reasons:
 *
 * 1. expo-secure-store's web stub in SDK 52 is incomplete - calling
 *    getItemAsync throws `getValueWithKeyAsync is not a function`,
 *    which kills `auth.useSession()` and every screen below it.
 * 2. Web doesn't need bearer tokens. The BE issues a session cookie on
 *    sign-in and the browser sends it back automatically (and our
 *    api.ts wrapper opts into `credentials: 'include'`).
 */
export const auth = createAuthClient({
  baseURL,
  plugins:
    Platform.OS === 'web'
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
