import { StyleSheet } from 'react-native';
import { layout } from '../../../theme';

export const listScreenStyles = StyleSheet.create({
  header: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.inlineGap,
    paddingBottom: layout.inlineGap,
    gap: layout.inlineGap,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: layout.gutter,
    paddingTop: layout.inlineGap,
    paddingBottom: layout.bottomBreathing,
  },
});
