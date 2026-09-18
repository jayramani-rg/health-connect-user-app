import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    width: 56,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dayLabelSelected: {
    color: colors.white,
  },
  dayNumber: {
    ...typography.title,
    color: colors.text,
    marginTop: 2,
  },
  dayNumberSelected: {
    color: colors.white,
  },
});
