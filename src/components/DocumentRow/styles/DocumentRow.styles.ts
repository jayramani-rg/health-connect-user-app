import { StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { getHeight, getWidth } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
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
    backgroundColor: colors.surfaceSunken,
  },
  iconSuccess: {
    backgroundColor: colors.successSoft,
  },
  label: {
    ...typography.body,
    flex: 1,
    color: colors.ink,
  },
  status: {
    ...typography.label,
    color: colors.inkFaint,
  },
  statusSuccess: {
    color: colors.success,
  },
  statusError: {
    color: colors.error,
  },
  statusUploading: {
    color: colors.primary,
  },
});
