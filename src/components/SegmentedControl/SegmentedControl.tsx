import React, { useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion } from '../../theme';
import { styles, TRACK_PADDING } from './styles/SegmentedControl.styles';
import type { SegmentedControlProps } from './types/SegmentedControl.types';

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const segmentWidth = (trackWidth - TRACK_PADDING * 2) / options.length;

  const translateX = useSharedValue(0);
  translateX.value = withSpring(index * segmentWidth, motion.spring.pill);

  const thumbStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: translateX.value }],
  }));

  function handleLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.track} onLayout={handleLayout}>
      {trackWidth > 0 && <Animated.View style={[styles.thumb, thumbStyle]} />}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} style={styles.segment} onPress={() => onChange(option.value)}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { SegmentedControlProps, SegmentedOption } from './types/SegmentedControl.types';
