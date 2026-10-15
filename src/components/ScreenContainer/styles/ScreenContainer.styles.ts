import { StyleSheet } from 'react-native';
import { colors, layout } from '../../../theme';
import { getHeight, getWidth } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: getWidth(20),
    paddingTop: getHeight(16),
    gap: getHeight(16),
  },
  page: {
    paddingHorizontal: layout.gutter,
    paddingTop: layout.inlineGap,
    gap: layout.blockGap,
  },
  list: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    gap: 0,
  },
  pageBottom: {
    paddingBottom: layout.bottomBreathing,
  },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: getHeight(12),
    paddingBottom: getHeight(12),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
