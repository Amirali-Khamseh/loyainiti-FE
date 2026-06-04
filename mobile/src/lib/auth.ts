import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Better Auth client tuned for Expo. Tokens live in `expo-secure-store`; every
 * fetch made through this client (or the `api()` wrapper below) attaches the
 * Bearer header automatically.
 */
export const auth = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: 'loyainiti',
      storagePrefix: 'loyainiti',
      storage: SecureStore,
    }),
  ],
});

export type Role = 'customer' | 'business_owner' | 'staff' | 'admin';

export const API_URL = baseURL;
