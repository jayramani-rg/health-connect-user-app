import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles/Banner.styles';
import type { BannerProps } from './types/Banner.types';

const VARIANT_STYLE = {
  info: [styles.info, styles.infoText],
  warning: [styles.warning, styles.warningText],
  error: [styles.error, styles.errorText],
  success: [styles.success, styles.successText],
} as const;

export function Banner({ variant, message }: BannerProps) {
  const [containerStyle, textStyle] = VARIANT_STYLE[variant];

  return (
    <View style={[styles.base, containerStyle]}>
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
}

export type { BannerProps };
