import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  heroSpacer: {
    flex: 0.3,
    minHeight: spacing.xxl,
  },
  headline: {
    ...typography.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.white,
    marginTop: spacing.sm,
  },
  subhead: {
    ...typography.body,
    color: 'rgba(255,255,255,0.82)',
    marginTop: spacing.xs,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  legal: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.inkFaint,
  },
});
