import { StyleSheet } from 'react-native';
import { colors, layout, radius, spacing, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    padding: layout.gutter,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: layout.blockGap,
  },
  headerText: {
    flex: 1,
  },
  labName: {
    ...textRole.pageTitle,
    color: colors.text,
  },
  subtle: {
    ...textRole.meta,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    padding: layout.cardPadding,
    marginBottom: layout.blockGap,
  },
  cardFlush: {
    padding: 0,
  },
  progressHeadline: {
    ...textRole.sectionTitle,
    color: colors.text,
  },
  progressMessage: {
    ...textRole.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  steps: {
    marginTop: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepRail: {
    alignItems: 'center',
    width: 20,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  stepDotCurrent: {
    borderColor: colors.brand,
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  stepLine: {
    flex: 1,
    width: 2,
    minHeight: 14,
    backgroundColor: colors.border,
  },
  stepLineDone: {
    backgroundColor: colors.brand,
  },
  stepBody: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  stepBodyLast: {
    paddingBottom: 0,
  },
  stepLabel: {
    ...textRole.metaStrong,
    color: colors.textTertiary,
  },
  stepLabelActive: {
    color: colors.text,
  },
  stepDetail: {
    ...textRole.meta,
    color: colors.brand,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  infoValue: {
    ...textRole.metaStrong,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    ...textRole.groupLabel,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
    minHeight: layout.rowMinHeight,
  },
  listDivider: {
    borderTopWidth: layout.hairline,
    borderTopColor: colors.border,
  },
  listPressed: {
    backgroundColor: colors.surface2,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBody: {
    flex: 1,
  },
  listTitle: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  listMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  viewChip: {
    ...textRole.badge,
    color: colors.brand,
  },
  testPrice: {
    ...textRole.metaStrong,
    color: colors.textSecondary,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: layout.cardPadding,
  },
  emptyText: {
    ...textRole.meta,
    color: colors.textSecondary,
    flex: 1,
  },
  reasonText: {
    ...textRole.body,
    color: colors.text,
  },
  footer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  spacer: {
    marginBottom: spacing.md,
  },
});
