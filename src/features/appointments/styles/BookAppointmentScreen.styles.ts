import { StyleSheet } from 'react-native';
import { colors, layout, radius, spacing, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    backgroundColor: colors.canvas,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: layout.headerMinHeight,
    paddingHorizontal: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    ...textRole.sectionTitle,
    fontSize: 17,
    color: colors.text,
  },
  headerMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 3,
    marginHorizontal: layout.gutter,
    marginTop: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
  },
  progressHalf: {
    width: '50%',
  },
  progressFull: {
    width: '100%',
  },
  loadingBody: {
    padding: layout.gutter,
    gap: layout.sectionGap,
  },
  sectionTight: {
    marginTop: spacing.sm,
    marginBottom: -spacing.xs,
  },
  modeList: {
    gap: spacing.sm,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 68,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeCardSelected: {
    borderColor: colors.brand,
    borderWidth: 1.5,
    backgroundColor: colors.brandSoft,
  },
  modeCardPressed: {
    opacity: 0.9,
  },
  modeIcon: {
    width: layout.iconTile,
    height: layout.iconTile,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIconSelected: {
    backgroundColor: colors.brand,
  },
  modeText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  modeName: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  modeDetail: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  modeFee: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.brand,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 2,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.warningSoft,
  },
  noticeText: {
    ...textRole.meta,
    color: '#7A4F10',
    flex: 1,
  },
  groups: {
    gap: layout.sectionGap,
  },
  group: {
    gap: spacing.sm + 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  groupLabel: {
    ...textRole.metaStrong,
    color: colors.text,
  },
  groupMeta: {
    ...textRole.meta,
    color: colors.textTertiary,
    marginLeft: 'auto',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  nextOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    minHeight: layout.touchTarget,
  },
  nextOpenText: {
    ...textRole.metaStrong,
    color: colors.brand,
  },
  addNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    alignSelf: 'flex-start',
    minHeight: layout.touchTarget,
    marginTop: spacing.xs,
  },
  addNoteText: {
    ...textRole.metaStrong,
    color: colors.brand,
  },
});
