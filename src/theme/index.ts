// Design system tokens. Existing flat keys (colors.brand, typography.h1, etc.) are kept as
// stable aliases so screens migrate incrementally — new work should prefer the richer
// palette/semantic/motion tokens added alongside them.

const fontFamily = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
};

const palette = {
  primary: '#0E6E64',
  primaryStrong: '#094F47',
  primarySoft: '#E3F3F0',
  accent: '#FF6B57',
  accentStrong: '#E14F3B',
  accentSoft: '#FFE7E1',
  ink: '#1B1B18',
  inkSoft: '#63605A',
  inkFaint: '#8B8780',
  canvas: '#FAF9F7',
  surface: '#FFFFFF',
  surfaceSunken: '#F2F0EC',
  border: '#E8E5DF',
  borderStrong: '#D6D2C9',
  success: '#1E8F5E',
  successSoft: '#E3F5EC',
  warning: '#B7791F',
  warningSoft: '#FBF0DD',
  error: '#D1453D',
  errorSoft: '#FCEAE8',
  pending: '#6E56CF',
  pendingSoft: '#EFEAFB',
  white: '#FFFFFF',
  black: '#000000',
};

export const colors = {
  // new semantic surface
  primary: palette.primary,
  primaryStrong: palette.primaryStrong,
  primarySoft: palette.primarySoft,
  accent: palette.accent,
  accentStrong: palette.accentStrong,
  accentSoft: palette.accentSoft,
  ink: palette.ink,
  inkSoft: palette.inkSoft,
  inkFaint: palette.inkFaint,
  surfaceSunken: palette.surfaceSunken,

  // legacy aliases kept so unmigrated screens keep compiling + inherit the new palette
  brand: palette.primary,
  brandStrong: palette.primaryStrong,
  brandSoft: palette.primarySoft,
  canvas: palette.canvas,
  surface: palette.surface,
  surface2: palette.surfaceSunken,
  text: palette.ink,
  textSecondary: palette.inkSoft,
  textTertiary: palette.inkFaint,
  border: palette.border,
  borderStrong: palette.borderStrong,
  success: palette.success,
  successSoft: palette.successSoft,
  warning: palette.warning,
  warningSoft: palette.warningSoft,
  error: palette.error,
  errorSoft: palette.errorSoft,
  pending: palette.pending,
  pendingSoft: palette.pendingSoft,
  white: palette.white,
  black: palette.black,
};

export const semantic = {
  success: { solid: palette.success, soft: palette.successSoft },
  warning: { solid: palette.warning, soft: palette.warningSoft },
  error: { solid: palette.error, soft: palette.errorSoft },
  pending: { solid: palette.pending, soft: palette.pendingSoft },
  info: { solid: palette.primary, soft: palette.primarySoft },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  giant: 64,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const shadow = {
  none: {},
  card: {
    shadowColor: '#0B1F1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  raised: {
    shadowColor: '#0B1F1B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  floating: {
    shadowColor: '#0B1F1B',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
};

export const iconSize = {
  sm: 16,
  md: 22,
  lg: 28,
};

export const typography = {
  display: { fontFamily: fontFamily.extraBold, fontSize: 34, lineHeight: 41, letterSpacing: -0.5 },
  h1: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 24, letterSpacing: -0.1 },
  subtitle: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodyStrong: { fontFamily: fontFamily.semiBold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  caption: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  label: { fontFamily: fontFamily.semiBold, fontSize: 13, lineHeight: 16, letterSpacing: 0.2 },
  overline: { fontFamily: fontFamily.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  stepLabel: { fontFamily: fontFamily.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' as const },
};

export const motion = {
  duration: { fast: 150, base: 220, slow: 300 },
  easing: {
    standard: [0.22, 1, 0.36, 1] as const,
  },
  spring: {
    press: { damping: 15, stiffness: 400, mass: 1 },
    sheet: { damping: 50, stiffness: 300, mass: 1 },
    pill: { damping: 19, stiffness: 220, mass: 1 },
  },
  listStagger: 40,
};

export { fontFamily };

export const theme = { colors, semantic, spacing, radius, typography, shadow, iconSize, motion, fontFamily };

export default theme;
