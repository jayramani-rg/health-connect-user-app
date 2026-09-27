import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../Icon/Icon';

interface BackButtonProps {
  onPress: () => void;
  light?: boolean;
}

export function BackButton({ onPress, light }: BackButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, light && styles.buttonLight]} hitSlop={8}>
      <Icon name="chevron-back" size={20} color={light ? colors.white : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLight: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
