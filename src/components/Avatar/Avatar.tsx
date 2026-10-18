import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors } from '../../theme';
import { useRemoteImage } from '../../utils/media';
import { styles } from './styles/Avatar.styles';
import type { AvatarProps } from './types/Avatar.types';

export function Avatar({ name, size = 44, variant = 'brand', imageUrl }: AvatarProps) {
  const image = useRemoteImage(imageUrl);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const backgroundColor = variant === 'brand' ? colors.brandSoft : colors.surfaceSunken;
  const color = variant === 'brand' ? colors.brand : colors.textSecondary;

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      {!image.showImage || !image.loaded ? <Text style={[styles.initial, { fontSize: size * 0.4, color }]}>{initial}</Text> : null}
      {image.showImage && image.uri ? (
        <Image
          source={{ uri: image.uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          onError={image.onError}
          onLoad={image.onLoad}
          accessibilityIgnoresInvertColors
        />
      ) : null}
    </View>
  );
}

export type { AvatarProps };
