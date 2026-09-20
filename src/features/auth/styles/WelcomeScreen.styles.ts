import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { getFontSize, getHeight, getWidth } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: getWidth(24),
    paddingTop: getHeight(64),
    paddingBottom: getHeight(32),
  },
  hero: {
    gap: getHeight(14),
  },
  wordmark: {
    fontSize: getFontSize(28),
    fontWeight: '700',
    color: colors.white,
  },
  headline: {
    fontSize: getFontSize(22),
    fontWeight: '700',
    color: colors.white,
    lineHeight: getFontSize(28),
  },
  subhead: {
    fontSize: getFontSize(14),
    color: 'rgba(255,255,255,0.85)',
    lineHeight: getFontSize(20),
  },
  actions: {
    gap: getHeight(10),
  },
  legal: {
    textAlign: 'center',
    fontSize: getFontSize(11),
    color: 'rgba(255,255,255,0.75)',
  },
});
