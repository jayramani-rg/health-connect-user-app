import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import { getWidth } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  iconCircle: {
    width: getWidth(72),
    height: getWidth(72),
    borderRadius: getWidth(36),
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
    fontSize: getWidth(30),
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
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
