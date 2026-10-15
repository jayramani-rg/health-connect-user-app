import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, shadow, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: layout.blockGap,
    ...shadow.card,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.inlineGap,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  eyebrowDotLive: {
    backgroundColor: colors.success,
  },
  eyebrow: {
    ...textRole.metaStrong,
    color: colors.brand,
    flexShrink: 1,
  },
  eyebrowLive: {
    color: colors.success,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
  },
  pressed: {
    opacity: 0.7,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...textRole.sectionTitle,
    color: colors.text,
  },
  heroSubtitle: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.inlineGap,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
  },
  factText: {
    ...textRole.metaStrong,
    color: colors.text,
    flexShrink: 1,
  },
  progress: {
    gap: 6,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressSegmentDone: {
    backgroundColor: colors.brand,
  },
  progressText: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
    minHeight: 64,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: layout.cardPaddingCompact,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconDoctor: {
    backgroundColor: colors.brandSoft,
  },
  iconLab: {
    backgroundColor: colors.accentSoft,
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
  rowMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
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
