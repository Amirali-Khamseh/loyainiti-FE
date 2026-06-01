/**
 * Build a public URL for an R2 object key. The bucket's public base URL is
 * provided at build time via VITE_R2_PUBLIC_BASE_URL; in dev it may be unset,
 * in which case this returns null and callers should fall back to a placeholder.
 */
export function r2Url(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = import.meta.env.VITE_R2_PUBLIC_BASE_URL ?? '';
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key}`;
}
