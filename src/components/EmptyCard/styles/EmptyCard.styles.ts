import { StyleSheet } from 'react-native';
import { colors, layout, radius, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.blockGap,
    padding: layout.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  iconTile: {
    width: layout.iconTile,
    height: layout.iconTile,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  description: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: layout.inlineGap,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionText: {
    ...textRole.metaStrong,
    color: colors.brand,
  },
});
