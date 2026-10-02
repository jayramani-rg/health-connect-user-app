import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../../../theme';

export const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  card: {
    minWidth: 132,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  cardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  dateLabel: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: 'center',
  },
  dateLabelSelected: {
    color: colors.brandStrong,
  },
  status: {
    ...typography.caption,
    fontSize: 12,
    textAlign: 'center',
  },
  statusAvailable: {
    color: colors.success,
    fontFamily: typography.bodyStrong.fontFamily,
  },
  statusUnavailable: {
    color: colors.textTertiary,
  },
  statusMuted: {
    color: colors.textTertiary,
  },
});
