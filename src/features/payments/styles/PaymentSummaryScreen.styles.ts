import { StyleSheet } from 'react-native';
import { colors, radius, spacing, textRole, typography } from '../../../theme';

export const styles = StyleSheet.create({
  hold: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    marginBottom: spacing.md,
  },
  holdWarning: {
    backgroundColor: colors.warningSoft,
  },
  holdText: {
    flex: 1,
    gap: 2,
  },
  holdTitle: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  holdBody: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bookingTitle: {
    ...typography.subtitle,
    color: colors.text,
    textTransform: 'capitalize',
  },
  bookingProvider: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.subtitle,
    color: colors.text,
  },
  totalValue: {
    ...typography.title,
    color: colors.brand,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
