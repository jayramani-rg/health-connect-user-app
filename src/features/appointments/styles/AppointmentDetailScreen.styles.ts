import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  doctorName: {
    ...typography.h2,
    color: colors.text,
  },
  specialization: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodyStrong,
    color: colors.text,
    maxWidth: '65%',
    textAlign: 'right',
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  reasonText: {
    ...typography.body,
    color: colors.text,
  },
  historyRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  historyAction: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  historyMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  rescheduleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
