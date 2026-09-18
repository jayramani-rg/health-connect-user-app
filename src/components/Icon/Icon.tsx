import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors } from '../../theme';
import type { IconProps } from './types/Icon.types';

/** Single coherent icon family for the whole app — every screen should render icons through this
 * component (not raw <Ionicons>) so size/color defaults and the underlying font stay centralized. */
export function Icon({ name, size = 22, color = colors.text, style }: IconProps) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

export type { IconProps, IoniconsIconName } from './types/Icon.types';
