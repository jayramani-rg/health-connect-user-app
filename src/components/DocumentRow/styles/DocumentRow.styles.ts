import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';
import { getFontSize, getHeight, getWidth } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: getHeight(12),
    paddingVertical: getHeight(10),
    backgroundColor: colors.surface,
  },
  rowSuccess: {
    borderColor: colors.success,
  },
  rowError: {
    borderColor: colors.error,
  },
  icon: {
    width: getWidth(28),
    height: getWidth(28),
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
  },
  iconSuccess: {
    backgroundColor: colors.successSoft,
  },
  label: {
    flex: 1,
    fontSize: getFontSize(14),
    fontWeight: '500',
    color: colors.text,
  },
  status: {
    fontSize: getFontSize(13),
    fontWeight: '600',
    color: colors.textTertiary,
  },
  statusSuccess: {
    color: colors.success,
  },
  statusError: {
    color: colors.error,
  },
  statusUploading: {
    color: colors.brand,
  },
});
