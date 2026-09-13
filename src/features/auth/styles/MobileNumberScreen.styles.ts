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
  helper: {
    fontSize: getFontSize(11),
    color: colors.textTertiary,
  },
  footer: {
    marginTop: 'auto',
    gap: getHeight(8),
  },
});
