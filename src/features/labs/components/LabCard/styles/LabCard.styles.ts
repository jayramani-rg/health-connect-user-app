import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../../../theme';

export const LOGO_SIZE = 56;

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  cardPressed: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.canvas,
  },
  top: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
    flexShrink: 1,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  areaText: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  nearText: {
    ...typography.label,
    color: colors.brand,
  },
  serviceText: {
    ...typography.caption,
    color: colors.textTertiary,
    flexShrink: 1,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.canvas,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 2,
    minWidth: 0,
  },
  optionOff: {
    backgroundColor: colors.surface,
    borderStyle: 'dashed',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  optionTitle: {
    ...typography.label,
    color: colors.text,
    flexShrink: 1,
  },
  optionTitleOff: {
    color: colors.textTertiary,
  },
  optionDetail: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  optionDetailGood: {
    color: colors.success,
  },
  optionDetailWarn: {
    color: colors.warning,
  },
  optionDetailOff: {
    color: colors.textTertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  priceValue: {
    ...typography.subtitle,
    color: colors.text,
  },
  pausedText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  action: {
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: {
    backgroundColor: colors.brandSoft,
  },
  actionText: {
    ...typography.label,
    fontSize: 14,
    color: colors.brand,
  },
  skeletonLines: {
    flex: 1,
    gap: spacing.sm,
  },
});
