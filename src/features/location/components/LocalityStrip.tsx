import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../../../components/Icon/Icon';
import { colors, radius, spacing, typography } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';

interface LocalityStripProps {
  label: string | null;
  noun: string;
  onPress: () => void;
}

export function LocalityStrip({ label, noun, onPress }: LocalityStripProps) {
  return (
    <TouchableOpacity activeOpacity={activeopacity} style={[styles.strip, !label && styles.stripMuted]} onPress={onPress}>
      <Icon name={label ? 'navigate' : 'navigate-outline'} size={14} color={label ? colors.primary : colors.inkSoft} />
      <View style={styles.textWrap}>
        {label ? (
          <Text style={styles.text} numberOfLines={1}>
            Showing {noun} near <Text style={styles.strong}>{label}</Text> first
          </Text>
        ) : (
          <Text style={styles.textMuted} numberOfLines={1}>
            Set your location to see {noun} near you first
          </Text>
        )}
      </View>
      <Text style={styles.action}>{label ? 'Change' : 'Set'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  stripMuted: {
    backgroundColor: colors.surfaceSunken,
  },
  textWrap: {
    flex: 1,
  },
  text: {
    ...typography.caption,
    color: colors.primaryStrong,
  },
  strong: {
    fontFamily: typography.label.fontFamily,
  },
  textMuted: {
    ...typography.caption,
    color: colors.inkSoft,
  },
  action: {
    ...typography.label,
    color: colors.primary,
  },
});
