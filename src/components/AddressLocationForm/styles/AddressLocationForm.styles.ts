import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  candidates: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  candidatesTitle: {
    ...typography.overline,
    color: colors.inkFaint,
    marginBottom: spacing.xs,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  candidateRowSelected: {
    backgroundColor: colors.primarySoft,
  },
  candidateText: {
    ...typography.caption,
    color: colors.ink,
    flex: 1,
  },
  resolvedCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  resolvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  verifiedText: {
    ...typography.label,
    fontSize: 11,
    color: colors.success,
  },
  googleAddress: {
    ...typography.body,
    color: colors.ink,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  readOnlyField: {
    flex: 1,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
    justifyContent: 'center',
  },
  manualField: {
    flex: 1,
  },
  readOnlyLabel: {
    ...typography.overline,
    color: colors.inkFaint,
    marginBottom: 2,
  },
  readOnlyValue: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  readOnlyValueEmpty: {
    color: colors.inkFaint,
    fontStyle: 'italic',
  },
  note: {
    ...typography.caption,
    color: colors.warning,
  },
  footnote: {
    ...typography.caption,
    color: colors.inkFaint,
  },
});
