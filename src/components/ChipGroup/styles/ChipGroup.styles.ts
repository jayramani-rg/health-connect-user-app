import { StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    ...typography.label,
    color: colors.inkSoft,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: getHeight(16),
    paddingVertical: getHeight(9),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: {
    ...typography.label,
    color: colors.inkSoft,
  },
  chipTextSelected: {
    color: colors.primaryStrong,
  },
});
