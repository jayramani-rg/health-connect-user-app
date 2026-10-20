import { StyleSheet } from 'react-native';
import { colors, layout, radius, spacing, textRole, typography } from '../../../theme';

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
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
    padding: layout.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  contextIcon: {
    width: layout.iconTile,
    height: layout.iconTile,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandSoft,
  },
  contextText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  contextTitle: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  contextMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  sectionTight: {
    marginTop: spacing.sm,
    marginBottom: -spacing.xs,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 2,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.warningSoft,
  },
  noticeText: {
    ...textRole.meta,
    color: '#7A4F10',
    flex: 1,
  },
  groups: {
    gap: layout.sectionGap,
  },
  group: {
    gap: spacing.sm + 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  groupLabel: {
    ...textRole.metaStrong,
    color: colors.text,
  },
  groupMeta: {
    ...textRole.meta,
    color: colors.textTertiary,
    marginLeft: 'auto',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  nextOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    minHeight: layout.touchTarget,
  },
  nextOpenText: {
    ...textRole.metaStrong,
    color: colors.brand,
  },
  slotFooter: {
    gap: layout.blockGap,
  },
  slotSummary: {
    gap: 2,
  },
  slotSummaryTitle: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  slotSummaryTitleMuted: {
    ...textRole.cardTitle,
    color: colors.textSecondary,
  },
  slotSummaryMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
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
    flexDirection: 'row',
    gap: spacing.md,
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
