import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { getFontSize } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  toggle: {
    fontSize: getFontSize(13),
    fontWeight: '600',
    color: colors.brand,
  },
  checklist: {
    marginTop: 8,
    gap: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleMarkMet: {
    color: colors.success,
    fontWeight: '700',
  },
  ruleMarkUnmet: {
    color: colors.textTertiary,
  },
  ruleTextMet: {
    fontSize: getFontSize(12),
    color: colors.text,
  },
  ruleTextUnmet: {
    fontSize: getFontSize(12),
    color: colors.textTertiary,
  },
});
