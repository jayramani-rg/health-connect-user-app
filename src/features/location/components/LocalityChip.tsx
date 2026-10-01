import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../../components/Icon/Icon';
import { colors } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { styles } from '../styles/Location.styles';

/** "📍 Prahlad Nagar, Ahmedabad ▾" under the Home greeting — tap to change. */
export function LocalityChip({ label, onPress }: { label: string | null; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.chip} onPress={onPress} accessibilityRole="button" accessibilityLabel="Change your area">
      <Icon name={label ? 'location' : 'location-outline'} size={14} color={label ? colors.primary : colors.inkSoft} />
      <Text style={label ? styles.chipText : styles.chipTextMuted} numberOfLines={1}>
        {label ?? 'Set your location'}
      </Text>
      <Icon name="chevron-down" size={14} color={colors.inkSoft} />
    </TouchableOpacity>
  );
}
