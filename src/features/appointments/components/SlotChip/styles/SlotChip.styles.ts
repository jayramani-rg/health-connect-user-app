import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, spacing, textRole } from '../../../../../theme';
import type { SlotVisualState } from '../../../utils/slotState';

export const SLOT_HEIGHT = 54;
export const SLOT_GAP = spacing.sm;

interface SlotTone {
  background: string;
  border: string;
  dashed?: boolean;
  time: string;
  caption: string;
  strike?: boolean;
}

export const slotTone: Record<SlotVisualState, SlotTone> = {
  available: { background: colors.surface, border: colors.borderStrong, time: colors.text, caption: colors.textSecondary },
  selected: { background: colors.brand, border: colors.brand, time: colors.white, caption: colors.white },
  reserved: { background: colors.warningSoft, border: '#EAD3A8', time: colors.text, caption: '#8A5A12' },
  booked: { background: colors.surfaceSunken, border: colors.surfaceSunken, time: colors.textSecondary, caption: colors.textSecondary, strike: true },
  unavailable: { background: colors.canvas, border: colors.borderStrong, dashed: true, time: colors.textSecondary, caption: colors.textSecondary },
  held: { background: colors.brandSoft, border: colors.brand, time: colors.brandStrong, caption: colors.brandStrong },
  waiting: { background: colors.pendingSoft, border: colors.pending, time: '#4C3A9C', caption: '#4C3A9C' },
  processing: { background: colors.brand, border: colors.brand, time: colors.white, caption: colors.white },
};

export const styles = StyleSheet.create({
  chip: {
    height: SLOT_HEIGHT,
    borderRadius: radius.md,
    borderWidth: layout.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  chipEmphasis: {
    borderWidth: 1.5,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  time: {
    ...textRole.control,
    fontSize: 15,
    lineHeight: 20,
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SLOT_GAP,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
    rowGap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: layout.hairline,
  },
  legendLabel: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
});
