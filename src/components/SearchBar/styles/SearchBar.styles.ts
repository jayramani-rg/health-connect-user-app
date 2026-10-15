import { StyleSheet } from 'react-native';
import { colors, layout, radius, typography } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: layout.gutter,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
  input: {
    flex: 1,
    padding: 0,
    ...typography.body,
    color: colors.ink,
  },
});
