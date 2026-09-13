import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';
import { getFontSize, getHeight } from '../../../utils/helpers';

export const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: getFontSize(13),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: getHeight(14),
    paddingVertical: getHeight(8),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  chipText: {
    fontSize: getFontSize(13),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.brandStrong,
  },
});
