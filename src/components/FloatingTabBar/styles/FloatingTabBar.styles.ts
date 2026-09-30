import { StyleSheet } from 'react-native';
import { colors, shadow, spacing } from '../../../theme';

export const BAR_HEIGHT = 64;
export const BAR_SIDE_INSET = spacing.lg;
export const BAR_BOTTOM_INSET = spacing.sm;
export const ITEM_INNER_INSET = 4;
/** How much bottom padding a tab-root screen's scroll content needs so the floating bar never
 * covers its last item. Does not include the safe-area inset, which varies per device and is
 * already applied separately by the screen's own SafeAreaView. */
export const TAB_BAR_CLEARANCE = BAR_HEIGHT + BAR_BOTTOM_INSET + spacing.lg;

export const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: BAR_SIDE_INSET,
    right: BAR_SIDE_INSET,
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: colors.surface,
    ...shadow.floating,
  },
  indicator: {
    position: 'absolute',
    top: ITEM_INNER_INSET,
    bottom: ITEM_INNER_INSET,
    borderRadius: (BAR_HEIGHT - ITEM_INNER_INSET * 2) / 2,
    backgroundColor: colors.primarySoft,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});
