/**
 * Curated country list for sign-up and business-profile location pickers.
 * Mirrored in `mobile/src/lib/countries.ts` per the repo's duplicate-not-share
 * convention. `name` is the value persisted on user/business records, so it must
 * stay consistent with the seed data (e.g. "United Kingdom", "Italy").
 */
export type Country = { code: string; name: string };

export const COUNTRIES: Country[] = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
];
