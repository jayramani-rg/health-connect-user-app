import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: layout.cardPaddingCompact,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  dateTile: {
    width: 48,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dateTileDoctor: {
    backgroundColor: colors.brandSoft,
  },
  dateTileLab: {
    backgroundColor: colors.accentSoft,
  },
  dateTileLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dateTileDay: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    lineHeight: 23,
  },
  dateTileTextDoctor: {
    color: colors.brand,
  },
  dateTileTextLab: {
    color: colors.accentStrong,
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
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  rowMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  rowMetaLate: {
    color: colors.warning,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...textRole.badge,
    flexShrink: 0,
  },
  rowDetail: {
    ...textRole.badge,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  rowDetailLate: {
    fontFamily: fontFamily.semiBold,
    color: colors.warning,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    height: 136,
    padding: layout.cardPadding,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  tileDoctor: {
    backgroundColor: colors.brandSoft,
  },
  tileLab: {
    backgroundColor: colors.accentSoft,
  },
  tilePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  tileTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
    maxWidth: '78%',
  },
  tileArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileArrowDoctor: {
    backgroundColor: colors.brand,
  },
  tileArrowLab: {
    backgroundColor: colors.accentStrong,
  },
  tileArt: {
    position: 'absolute',
    right: -6,
    bottom: -8,
    width: 92,
    height: 92,
  },
});
