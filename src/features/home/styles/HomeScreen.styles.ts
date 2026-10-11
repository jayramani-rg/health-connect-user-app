import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';
import { TAB_BAR_CLEARANCE } from '../../../components/FloatingTabBar/styles/FloatingTabBar.styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    ...typography.title,
    color: colors.text,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  searchWrap: {
    marginBottom: spacing.xl,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  serviceTile: {
    flex: 1,
    minHeight: 132,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.brandSoft,
  },
  serviceTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    ...typography.subtitle,
    color: colors.brandStrong,
  },
  serviceSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
  },
  categorySkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.lg,
  },
  categorySkeletonTile: {
    width: '25%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  viewAllText: {
    ...typography.label,
    color: colors.brand,
  },
  offlineBanner: {
    position: 'absolute',
    bottom: TAB_BAR_CLEARANCE,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.error,
    color: colors.white,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 12,
  },
});
