import { StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  inlineActionText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.inkSoft,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  toggleLabel: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  toggleHint: {
    ...typography.caption,
    color: colors.inkSoft,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
    flex: 1,
  },
  defaultPill: {
    ...typography.label,
    fontSize: 11,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  cardText: {
    ...typography.caption,
    color: colors.inkSoft,
  },
  legacyNote: {
    ...typography.caption,
    color: colors.warning,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  actionText: {
    ...typography.label,
    color: colors.primary,
  },
  actionTextDanger: {
    ...typography.label,
    color: colors.error,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  skeletonStack: {
    gap: spacing.md,
  },
});
