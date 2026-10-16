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
  inputWrap: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    padding: 0,
    ...typography.body,
    color: colors.ink,
  },
  hintRow: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  hintText: {
    ...typography.body,
    color: colors.inkFaint,
  },
  hintLabel: {
    flexShrink: 1,
  },
});
