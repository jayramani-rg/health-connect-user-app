import { StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { getFontSize, getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: getFontSize(typography.stepLabel.fontSize),
    fontWeight: typography.stepLabel.fontWeight,
    letterSpacing: typography.stepLabel.letterSpacing,
    textTransform: typography.stepLabel.textTransform,
    color: colors.textTertiary,
  },
  track: {
    height: getHeight(4),
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
  },
});
