import { StyleSheet } from 'react-native';
import { colors, layout, radius, shadow, spacing, textRole } from '../../../../../theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: layout.blockGap,
    ...shadow.card,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    ...textRole.cardTitle,
    fontSize: 16,
    color: colors.text,
  },
  subtitle: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  location: {
    ...textRole.meta,
    color: colors.textTertiary,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: layout.blockGap,
    borderTopWidth: layout.hairline,
    borderTopColor: colors.border,
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  modeIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    ...textRole.metaStrong,
    color: colors.text,
    flexShrink: 1,
  },
  modeMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  modeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fee: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  change: {
    ...textRole.metaStrong,
    color: colors.brand,
  },
});
