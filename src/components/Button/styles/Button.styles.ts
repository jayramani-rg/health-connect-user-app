import { StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    height: getHeight(52),
    paddingHorizontal: getHeight(20),
    gap: 8,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
  tertiary: {
    backgroundColor: colors.surfaceSunken,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.errorSoft,
  },
  disabled: {
    opacity: 0.5,
  },
  labelPrimary: {
    ...typography.bodyStrong,
    color: colors.white,
  },
  labelSecondary: {
    ...typography.bodyStrong,
    color: colors.primaryStrong,
  },
  labelTertiary: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  labelGhost: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  labelDestructive: {
    ...typography.bodyStrong,
    color: colors.error,
  },
});
