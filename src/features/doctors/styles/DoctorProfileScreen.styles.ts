import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, spacing, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    marginTop: spacing.md,
    marginBottom: -spacing.xs,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  availabilityText: {
    ...textRole.meta,
    color: colors.textSecondary,
    flex: 1,
  },
  availabilityOpen: {
    color: colors.success,
    fontFamily: fontFamily.semiBold,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: layout.cardPadding,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  infoCardActive: {
    borderColor: colors.brand,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  infoTitle: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  infoBody: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  body: {
    ...textRole.body,
    color: colors.text,
  },
  bodyMuted: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  link: {
    ...textRole.metaStrong,
    color: colors.brand,
  },
  list: {
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: layout.cardPadding,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  listRowDivider: {
    borderTopWidth: layout.hairline,
    borderTopColor: colors.border,
  },
  listTitle: {
    ...textRole.metaStrong,
    color: colors.text,
  },
  listMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: layout.cardRadius,
    backgroundColor: colors.surfaceSunken,
  },
  chatText: {
    ...textRole.meta,
    color: colors.text,
    flex: 1,
  },
  chatButton: {
    minWidth: 104,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerText: {
    flex: 1,
    minWidth: 0,
  },
  footerFee: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  footerMeta: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  footerCta: {
    minWidth: 170,
  },
});
