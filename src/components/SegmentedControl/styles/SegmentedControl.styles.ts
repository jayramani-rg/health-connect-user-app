import { StyleSheet } from 'react-native';
import { colors, radius, shadow, typography } from '../../../theme';

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
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  label: {
    ...typography.label,
    color: colors.inkSoft,
  },
  labelActive: {
    color: colors.primaryStrong,
  },
});
