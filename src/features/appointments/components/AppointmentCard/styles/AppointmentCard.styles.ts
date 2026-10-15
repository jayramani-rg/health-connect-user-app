import { StyleSheet } from 'react-native';
import { colors, layout, textRole } from '../../../../../theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: layout.blockGap,
    marginBottom: layout.blockGap,
  },
  cardPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
  },
  identity: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  subtitle: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: layout.gutter,
    rowGap: 6,
    paddingTop: layout.blockGap,
    borderTopWidth: layout.hairline,
    borderTopColor: colors.border,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  factText: {
    ...textRole.metaStrong,
    color: colors.text,
    flexShrink: 1,
  },
});
