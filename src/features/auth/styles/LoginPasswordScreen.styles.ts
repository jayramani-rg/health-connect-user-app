import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { getFontSize, getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  title: {
    fontSize: getFontSize(20),
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: getFontSize(13),
    color: colors.textTertiary,
  },
  subtitleBold: {
    color: colors.text,
    fontWeight: '700',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    fontSize: getFontSize(12),
    fontWeight: '700',
    color: colors.brand,
  },
  footer: {
    marginTop: 'auto',
    gap: getHeight(8),
  },
});
