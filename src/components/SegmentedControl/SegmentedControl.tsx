import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motion } from '../../theme';
import { haptics } from '../../utils/haptics';
import { pressFeedback } from '../../utils/motion';
import { styles, TRACK_PADDING } from './styles/SegmentedControl.styles';
import type { SegmentedControlProps } from './types/SegmentedControl.types';

export function SegmentedControl({ options, value, onChange, accessibilityLabel }: SegmentedControlProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const segmentWidth = Math.max(0, (trackWidth - TRACK_PADDING * 2) / options.length);

  const translateX = useSharedValue(0);
  const thumbWidth = useSharedValue(0);

  const measuredWidth = useRef(0);

  useEffect(() => {
    thumbWidth.value = segmentWidth;
    const target = index * segmentWidth;
    if (measuredWidth.current !== segmentWidth) {
      measuredWidth.current = segmentWidth;
      translateX.value = target;
      return;
    }
    translateX.value = withTiming(target, { ...pressFeedback.timing, duration: motion.duration.base });
  }, [index, segmentWidth, thumbWidth, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    width: thumbWidth.value,
    transform: [{ translateX: translateX.value }],
  }));

  function handleLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.track} onLayout={handleLayout} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {trackWidth > 0 && <Animated.View pointerEvents="none" style={[styles.thumb, thumbStyle]} />}
      {options.map((option) => {
        const active = option.value === value;
        const badge = option.badge ?? 0;
        return (
          <Pressable
            key={option.value}
            style={styles.segment}
            onPress={() => {
              if (active) return;
              haptics.selection();
              onChange(option.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={badge > 0 ? `${option.label}, ${badge}` : option.label}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {option.label}
            </Text>
            {badge > 0 ? (
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{badge > 99 ? '99+' : badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export type { SegmentedControlProps, SegmentedOption } from './types/SegmentedControl.types';
