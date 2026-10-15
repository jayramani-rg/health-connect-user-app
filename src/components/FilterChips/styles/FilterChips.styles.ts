import { StyleSheet } from 'react-native';
import { colors, layout, radius, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  content: {
    gap: layout.inlineGap,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: layout.chipHeight,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: layout.hairline,
  },
  chipIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  label: {
    ...textRole.control,
  },
  labelIdle: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.white,
  },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countIdle: {
    backgroundColor: colors.surfaceSunken,
  },
  countSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  countText: {
    ...textRole.badge,
  },
  countTextIdle: {
    color: colors.textSecondary,
  },
  countTextSelected: {
    color: colors.white,
  },
});
