import { StyleSheet } from 'react-native';
import { colors, layout, radius, spacing, textRole } from '../../../theme';

export const SCRIM_COLOR = 'rgba(16, 24, 22, 0.52)';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: SCRIM_COLOR,
  },
  scrimPressable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...textRole.sectionTitle,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
  },
  message: {
    ...textRole.body,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.errorSoft,
  },
  errorText: {
    ...textRole.meta,
    flex: 1,
    color: colors.error,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  button: {
    minHeight: layout.touchTarget + 6,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.brand,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    ...textRole.control,
    fontSize: 15,
    lineHeight: 20,
  },
  labelFilled: {
    color: colors.white,
  },
  labelSecondary: {
    color: colors.ink,
  },
  labelGhost: {
    color: colors.brand,
  },
});
