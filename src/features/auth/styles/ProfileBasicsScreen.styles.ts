import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { getFontSize, getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: getFontSize(20),
    fontWeight: '700',
    color: colors.text,
  },
  skipLink: {
    fontSize: getFontSize(13),
    fontWeight: '700',
    color: colors.brand,
  },
  subtitle: {
    fontSize: getFontSize(13),
    color: colors.textTertiary,
  },
  footer: {
    marginTop: 'auto',
    gap: getHeight(8),
  },
});
