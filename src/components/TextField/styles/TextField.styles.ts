import { StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    ...typography.label,
    color: colors.inkSoft,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: getHeight(14),
    height: getHeight(52),
    gap: 8,
    backgroundColor: colors.surface,
  },
  fieldRowFocused: {
    borderColor: colors.primary,
  },
  fieldRowError: {
    borderColor: colors.error,
  },
  fieldRowDisabled: {
    opacity: 0.6,
  },
  prefix: {
    ...typography.bodyStrong,
    color: colors.inkSoft,
  },
  divider: {
    width: 1,
    height: getHeight(18),
    backgroundColor: colors.borderStrong,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.ink,
    padding: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  helperText: {
    ...typography.caption,
    color: colors.inkFaint,
  },
});
