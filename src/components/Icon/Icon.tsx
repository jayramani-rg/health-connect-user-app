import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors } from '../../theme';
import type { IconProps } from './types/Icon.types';

export function Icon({ name, size = 22, color = colors.ink, style }: IconProps) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

export type { IconProps, IoniconsIconName } from './types/Icon.types';
