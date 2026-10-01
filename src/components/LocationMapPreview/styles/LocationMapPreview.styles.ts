import { StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayCenter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  placeholderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.caption,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  captionStrip: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  captionText: {
    ...typography.label,
    color: colors.ink,
    flex: 1,
  },
});
