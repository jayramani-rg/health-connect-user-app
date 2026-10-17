import { StyleSheet } from 'react-native';
import { colors, fontFamily, layout, radius, spacing, textRole } from '../../../../../theme';

export const styles = StyleSheet.create({
  container: {
    gap: layout.blockGap,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  cta: {
    minWidth: 132,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  statusText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  titleMuted: {
    ...textRole.cardTitle,
    color: colors.textSecondary,
  },
  body: {
    ...textRole.meta,
    color: colors.textSecondary,
  },
  bodyWarning: {
    color: colors.warning,
    fontFamily: fontFamily.semiBold,
  },
  positionBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.pendingSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadgeNext: {
    backgroundColor: colors.pending,
  },
  positionText: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.pending,
  },
  positionTextNext: {
    color: colors.white,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeSuccess: {
    backgroundColor: colors.brandSoft,
  },
  iconBadgeWarning: {
    backgroundColor: colors.warningSoft,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 2,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.errorSoft,
  },
  errorText: {
    ...textRole.meta,
    color: '#A8322B',
    flex: 1,
  },
});
