import { StyleSheet } from 'react-native';
import { COMPACT_COLUMNS } from '../../../components/CategoryGrid/styles/CategoryGrid.styles';
import { colors, layout, radius, spacing, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xs,
    gap: layout.sectionSpacing,
  },
  intro: {
    gap: layout.blockGap,
  },
  localityWrap: {
    marginTop: spacing.xs,
    alignItems: 'flex-start',
  },
  section: {
    gap: spacing.lg,
  },
  careList: {
    gap: layout.sectionGap,
  },
  careGroup: {
    gap: layout.inlineGap,
  },
  attentionStack: {
    gap: layout.blockGap,
  },
  careCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  careDivider: {
    height: layout.hairline,
    backgroundColor: colors.border,
    marginLeft: layout.cardPadding,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: layout.blockGap,
  },
  categorySkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.lg,
  },
  categorySkeletonTile: {
    width: `${100 / COMPACT_COLUMNS}%`,
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: layout.inlineGap,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: layout.hairline,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  viewAllButtonPressed: {
    backgroundColor: colors.brandSoft,
  },
  viewAllText: {
    ...textRole.control,
    fontSize: 15,
    color: colors.brand,
  },
  offlineBanner: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.ink,
    color: colors.white,
    textAlign: 'center',
    paddingVertical: layout.inlineGap,
    ...textRole.metaStrong,
  },
});
