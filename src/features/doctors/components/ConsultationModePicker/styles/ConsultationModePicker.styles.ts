import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, spacing, textRole } from '../../../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileSelected: {
    borderWidth: 1.5,
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  tileDisabled: {
    backgroundColor: colors.canvas,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  tilePressed: {
    opacity: 0.9,
  },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconTileSelected: {
    backgroundColor: colors.brand,
  },
  iconTileDisabled: {
    backgroundColor: colors.surfaceSunken,
  },
  label: {
    ...textRole.metaStrong,
    color: colors.text,
  },
  fee: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
  },
  feeSelected: {
    color: colors.brandStrong,
  },
  duration: {
    ...textRole.badge,
    color: colors.textSecondary,
  },
  textDisabled: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
  },
});
