import { StyleSheet } from 'react-native';
import { colors, layout, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.gutter,
    minHeight: layout.headerMinHeight,
    paddingVertical: 4,
  },
  leading: {
    flexShrink: 0,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    ...textRole.eyebrow,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: colors.textSecondary,
  },
  title: {
    ...textRole.pageTitle,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
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
