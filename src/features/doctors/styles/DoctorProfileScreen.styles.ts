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
  avatarInitial: {
    ...typography.h1,
    color: colors.brand,
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  specialization: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 21,
  },
  qualificationRow: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  modeCardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  modeName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  modeDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modeFee: {
    ...typography.bodyStrong,
    color: colors.brand,
  },
  policyText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  chatButton: {
    marginTop: 0,
  },
});
