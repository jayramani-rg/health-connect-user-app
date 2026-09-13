import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
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
});
