import { StyleSheet } from 'react-native';
import { colors, layout, radius, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: 4,
    gap: layout.blockGap,
  },
  localityWrap: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  section: {
    gap: layout.blockGap,
    marginTop: layout.inlineGap,
  },
  specializationSection: {
    marginBottom: layout.inlineGap,
  },
  block: {
    gap: layout.inlineGap,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: layout.blockGap,
  },
  categorySkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: layout.inlineGap,
  },
  categorySkeletonTile: {
    width: '25%',
    alignItems: 'center',
    gap: layout.inlineGap,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: layout.inlineGap,
    height: 48,
    marginTop: 4,
    borderRadius: radius.md,
    borderWidth: layout.hairline,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  viewAllButtonPressed: {
    backgroundColor: colors.brandSoft,
  },
  viewAllText: {
    ...textRole.control,
    fontSize: 15,
    color: colors.brand,
  },
  offlineBanner: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.ink,
    color: colors.white,
    textAlign: 'center',
    paddingVertical: layout.inlineGap,
    ...textRole.metaStrong,
  },
});
