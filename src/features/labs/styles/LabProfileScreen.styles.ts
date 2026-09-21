import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  address: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  operatingHours: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  serviceCardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  serviceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  servicePrice: {
    ...typography.bodyStrong,
    color: colors.brand,
  },
  serviceStrikePrice: {
    ...typography.caption,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface2,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  categoryPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
});
