import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.ink,
    marginTop: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    color: colors.inkFaint,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  helper: {
    ...typography.caption,
    color: colors.inkFaint,
  },
  footer: {
    marginTop: 'auto',
    gap: spacing.sm,
  },
});
