/**
 * The admin pages all need a "which business are we managing right now" answer.
 * The BE doesn't expose `GET /api/me/businesses` yet - flagged as a follow-up -
 * so we cache it in localStorage. Set on business creation; cleared on sign-out.
 */

const KEY = 'loyainiti.activeBusinessId';

export function getActiveBusinessId(): string | null {
  return localStorage.getItem(KEY);
}

export function setActiveBusinessId(id: string): void {
  localStorage.setItem(KEY, id);
}

export function clearActiveBusinessId(): void {
  localStorage.removeItem(KEY);
}
