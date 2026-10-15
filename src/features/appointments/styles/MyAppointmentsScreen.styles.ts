import { StyleSheet } from 'react-native';
import { colors, layout } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: layout.gutter,
    paddingTop: layout.inlineGap,
  },
  skeleton: {
    gap: layout.blockGap,
  },
});
