import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, radius, spacing } from '../../theme';
import type { SkeletonBlockProps } from './types/SkeletonLoader.types';

export function SkeletonBlock({ width, height, radius: cornerRadius = radius.sm, style }: SkeletonBlockProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: cornerRadius, backgroundColor: colors.surfaceSunken }, animatedStyle, style]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={{ gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg }}>
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
        <SkeletonBlock width={44} height={44} radius={22} />
        <View style={{ gap: spacing.xs, flex: 1 }}>
          <SkeletonBlock width="70%" height={14} />
          <SkeletonBlock width="45%" height={12} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={12} />
      <SkeletonBlock width="85%" height={12} />
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.md }}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}
