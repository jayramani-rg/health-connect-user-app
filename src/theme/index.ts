export const colors = {
  brand: '#2F6FED',
  brandStrong: '#1E54C6',
  brandSoft: '#EAF1FE',
  canvas: '#F7F8FA',
  surface: '#FFFFFF',
  surface2: '#ECEEF2',
  text: '#111318',
  textSecondary: '#5B6270',
  textTertiary: '#7B8291',
  border: '#E0E3E9',
  borderStrong: '#C9CED8',
  success: '#12805C',
  successSoft: '#E2F3EC',
  warning: '#B25E09',
  warningSoft: '#FBEEDD',
  error: '#D92D20',
  errorSoft: '#FCE9E7',
  pending: '#7C4DE0',
  pendingSoft: '#EFE9FD',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const iconSize = {
  sm: 16,
  md: 22,
  lg: 28,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2 },
  title: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  stepLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2, textTransform: 'uppercase' as const },
};

export const theme = { colors, spacing, radius, typography, shadow, iconSize };

export default theme;
