import { StyleSheet } from 'react-native';
import { colors, layout, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
    minHeight: layout.headerMinHeight,
  },
  leading: {
    flexShrink: 0,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...textRole.eyebrow,
    color: colors.textSecondary,
  },
  title: {
    ...textRole.pageTitle,
    color: colors.text,
  },
  subtitle: {
    ...textRole.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.inlineGap,
    flexShrink: 0,
  },
});
