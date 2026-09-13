import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';
import { getFontSize, getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    height: getHeight(48),
    paddingHorizontal: getHeight(20),
    gap: 8,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.brand,
  },
  secondary: {
    backgroundColor: colors.surface2,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  labelPrimary: {
    color: colors.white,
    fontSize: getFontSize(15),
    fontWeight: '600',
  },
  labelSecondary: {
    color: colors.text,
    fontSize: getFontSize(15),
    fontWeight: '600',
  },
  labelGhost: {
    color: colors.brand,
    fontSize: getFontSize(15),
    fontWeight: '600',
  },
});
