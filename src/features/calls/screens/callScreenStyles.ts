import { StyleSheet } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';

export const callScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryStrong,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 79, 71, 0.18)',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  typeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: colors.white,
  },
  nameCompact: {
    marginTop: spacing.md,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.white,
  },
  status: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.86)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  name: {
    marginTop: spacing.lg,
    fontFamily: fontFamily.bold,
    fontSize: 26,
    textAlign: 'center',
    color: colors.white,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.72)',
  },
  statusLarge: {
    marginTop: spacing.lg,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.white,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  noticeText: {
    flexShrink: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.white,
  },
});
