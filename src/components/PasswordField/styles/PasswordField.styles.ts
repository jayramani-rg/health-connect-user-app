import { StyleSheet } from 'react-native';
import { colors, typography } from '../../../theme';

export const styles = StyleSheet.create({
  toggle: {
    ...typography.label,
    color: colors.primary,
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
    fontFamily: typography.bodyStrong.fontFamily,
  },
  ruleMarkUnmet: {
    color: colors.inkFaint,
  },
  ruleTextMet: {
    ...typography.caption,
    color: colors.ink,
  },
  ruleTextUnmet: {
    ...typography.caption,
    color: colors.inkFaint,
  },
});
