import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
  },
  skipLink: {
    ...typography.label,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.inkFaint,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  footer: {
    marginTop: 'auto',
    gap: spacing.sm,
  },
});
