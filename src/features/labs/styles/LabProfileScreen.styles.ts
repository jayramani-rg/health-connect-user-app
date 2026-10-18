import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, spacing, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    marginTop: spacing.md,
    marginBottom: -spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionCard: {
    flex: 1,
    gap: 2,
    padding: spacing.md,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionCardOff: {
    backgroundColor: colors.canvas,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  optionTitle: {
    ...textRole.metaStrong,
    color: colors.text,
    marginTop: spacing.xs,
  },
  optionOff: {
    color: colors.textSecondary,
  },
  optionMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  list: {
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: layout.hairline,
    borderTopColor: colors.border,
  },
  rowSelected: {
    backgroundColor: colors.brandSoft,
  },
  rowPressed: {
    opacity: 0.85,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  rowMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  tag: {
    ...textRole.badge,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceSunken,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
  },
  strike: {
    ...textRole.meta,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  hint: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: layout.cardRadius,
    backgroundColor: colors.surfaceSunken,
  },
  chatText: {
    ...textRole.meta,
    color: colors.text,
    flex: 1,
  },
  chatButton: {
    minWidth: 104,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerText: {
    flex: 1,
    minWidth: 0,
  },
  footerTotal: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  footerMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  footerCta: {
    minWidth: 150,
  },
});
