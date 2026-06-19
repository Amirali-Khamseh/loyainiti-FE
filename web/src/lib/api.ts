/**
 * Tiny fetch wrapper for the loyainiti backend.
 * - Always sends credentials (session cookie) cross-origin.
 * - Throws on non-2xx with the BE's `{ error, message, details? }` shape.
 */

import { findUnsafeContent, UNSAFE_INPUT_MESSAGE } from './contentGuard';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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
  headers?: HeadersInit;
};

function buildUrl(path: string, query?: RequestOpts['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function api<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = 'GET', body, query, headers } = opts;

  // Block dangerous input (XSS/HTML/JS injection) before it ever leaves the
  // client — covers both request bodies (POST/PATCH) and query params (e.g. the
  // explore search/filter). The BE enforces the same dictionary as the gate.
  if (findUnsafeContent(body) || findUnsafeContent(query)) {
    throw new ApiError(0, 'unsafe_content', UNSAFE_INPUT_MESSAGE);
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 / no-content responses
  if (res.status === 204) return undefined as T;

  const ct = res.headers.get('content-type') ?? '';
  const payload = ct.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const err = typeof payload === 'object' && payload !== null ? payload : { message: String(payload) };
    throw new ApiError(
      res.status,
      (err as { error?: string }).error ?? 'http_error',
      (err as { message?: string }).message ?? res.statusText,
      (err as { details?: unknown }).details,
    );
  }

  return payload as T;
}
