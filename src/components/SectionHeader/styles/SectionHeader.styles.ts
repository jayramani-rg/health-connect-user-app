import { StyleSheet } from 'react-native';
import { colors, layout, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
    minHeight: 24,
  },
  title: {
    ...textRole.sectionTitle,
    color: colors.text,
    flex: 1,
    minWidth: 0,
  },
  meta: {
    ...textRole.meta,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionText: {
    ...textRole.metaStrong,
    color: colors.brand,
  },
});
