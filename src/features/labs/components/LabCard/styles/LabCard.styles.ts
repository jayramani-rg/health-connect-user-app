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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
  },
  meta: {
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
  servesChip: {
    ...typography.label,
    fontSize: 11,
    color: colors.success,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  pausedText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
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
});
