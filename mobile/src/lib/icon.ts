/**
 * Resolve a stored Lucide icon name (kebab or PascalCase, e.g. "utensils-crossed"
 * or "UtensilsCrossed") to its React Native component. Falls back to a sensible
 * default when the name is missing or unknown, so a typo in the admin panel
 * never crashes the card grid.
 */
import { icons, type LucideIcon, Tag } from 'lucide-react-native';

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
  return icons[key] ?? Tag;
}
