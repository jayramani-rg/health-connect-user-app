import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';
import { getFontSize, getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: getHeight(12),
    paddingVertical: getHeight(10),
  },
  text: {
    fontSize: getFontSize(13),
    fontWeight: '500',
  },
  info: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brand,
  },
  infoText: {
    color: colors.brandStrong,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
  },
  warningText: {
    color: colors.warning,
  },
  error: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  successText: {
    color: colors.success,
  },
});
