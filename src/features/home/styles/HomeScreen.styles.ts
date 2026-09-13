// features/home/styles/HomeScreen.styles.ts
import { StyleSheet } from 'react-native';
import { getHeight, getFontSize } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  banner: {
    width: '100%',
    height: getHeight(160),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: getHeight(40),
    fontSize: getFontSize(14),
    color: '#6B7280',
  },
  offlineBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#D92D20',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: getHeight(6),
    fontSize: getFontSize(12),
  },
});
