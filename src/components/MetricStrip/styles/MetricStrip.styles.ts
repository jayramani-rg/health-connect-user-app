import { StyleSheet } from 'react-native';
import { colors, layout, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    minWidth: 0,
    paddingVertical: layout.cardPaddingCompact,
    paddingHorizontal: layout.cardPaddingCompact,
    gap: 2,
  },
  cellPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  divider: {
    width: layout.hairline,
    marginVertical: layout.cardPaddingCompact,
    backgroundColor: colors.border,
  },
  value: {
    ...textRole.metric,
    color: colors.text,
  },
  label: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
});
