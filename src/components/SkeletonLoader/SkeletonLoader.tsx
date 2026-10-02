import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, radius, spacing } from '../../theme';
import type { SkeletonBlockProps } from './types/SkeletonLoader.types';

const SHIMMER_COLORS = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0)'];

export function SkeletonBlock({ width, height, radius: cornerRadius = radius.sm, style }: SkeletonBlockProps) {
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [progress]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -measuredWidth + progress.value * measuredWidth * 2 }],
  }));

  function handleLayout(event: LayoutChangeEvent) {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next !== measuredWidth) setMeasuredWidth(next);
  }

  return (
    <View
      onLayout={handleLayout}
      style={[{ width, height, borderRadius: cornerRadius, backgroundColor: colors.surfaceSunken, overflow: 'hidden' }, style]}
    >
      {measuredWidth > 0 && (
        <Animated.View style={[StyleSheet.absoluteFill, { width: measuredWidth }, sweepStyle]}>
          <LinearGradient colors={SHIMMER_COLORS} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
        </Animated.View>
      )}
    </View>
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
