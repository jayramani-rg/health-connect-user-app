import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { getFontSize, getWidth } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: getWidth(24),
  },
  iconCircle: {
    width: getWidth(64),
    height: getWidth(64),
    borderRadius: getWidth(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSuccess: {
    backgroundColor: colors.successSoft,
  },
  iconCirclePending: {
    backgroundColor: colors.pendingSoft,
  },
  iconCircleError: {
    backgroundColor: colors.errorSoft,
  },
  iconText: {
    fontSize: getFontSize(28),
  },
  iconTextSuccess: {
    color: colors.success,
  },
  iconTextPending: {
    color: colors.pending,
  },
  iconTextError: {
    color: colors.error,
  },
  title: {
    fontSize: getFontSize(20),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: getFontSize(14),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
});
