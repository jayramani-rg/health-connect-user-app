import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    ...typography.bodyStrong,
  },
  info: {
    backgroundColor: colors.primarySoft,
  },
  infoText: {
    color: colors.primaryStrong,
  },
  warning: {
    backgroundColor: colors.warningSoft,
  },
  warningText: {
    color: colors.warning,
  },
  error: {
    backgroundColor: colors.errorSoft,
  },
  errorText: {
    color: colors.error,
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  successText: {
    color: colors.success,
  },
});
