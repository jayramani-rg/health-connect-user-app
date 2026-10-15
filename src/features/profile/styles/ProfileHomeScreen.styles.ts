import { StyleSheet } from 'react-native';
import { colors, layout, radius, textRole } from '../../../theme';

export const styles = StyleSheet.create({
  screen: {
    gap: layout.sectionGap,
  },
  top: {
    gap: layout.blockGap,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.blockGap,
    padding: layout.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  avatarWrap: {
    flexShrink: 0,
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    ...textRole.sectionTitle,
    color: colors.text,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phone: {
    ...textRole.meta,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  editButton: {
    flexShrink: 0,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  editText: {
    ...textRole.control,
    color: colors.text,
  },
});
