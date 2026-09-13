import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { getFontSize, getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  backText: {
    fontSize: getFontSize(20),
    color: colors.textSecondary,
  },
  title: {
    fontSize: getFontSize(20),
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: getFontSize(13),
    color: colors.textTertiary,
  },
  link: {
    fontWeight: '700',
    color: colors.brand,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: getFontSize(12),
    color: colors.textTertiary,
  },
  resendLink: {
    fontSize: getFontSize(12),
    fontWeight: '700',
    color: colors.brand,
  },
  footer: {
    marginTop: 'auto',
    gap: getHeight(8),
  },
});
