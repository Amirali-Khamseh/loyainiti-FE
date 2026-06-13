/**
 * Loyainiti design tokens — TypeScript export for React Native (mobile/).
 * Cobalt theme (joincobalt.com): black/zinc canvas, sky-blue action, cyan glow.
 *
 * Mirrors the CSS variables in `tokens.css`. When changes are made, edit both
 * files together. (Web reads tokens.css; mobile reads tokens.ts.)
 *
 * Spacing values are in pixels (RN's unitless number == pixels).
 */

export const colors = {
  // Brand darks ("navy*" names kept for back-compat)
  navy900: '#000000', // pure black — deepest
  navy800: '#09090b', // zinc-950
  navy700: '#0c4a6e', // deep sky — hero blocks, bg-inverse
  navy600: '#075985', // sky-800

  // Brand blue → sky (primary action)
  blue700: '#0284c7', // sky-600 pressed
  blue600: '#0ea5e9', // sky-500 primary action
  blue500: '#38bdf8', // sky-400 hover on dark
  blue200: '#bae6fd',
  blue50:  '#f0f9ff',

  // Cyan glow accent
  cyan700: '#0891b2',
  cyan500: '#22d3ee', // cyan-400 accent
  cyan200: '#a5f3fc',
  cyan50:  '#ecfeff',

  // Emerald (success on dark)
  sage700: '#34d399',
  sage500: '#6ee7b7',
  sage200: '#a7f3d0',
  sage50:  '#052e2b',

  // Rose (danger on dark)
  rose600: '#fb7185',
  rose200: '#fecdd3',
  rose50:  '#2a0a12',

  // Zinc neutrals ("slate*" names kept)
  slate50:  '#fafafa',
  slate100: '#f4f4f5',
  slate200: '#e4e4e7', // secondary text on dark
  slate300: '#d4d4d8',
  slate400: '#a1a1aa', // tertiary text
  slate500: '#71717a', // captions, borders
  slate600: '#52525b',
  slate700: '#3f3f46',
  slate900: '#09090b',

  // Semantic foreground
  fg1: '#FFFFFF',
  fg2: '#e4e4e7',
  fg3: '#a1a1aa',
  fgOnDark: '#FFFFFF',
  fgOnAccent: '#FFFFFF',

  // Semantic background (dark hierarchy)
  bgCanvas: '#212129', // dark slate — main app background
  bgCard: '#18181b',   // zinc-900
  bgMuted: '#121214',
  bgSunken: '#000000', // pure black
  bgInverse: '#0c4a6e', // deep sky

  // Borders
  borderSubtle: '#27272a', // zinc-800
  borderDefault: '#3f3f46', // zinc-700
  borderStrong: '#71717a',  // zinc-500

  // Action
  action: '#0ea5e9',
  actionHover: '#38bdf8',
  actionPress: '#0284c7',
  actionFg: '#FFFFFF',
  actionSubtleBg: '#082f49',
  actionSubtleFg: '#22d3ee',

  // Status
  success: '#34d399',
  successBg: '#052e2b',
  successBorder: '#14532d',

  warning: '#fbbf24',
  warningBg: '#271a04',
  warningBorder: '#6b4200',

  danger: '#fb7185',
  dangerBg: '#2a0a12',
  dangerBorder: '#7f1d2e',
} as const;

export const fonts = {
  display: 'InterTight',
  body: 'InterTight',
  mono: 'JetBrainsMono',
} as const;

/** Spacing scale, 4-base. */
export const spacing = {
  0: 0,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  48: 48,
  64: 64,
  80: 80,
} as const;

/** Border radii — rounded, Cobalt-style. */
export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  pill: 9999,
} as const;

/** Type ramp — { fontFamily, fontSize, lineHeight, fontWeight }. */
export const type = {
  display1: { fontFamily: fonts.display, fontSize: 56, lineHeight: 58, fontWeight: '700' as const, letterSpacing: -1.12 },
  display2: { fontFamily: fonts.display, fontSize: 40, lineHeight: 43, fontWeight: '700' as const, letterSpacing: -0.72 },
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 37, fontWeight: '700' as const, letterSpacing: -0.45 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, fontWeight: '700' as const, letterSpacing: -0.24 },
  h3: { fontFamily: fonts.body, fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  bodyLg: { fontFamily: fonts.body, fontSize: 17, lineHeight: 26, fontWeight: '400' as const },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  bodySm: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, fontWeight: '500' as const },
  label: { fontFamily: fonts.body, fontSize: 11, lineHeight: 13, fontWeight: '500' as const, letterSpacing: 1.1, textTransform: 'uppercase' as const },
  numXL: { fontFamily: fonts.mono, fontSize: 40, lineHeight: 40, fontWeight: '600' as const, letterSpacing: -0.8 },
  numLg: { fontFamily: fonts.mono, fontSize: 28, lineHeight: 28, fontWeight: '600' as const, letterSpacing: -0.28 },
  num: { fontFamily: fonts.mono, fontSize: 15, lineHeight: 21, fontWeight: '500' as const },
} as const;

/** Shadow scale — cyan glow on near-black. */
export const shadow = {
  1: {
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  2: {
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  3: {
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 8,
  },
} as const;

export const motion = {
  durFast: 120,
  durBase: 200,
  durSlow: 320,
} as const;

export const tokens = { colors, fonts, spacing, radius, type, shadow, motion };
export default tokens;
