import { StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  currentCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  currentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overline: {
    ...typography.overline,
    color: colors.inkFaint,
  },
  currentLabel: {
    ...typography.title,
    color: colors.ink,
    marginTop: 2,
  },
  currentHint: {
    ...typography.caption,
    color: colors.inkSoft,
    marginTop: 2,
  },
  privacyNote: {
    ...typography.caption,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.inkSoft,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  addressRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  addressLabel: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  addressLine: {
    ...typography.caption,
    color: colors.inkSoft,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  linkText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  // Home soft-prompt card
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
    ...shadow.card,
  },
  promptRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  promptTitle: {
    ...typography.subtitle,
    color: colors.ink,
  },
  promptText: {
    ...typography.caption,
    color: colors.inkSoft,
    marginTop: 2,
  },
  promptActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // Home locality chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  chipText: {
    ...typography.label,
    color: colors.ink,
    maxWidth: 240,
  },
  chipTextMuted: {
    ...typography.label,
    color: colors.inkSoft,
  },
  flex1: {
    flex: 1,
  },
  skeletonStack: {
    gap: spacing.sm,
  },
});
