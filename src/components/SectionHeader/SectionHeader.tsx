import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../Icon/Icon';
import { styles } from './styles/SectionHeader.styles';

export interface SectionHeaderProps {
  title: string;
  meta?: string;
  size?: 'default' | 'large';
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, meta, size = 'default', actionLabel, onActionPress, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.title, size === 'large' && styles.titleLarge]} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Icon name="chevron-forward" size={14} color={colors.brand} />
        </Pressable>
      ) : meta ? (
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
    </View>
  );
}

export default SectionHeader;
