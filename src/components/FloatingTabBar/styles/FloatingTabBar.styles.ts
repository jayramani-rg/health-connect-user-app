import { StyleSheet } from 'react-native';
import { colors, fontFamily, shadow, spacing } from '../../../theme';

export const BAR_HEIGHT = 64;
export const INDICATOR_SIZE = 48;
export const BAR_SIDE_INSET = spacing.lg;
export const BAR_BOTTOM_INSET = spacing.sm;
export const TAB_BAR_CLEARANCE = BAR_HEIGHT + BAR_BOTTOM_INSET + spacing.xxxl;
export const INDICATOR_SPRING = { damping: 19, stiffness: 220, mass: 1 };
export const PRESS_SPRING = { damping: 15, stiffness: 400, mass: 1 };

export const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: BAR_SIDE_INSET,
    right: BAR_SIDE_INSET,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: colors.surface,
    ...shadow.floating,
  },
  indicator: {
    position: 'absolute',
    top: (BAR_HEIGHT - INDICATOR_SIZE) / 2,
    left: 0,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: colors.brandSoft,
  },
  item: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.white,
  },
});
