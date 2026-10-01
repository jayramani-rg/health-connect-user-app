import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionCardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  optionTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  optionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  slotsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  slotChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  slotChipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  slotText: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  slotTextSelected: {
    color: colors.white,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
  },
  addNewRow: {
    paddingVertical: spacing.sm,
  },
  optionCardMuted: {
    opacity: 0.75,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  defaultPill: {
    ...typography.label,
    fontSize: 10,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  eligibilityChecking: {
    ...typography.caption,
    color: colors.inkFaint,
  },
  eligibilityOk: {
    ...typography.label,
    color: colors.success,
  },
  eligibilityNo: {
    ...typography.label,
    color: colors.error,
  },
  eligibilityWarn: {
    ...typography.label,
    color: colors.warning,
  },
  noAddressCard: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  noAddressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
