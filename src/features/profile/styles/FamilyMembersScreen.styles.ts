import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardBody: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
  },
});
