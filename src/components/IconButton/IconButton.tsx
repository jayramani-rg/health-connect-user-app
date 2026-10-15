import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../theme';
import { Icon, type IoniconsIconName } from '../Icon/Icon';
import { styles } from './styles/IconButton.styles';

export interface IconButtonProps {
  icon: IoniconsIconName;
  accessibilityLabel: string;
  onPress: () => void;
  badge?: number;
  variant?: 'outline' | 'plain';
}

export function IconButton({ icon, accessibilityLabel, onPress, badge = 0, variant = 'outline' }: IconButtonProps) {
  const hasBadge = badge > 0;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={2}
      accessibilityRole="button"
      accessibilityLabel={hasBadge ? `${accessibilityLabel}, ${badge} unread` : accessibilityLabel}
      style={({ pressed }) => [styles.button, variant === 'outline' && styles.outline, pressed && styles.pressed]}
    >
      <Icon name={icon} size={22} color={colors.text} />
      {hasBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} allowFontScaling={false}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default IconButton;
