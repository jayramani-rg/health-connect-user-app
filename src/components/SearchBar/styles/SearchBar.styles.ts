import { StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: getHeight(52),
    paddingHorizontal: getHeight(16),
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
