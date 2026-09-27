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
  subtitleBold: {
    color: colors.ink,
    fontFamily: typography.bodyStrong.fontFamily,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    ...typography.label,
    color: colors.primary,
  },
  footer: {
    marginTop: 'auto',
    gap: spacing.sm,
  },
});
