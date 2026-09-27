import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion, shadow } from '../../theme';
import { styles } from './styles/Card.styles';
import type { CardProps } from './types/Card.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANT_STYLE = {
  surface: styles.surface,
  sunken: styles.sunken,
  outline: styles.outline,
};

export function Card({ children, onPress, variant = 'surface', elevation = 'card', style }: CardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const elevationStyle = shadow[elevation];

  if (!onPress) {
    return <View style={[styles.base, VARIANT_STYLE[variant], elevationStyle, style]}>{children}</View>;
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      style={[styles.base, VARIANT_STYLE[variant], elevationStyle, animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

export type { CardProps };
