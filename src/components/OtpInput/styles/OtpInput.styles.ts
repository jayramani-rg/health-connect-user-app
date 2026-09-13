import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../../theme';
import { getFontSize, getWidth } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getWidth(10),
  },
  cell: {
    width: getWidth(44),
    height: getWidth(52),
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    textAlign: 'center',
    fontSize: getFontSize(19),
    fontWeight: '700',
    color: colors.text,
  },
  cellActive: {
    borderColor: colors.brand,
    backgroundColor: colors.surface,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  cellError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
    color: colors.error,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: getFontSize(12),
    color: colors.error,
    textAlign: 'center',
  },
});
