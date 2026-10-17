import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, shadow, spacing, textRole } from '../../../theme';

const RAIL_DOT = 10;
const TIMELINE_PAD = spacing.md;
const RAIL_DOT_OFFSET = TIMELINE_PAD + Math.round((textRole.cardTitle.lineHeight - RAIL_DOT) / 2);

export const styles = StyleSheet.create({
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 24,
  },
  groupTitle: {
    ...textRole.control,
    color: colors.text,
    flex: 1,
    minWidth: 0,
  },
  groupMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  groupAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  groupActionPressed: {
    opacity: 0.6,
  },
  groupActionText: {
    ...textRole.metaStrong,
    color: colors.brand,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  rowTitle: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  rowSubtitle: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  metaText: {
    ...textRole.meta,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  statusText: {
    ...textRole.badge,
    flexShrink: 1,
  },
  dateTile: {
    width: 48,
    paddingVertical: spacing.sm,
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
  dateTilePending: {
    backgroundColor: colors.pendingSoft,
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
    fontSize: 18,
    lineHeight: 22,
  },
  dateTileTextDoctor: {
    color: colors.brand,
  },
  dateTileTextLab: {
    color: colors.accentStrong,
  },
  dateTileTextPending: {
    color: colors.pending,
  },
  attentionCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  attentionBody: {
    paddingHorizontal: layout.cardPadding,
    paddingTop: layout.cardPadding,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  attentionText: {
    gap: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  statusPillText: {
    ...textRole.badge,
    flexShrink: 1,
  },
  attentionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
    borderTopWidth: layout.hairline,
    borderTopColor: colors.border,
    backgroundColor: colors.canvas,
  },
  attentionHint: {
    ...textRole.meta,
    color: colors.textSecondary,
    flex: 1,
    minWidth: 0,
  },
  attentionButton: {
    height: undefined,
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.lg,
    flexShrink: 0,
  },
  attentionButtonLabel: {
    ...textRole.control,
    color: colors.white,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: layout.cardPadding,
  },
  timelineRowLive: {
    backgroundColor: colors.brandSoft,
  },
  timeColumn: {
    minWidth: 56,
    paddingTop: TIMELINE_PAD,
    paddingRight: spacing.sm,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  timeClock: {
    ...textRole.cardTitle,
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  timeClockLive: {
    color: colors.brandStrong,
  },
  timePeriod: {
    ...textRole.badge,
    color: colors.textSecondary,
  },
  rail: {
    width: 16,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  railLineTop: {
    width: 2,
    height: RAIL_DOT_OFFSET,
    backgroundColor: colors.border,
  },
  railLineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
  },
  railLineHidden: {
    backgroundColor: 'transparent',
  },
  railDot: {
    width: RAIL_DOT,
    height: RAIL_DOT,
    borderRadius: RAIL_DOT / 2,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  timelineText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
    paddingVertical: TIMELINE_PAD,
  },
  timelineChevron: {
    alignSelf: 'center',
    marginLeft: spacing.sm,
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
    right: 0,
    bottom: 0,
    width: 84,
    height: 84,
  },
});
