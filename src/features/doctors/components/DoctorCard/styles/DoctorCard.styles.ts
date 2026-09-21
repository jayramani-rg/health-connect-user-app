import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../../../theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  specialization: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  metaChip: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.brandStrong,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  fee: {
    ...typography.bodyStrong,
    color: colors.brand,
  },
  pausedText: {
    ...typography.caption,
    color: colors.error,
  },
});
