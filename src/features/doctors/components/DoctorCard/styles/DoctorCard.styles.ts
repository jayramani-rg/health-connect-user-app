import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../../../theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  specialization: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  metaChip: {
    ...typography.label,
    fontSize: 11,
    color: colors.primaryStrong,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  fee: {
    ...typography.bodyStrong,
    color: colors.brand,
  },
  pausedText: {
    ...typography.caption,
    color: colors.error,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameFlex: {
    flexShrink: 1,
  },
  nearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  nearBadgeCity: {
    backgroundColor: colors.primarySoft,
  },
  nearBadgeText: {
    ...typography.label,
    fontSize: 10,
    lineHeight: 13,
    color: colors.white,
  },
  nearBadgeTextCity: {
    color: colors.primary,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
    marginLeft: spacing.sm,
  },
  areaText: {
    ...typography.caption,
    color: colors.inkSoft,
    flexShrink: 1,
  },
});
