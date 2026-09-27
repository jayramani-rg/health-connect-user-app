import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  surface: {
    backgroundColor: colors.surface,
  },
  sunken: {
    backgroundColor: colors.surfaceSunken,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
