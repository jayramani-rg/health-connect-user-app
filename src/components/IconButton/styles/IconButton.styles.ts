import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout } from '../../../theme';

export const styles = StyleSheet.create({
  button: {
    width: layout.iconButton,
    height: layout.iconButton,
    borderRadius: layout.iconButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceSunken,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 12,
    color: colors.white,
  },
});
