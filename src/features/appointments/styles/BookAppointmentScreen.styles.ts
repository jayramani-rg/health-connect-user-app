import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  headerAvatarInitial: {
    ...typography.bodyStrong,
    color: colors.white,
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerName: {
    ...typography.title,
    color: colors.white,
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
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
  modeCard: {
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
  modeCardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  modeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modeName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  modeDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modeFee: {
    ...typography.bodyStrong,
    color: colors.brand,
  },
  slotsHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slotsHeadingIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotsHeading: {
    ...typography.h2,
    color: colors.text,
  },
  selectedDateHeading: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  slotGroup: {
    marginBottom: spacing.lg,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  groupLabel: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  groupCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  slotsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotChip: {
    minWidth: 84,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  slotChipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  slotText: {
    ...typography.bodyStrong,
    color: colors.brand,
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
  },
  retryLink: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  retryLinkText: {
    ...typography.bodyStrong,
    color: colors.brand,
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
});
