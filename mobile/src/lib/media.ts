/**
 * Build a public URL for an R2 object key.
 *
 * The base URL is provided at build time via EXPO_PUBLIC_R2_PUBLIC_BASE_URL
 * (e.g. https://pub-XXXXXXXX.r2.dev or a custom domain). If not set we
 * return null and callers fall back to a placeholder - matches web's
 * media.ts behaviour so the same logic works on both clients.
 */
export function r2Url(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL ?? '';
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key}`;
}
