/**
 * Loyainiti design tokens — TypeScript export for React Native (mobile/).
 *
 * Mirrors the CSS variables in `tokens.css`. When changes are made, edit both
 * files together. (Web reads tokens.css; mobile reads tokens.ts.)
 *
 * Spacing values are in pixels (RN's unitless number == pixels).
 */

export const colors = {
  // Brand core
  espresso900: '#1F1611',
  espresso800: '#2A1F18',
  espresso700: '#3D2E22',
  espresso600: '#5C4836',

  terracotta700: '#A8482B',
  terracotta600: '#C45A36', // primary action
  terracotta500: '#DB7351',
  terracotta200: '#F3D2C2',
  terracotta50: '#FBEFE8',

  gold600: '#B58A3C',
  gold500: '#D4A24A', // loyalty stamp
  gold200: '#F0DDB0',
  gold50: '#FBF4E0',

  sage700: '#4F6B52',
  sage500: '#7B9C7E',
  sage200: '#CFDDC9',
  sage50: '#EDF2E7',

  rose600: '#B43F4D',
  rose200: '#F2C8CD',
  rose50: '#FCEDEE',

  // Paper / neutrals
  paper50: '#FBF8F3',
  paper100: '#F6F1E8',
  paper200: '#ECE4D4',
  paper300: '#D9CDB4',
  paper400: '#B8A98A',
  paper500: '#8E7F66',
  paper600: '#6B5E48',
  paper700: '#4A4233',

  // Semantic foreground
  fg1: '#1F1611',
  fg2: '#4A4233',
  fg3: '#8E7F66',
  fgOnDark: '#FBF8F3',
  fgOnAccent: '#FFFFFF',

  // Semantic background
  bgCanvas: '#FBF8F3',
  bgCard: '#FFFFFF',
  bgMuted: '#F6F1E8',
  bgSunken: '#ECE4D4',
  bgInverse: '#1F1611',

  // Borders
  borderSubtle: '#ECE4D4',
  borderDefault: '#D9CDB4',
  borderStrong: '#B8A98A',

  // Action
  action: '#C45A36',
  actionHover: '#A8482B',
  actionPress: '#8E3922',
  actionFg: '#FFFFFF',
  actionSubtleBg: '#FBEFE8',
  actionSubtleFg: '#A8482B',

  // Status
  success: '#4F6B52',
  successBg: '#EDF2E7',
  successBorder: '#CFDDC9',

  warning: '#A86A12',
  warningBg: '#FBF4E0',
  warningBorder: '#F0DDB0',

  danger: '#B43F4D',
  dangerBg: '#FCEDEE',
  dangerBorder: '#F2C8CD',
} as const;

export const fonts = {
  display: 'Fraunces', // serif, display
  body: 'InterTight', // grotesk, body
  mono: 'JetBrainsMono', // monospace, numerals
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

/** Light shadow scale (RN ios-shadow style; android uses elevation). */
export const shadow = {
  1: {
    shadowColor: '#1F1611',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: '#1F1611',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  3: {
    shadowColor: '#1F1611',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
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
