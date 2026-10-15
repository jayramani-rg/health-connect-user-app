import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../../../theme';

export const PHOTO_SIZE = 64;

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
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photoInitial: {
    ...typography.h2,
    color: colors.brand,
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
  specialty: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  metaText: {
    ...typography.caption,
    color: colors.textTertiary,
    flexShrink: 1,
  },
  metaStrong: {
    ...typography.label,
    color: colors.text,
  },
  nearText: {
    ...typography.label,
    color: colors.brand,
    flexShrink: 1,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.borderStrong,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.successSoft,
  },
  availabilityMuted: {
    backgroundColor: colors.surfaceSunken,
  },
  availabilityWarning: {
    backgroundColor: colors.warningSoft,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  availabilityDotMuted: {
    backgroundColor: colors.textTertiary,
  },
  availabilityDotWarning: {
    backgroundColor: colors.warning,
  },
  availabilityText: {
    ...typography.label,
    color: colors.success,
    flex: 1,
  },
  availabilityTextMuted: {
    color: colors.textSecondary,
  },
  availabilityTextWarning: {
    color: colors.warning,
  },
  modes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  mode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modeText: {
    ...typography.caption,
    color: colors.textSecondary,
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
  feeLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  feeValue: {
    ...typography.subtitle,
    color: colors.text,
  },
  feeMuted: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  action: {
    minHeight: 44,
    minWidth: 104,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionPressed: {
    backgroundColor: colors.brandStrong,
  },
  actionSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  actionSecondaryPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  actionText: {
    ...typography.label,
    fontSize: 14,
    color: colors.white,
  },
  actionTextSecondary: {
    color: colors.text,
  },
  skeletonLines: {
    flex: 1,
    gap: spacing.sm,
  },
});
