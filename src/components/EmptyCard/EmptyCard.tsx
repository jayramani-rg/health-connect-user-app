import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../theme';
import { Icon, type IoniconsIconName } from '../Icon/Icon';
import { styles } from './styles/EmptyCard.styles';

export interface EmptyCardProps {
  icon: IoniconsIconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyCard({ icon, title, description, actionLabel, onActionPress }: EmptyCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconTile}>
        <Icon name={icon} size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {actionLabel && onActionPress ? (
          <Pressable
            onPress={onActionPress}
            hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
            accessibilityRole="button"
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default EmptyCard;
