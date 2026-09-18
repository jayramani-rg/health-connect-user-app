import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme';
import { styles } from './styles/Avatar.styles';
import type { AvatarProps } from './types/Avatar.types';

export function Avatar({ name, size = 44, variant = 'brand' }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const backgroundColor = variant === 'brand' ? colors.brandSoft : colors.surface2;
  const color = variant === 'brand' ? colors.brand : colors.textSecondary;

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.initial, { fontSize: size * 0.4, color }]}>{initial}</Text>
    </View>
  );
}

export type { AvatarProps };
