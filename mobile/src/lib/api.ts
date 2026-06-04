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
 * Fetch wrapper that auto-attaches the Better Auth bearer token persisted by
 * `@better-auth/expo` to `expo-secure-store`. The token key matches the
 * `storagePrefix` configured in `src/lib/auth.ts`.
 */
export async function api<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = 'GET', body, query, headers } = opts;
  const token = await SecureStore.getItemAsync(TOKEN_KEY);

  const res = await fetch(buildUrl(path, query), {
    method,
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
