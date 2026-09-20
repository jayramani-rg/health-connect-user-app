import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../../../theme';

export const styles = StyleSheet.create({
  // A horizontal ScrollView's content container defaults to `alignItems: 'stretch'` on its cross axis
  // (vertical, since flexDirection is row here) — without overriding it, every card stretches to match
  // whichever sibling ends up tallest, so a "No slots" card can end up hundreds of px tall for no reason.
  scroll: {
    flexGrow: 0,
  },
  row: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  card: {
    minWidth: 132,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  cardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  dateLabel: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: 'center',
  },
  dateLabelSelected: {
    color: colors.brandStrong,
  },
  status: {
    ...typography.caption,
    fontSize: 12,
    textAlign: 'center',
  },
  statusAvailable: {
    color: colors.success,
    fontWeight: '600',
  },
  statusUnavailable: {
    color: colors.textTertiary,
  },
  statusMuted: {
    color: colors.textTertiary,
  },
});
