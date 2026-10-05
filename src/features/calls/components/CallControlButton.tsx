import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon, type IoniconsIconName } from '../../../components/Icon/Icon';
import { colors, fontFamily, spacing } from '../../../theme';

export interface CallControlButtonProps {
  icon: IoniconsIconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  rotateIcon?: boolean;
}

const BUTTON_SIZE = 60;
const DANGER_SIZE = 68;

export const CallControlButton: React.FC<CallControlButtonProps> = ({ icon, label, onPress, active = false, danger = false, disabled = false, rotateIcon = false }) => {
  const size = danger ? DANGER_SIZE : BUTTON_SIZE;
  const backgroundColor = danger ? colors.error : active ? colors.white : 'rgba(255, 255, 255, 0.16)';
  const iconColor = danger ? colors.white : active ? colors.primaryStrong : colors.white;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active, disabled }}
        activeOpacity={0.8}
        disabled={disabled}
        onPress={onPress}
        style={[styles.button, { width: size, height: size, borderRadius: size / 2, backgroundColor }, disabled && styles.disabled]}
      >
        <Icon name={icon} size={danger ? 30 : 26} color={iconColor} style={rotateIcon ? styles.rotated : undefined} />
      </TouchableOpacity>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 76,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  rotated: {
    transform: [{ rotate: '135deg' }],
  },
  label: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.82)',
  },
});
