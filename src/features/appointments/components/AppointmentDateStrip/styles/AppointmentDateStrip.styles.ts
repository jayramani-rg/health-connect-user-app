import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, spacing, textRole } from '../../../../../theme';

export const DATE_PILL_WIDTH = 64;
export const DATE_PILL_GAP = spacing.sm;

export const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginHorizontal: -layout.gutter,
  },
  row: {
    gap: DATE_PILL_GAP,
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.xxs,
  },
  pill: {
    width: DATE_PILL_WIDTH,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 2,
  },
  pillSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  pillEmpty: {
    backgroundColor: colors.canvas,
  },
  pillPressed: {
    opacity: 0.85,
  },
  weekday: {
    ...textRole.badge,
    color: colors.textSecondary,
  },
  dayNumber: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.text,
  },
  textSelected: {
    color: colors.white,
  },
  textMuted: {
    color: colors.textTertiary,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOpen: {
    backgroundColor: colors.success,
  },
  dotEmpty: {
    backgroundColor: colors.borderStrong,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
  availability: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  availabilitySelected: {
    color: colors.white,
  },
});
