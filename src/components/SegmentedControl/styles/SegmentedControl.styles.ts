import { StyleSheet } from 'react-native';
import { colors, radius, shadow, textRole } from '../../../theme';

export const TRACK_PADDING = 4;

export const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.pill,
    padding: TRACK_PADDING,
  },
  thumb: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 8,
  },
  label: {
    ...textRole.control,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  labelActive: {
    color: colors.text,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  badgeActive: {
    backgroundColor: colors.brand,
  },
  badgeText: {
    ...textRole.badge,
    color: colors.textSecondary,
  },
  badgeTextActive: {
    color: colors.white,
  },
});
