import { StyleSheet } from 'react-native';
import { colors, layout, radius, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  groupTitle: {
    ...textRole.groupLabel,
    color: colors.textTertiary,
    marginBottom: layout.inlineGap,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: layout.hairline,
    backgroundColor: colors.border,
    marginLeft: layout.cardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
    minHeight: layout.rowMinHeight,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: 10,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconTileDanger: {
    backgroundColor: colors.errorSoft,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  rowTitleDanger: {
    color: colors.error,
  },
  rowSubtitle: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  rowValue: {
    ...textRole.meta,
    color: colors.textSecondary,
    maxWidth: '45%',
    flexShrink: 1,
  },
  detailRow: {
    paddingHorizontal: layout.cardPadding,
    paddingVertical: layout.cardPaddingCompact,
    gap: 2,
  },
  detailLabel: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  detailValue: {
    ...textRole.body,
    color: colors.text,
  },
});
