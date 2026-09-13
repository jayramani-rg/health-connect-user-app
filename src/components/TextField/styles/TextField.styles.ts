import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';
import { getFontSize, getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: getFontSize(13),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: getHeight(12),
    height: getHeight(48),
    gap: 8,
    backgroundColor: colors.surface,
  },
  fieldRowFocused: {
    borderColor: colors.brand,
  },
  fieldRowError: {
    borderColor: colors.error,
  },
  fieldRowDisabled: {
    opacity: 0.6,
  },
  prefix: {
    fontSize: getFontSize(15),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: getHeight(18),
    backgroundColor: colors.borderStrong,
  },
  input: {
    flex: 1,
    fontSize: getFontSize(15),
    color: colors.text,
    padding: 0,
  },
  errorText: {
    fontSize: getFontSize(12),
    color: colors.error,
  },
  helperText: {
    fontSize: getFontSize(12),
    color: colors.textTertiary,
  },
});
