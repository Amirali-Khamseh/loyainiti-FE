import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './auth';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOpts = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
};

const TOKEN_KEY = 'loyainiti.session_token';

function buildUrl(path: string, query?: RequestOpts['query']): string {
  const base = path.startsWith('http') ? path : `${API_URL}${path}`;
  if (!query) return base;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) sp.set(k, String(v));
  }
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${sp.toString()}`;
}

/**
 * Read the bearer token on native. Returns null on any failure so public
 * endpoints still work. Web doesn't need this - it uses cookie auth (see
 * api() below) - so this is native-only.
 */
async function readNativeToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Fetch wrapper that talks to the loyainiti BE.
 *
 * Auth differs by platform because @better-auth/expo uses two different
 * mechanisms under the hood:
 *
 * - Native (iOS / Android): Better Auth issues a bearer token, the expo
 *   plugin persists it in expo-secure-store, and we forward it on every
 *   request as `Authorization: Bearer ...`.
 * - Web (Expo Metro web preview): Better Auth uses standard cookies set
 *   by the BE (Set-Cookie on sign-in / sign-up). We just need to opt the
 *   fetch into sending cross-origin cookies via `credentials: 'include'`.
 *   The BE CORS plugin reflects the origin and allows credentials, and
 *   Better Auth's `trustedOrigins` includes localhost:8081 since the
 *   M1-era trustedOrigins fix.
 *
 * The previous "read TOKEN_KEY from localStorage on web" approach was
 * broken because @better-auth/expo's web shim doesn't actually mirror
 * the native bearer-token storage layout - sessions on web live in
 * cookies, not localStorage. That mismatch made every authd request 401
 * and surfaced as "Couldn't load your profile" / similar blank states.
 */
export async function api<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = 'GET', body, query, headers } = opts;
  const isWeb = Platform.OS === 'web';
  const token = isWeb ? null : await readNativeToken();

  const res = await fetch(buildUrl(path, query), {
    method,
    credentials: isWeb ? 'include' : 'same-origin',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const ct = res.headers.get('content-type') ?? '';
  const payload: unknown = ct.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const err =
      typeof payload === 'object' && payload !== null
        ? (payload as { error?: string; message?: string; details?: unknown })
        : { message: String(payload) };
    throw new ApiError(
      res.status,
      err.error ?? 'http_error',
      err.message ?? res.statusText,
      err.details,
    );
  }

  return payload as T;
}
