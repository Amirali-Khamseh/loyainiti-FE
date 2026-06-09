/**
 * Loyainiti design tokens — TypeScript export for React Native (mobile/).
 *
 * Mirrors the CSS variables in `tokens.css`. When changes are made, edit both
 * files together. (Web reads tokens.css; mobile reads tokens.ts.)
 *
 * Spacing values are in pixels (RN's unitless number == pixels).
 */

export const colors = {
  // Brand navy
  navy900: '#000D2E',
  navy800: '#030918',
  navy700: '#052698', // deep brand navy — hero blocks, bg-inverse
  navy600: '#0832B8',

  // Brand blue (primary action)
  blue700: '#0443C7', // pressed
  blue600: '#116BF8', // primary action
  blue500: '#3D83F9', // hover on dark
  blue200: '#B3CCFD',
  blue50:  '#EBF2FF',

  // Cyan accent
  cyan700: '#1292BE',
  cyan500: '#21BCEE', // accent
  cyan200: '#A8E2F7',
  cyan50:  '#E5F7FD',

  // Sage (success — brightened for dark bg)
  sage700: '#4F9B5A',
  sage500: '#6DBF79',
  sage200: '#B4E6BA',
  sage50:  '#0D2B10',

  // Rose (danger — brightened for dark bg)
  rose600: '#E84C5C',
  rose200: '#F5A8B0',
  rose50:  '#2B0A0E',

  // Slate neutrals
  slate50:  '#F5F8FA',
  slate100: '#EBF0F5',
  slate200: '#DCE3EB', // secondary text on dark, light surfaces
  slate300: '#BEC8D4',
  slate400: '#A0ACBC',
  slate500: '#878EA0', // tertiary text, borders
  slate600: '#5A6070',
  slate700: '#3B3F4E',
  slate900: '#000000', // canvas

  // Semantic foreground
  fg1: '#FFFFFF',
  fg2: '#DCE3EB',
  fg3: '#878EA0',
  fgOnDark: '#FFFFFF',
  fgOnAccent: '#FFFFFF',

  // Semantic background (dark hierarchy)
  bgCanvas: '#060E2B',
  bgCard: '#0D1D5C',
  bgMuted: '#091540',
  bgSunken: '#040B1E',
  bgInverse: '#052698',

  // Borders
  borderSubtle: '#152555',
  borderDefault: '#1E3880',
  borderStrong: '#878EA0',

  // Action
  action: '#116BF8',
  actionHover: '#3D83F9',
  actionPress: '#0443C7',
  actionFg: '#FFFFFF',
  actionSubtleBg: '#0A1F55',
  actionSubtleFg: '#21BCEE',

  // Status
  success: '#4F9B5A',
  successBg: '#0D2B10',
  successBorder: '#1A5C22',

  warning: '#F5A623',
  warningBg: '#2B1A00',
  warningBorder: '#6B4200',

  danger: '#E84C5C',
  dangerBg: '#2B0A0E',
  dangerBorder: '#6B1520',
} as const;

export const fonts = {
  display: 'Fraunces',
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

/** Border radii. */
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  pill: 999,
} as const;

/** Type ramp — { fontFamily, fontSize, lineHeight, fontWeight }. */
export const type = {
  display1: { fontFamily: fonts.display, fontSize: 56, lineHeight: 58, fontWeight: '700' as const, letterSpacing: -1.12 },
  display2: { fontFamily: fonts.display, fontSize: 40, lineHeight: 43, fontWeight: '700' as const, letterSpacing: -0.72 },
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 37, fontWeight: '600' as const, letterSpacing: -0.45 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, fontWeight: '600' as const, letterSpacing: -0.24 },
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

/** Shadow scale — blue glow on dark. */
export const shadow = {
  1: {
    shadowColor: '#116BF8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  2: {
    shadowColor: '#116BF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  3: {
    shadowColor: '#116BF8',
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
