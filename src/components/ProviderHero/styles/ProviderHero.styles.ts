import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, shadow, spacing, textRole } from '../../../theme';

const IMAGE_SIZE = 84;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: layout.blockGap,
    ...shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  frame: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  frameCircle: {
    borderRadius: IMAGE_SIZE / 2,
  },
  frameRounded: {
    borderRadius: radius.lg,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  initial: {
    fontFamily: fontFamily.bold,
    fontSize: 30,
    color: colors.brand,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...textRole.pageTitle,
    fontSize: 19,
    lineHeight: 25,
    color: colors.text,
    flexShrink: 1,
  },
  verified: {
    paddingTop: 1,
  },
  title: {
    ...textRole.metaStrong,
    color: colors.brandStrong,
  },
  subtitle: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  meta: {
    ...textRole.meta,
    color: colors.textTertiary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
  chipBrand: {
    backgroundColor: colors.brandSoft,
  },
  chipWarning: {
    backgroundColor: colors.warningSoft,
  },
  chipText: {
    ...textRole.badge,
    color: colors.textSecondary,
  },
  chipTextBrand: {
    color: colors.brandStrong,
  },
  chipTextWarning: {
    color: '#7A4F10',
  },
});
