import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../../../theme';

export const labCardStyles = StyleSheet.create({
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
