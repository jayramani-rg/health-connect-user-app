// features/common/styles/NoInternetScreen.styles.ts
// Sec 10.1 — Style Colocation Principle. Every screen has exactly one
// co-located stylesheet, exported as a named `styles` const via
// StyleSheet.create().

import { StyleSheet } from 'react-native';
import { getHeight, getWidth, getFontSize } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getWidth(24),
  },
  title: {
    fontSize: getFontSize(20),
    fontWeight: '600',
    marginBottom: getHeight(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: getHeight(24),
  },
  retryButton: {
    paddingVertical: getHeight(12),
    paddingHorizontal: getWidth(32),
    borderRadius: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
