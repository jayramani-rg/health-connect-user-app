import { StyleSheet } from 'react-native';
import { radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: {
    ...typography.label,
    fontSize: 12,
  },
});
