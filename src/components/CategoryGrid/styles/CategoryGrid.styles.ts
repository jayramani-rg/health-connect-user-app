import { StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../../theme';

export const ROUND_AVATAR_SIZE = 42;
export const ROUND_AVATAR_PADDING = 8;
export const ROUND_AVATAR_OUTER = ROUND_AVATAR_SIZE + ROUND_AVATAR_PADDING * 2;
export const COMPACT_COLUMNS = 3;

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  strip: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.lg,
  },
  tile: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
    ...shadow.card,
  },
  stripTile: {
    width: 76,
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactTile: {
    width: `${100 / COMPACT_COLUMNS}%`,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.brandSoft,
  },
  roundAvatar: {
    width: ROUND_AVATAR_OUTER,
    height: ROUND_AVATAR_OUTER,
    borderRadius: ROUND_AVATAR_OUTER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.brandSoft,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  roundAvatarImage: {
    width: ROUND_AVATAR_SIZE,
    height: ROUND_AVATAR_SIZE,
  },
  avatarInitial: {
    ...typography.title,
    color: colors.brand,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  roundName: {
    ...typography.caption,
    color: colors.ink,
    textAlign: 'center',
  },
  compactName: {
    ...typography.caption,
    color: colors.ink,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
});
