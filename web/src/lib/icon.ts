/**
 * Resolve a stored Lucide icon name (kebab or PascalCase, e.g. "utensils-crossed"
 * or "UtensilsCrossed") to its React component. Falls back to Tag when the name
 * is missing or unknown, so a typo in the admin panel never breaks a page.
 */
import { icons, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function toPascalCase(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Tag;
  const key = toPascalCase(name) as keyof typeof icons;
  return (icons[key] ?? Tag) as LucideIcon;
}
