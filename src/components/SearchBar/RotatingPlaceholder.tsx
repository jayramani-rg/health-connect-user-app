import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { styles } from './styles/SearchBar.styles';
import type { SearchHints } from './types/SearchBar.types';

const HOLD_MS = 1500;
const SLIDE_MS = 280;
const SLIDE_DISTANCE = 14;

function slideStyle(progress: Animated.Value) {
  return {
    opacity: progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
    transform: [{ translateY: progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [-SLIDE_DISTANCE, 0, SLIDE_DISTANCE] }) }],
  };
}

function animateTo(values: Animated.Value[], toValue: number, easing: (value: number) => number) {
  return Animated.parallel(values.map((value) => Animated.timing(value, { toValue, duration: SLIDE_MS, easing, useNativeDriver: true })));
}

export function RotatingPlaceholder({ prefix, hints }: SearchHints) {
  const [index, setIndex] = useState(0);
  const group = useRef(new Animated.Value(0)).current;
  const label = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hints.length < 2) return;
    let cancelled = false;
    let current = 0;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const next = (current + 1) % hints.length;
      const moving = hints[next].group === hints[current].group ? [label] : [group, label];
      animateTo(moving, -1, Easing.in(Easing.cubic)).start(() => {
        if (cancelled) return;
        current = next;
        setIndex(next);
        moving.forEach((value) => value.setValue(1));
        animateTo(moving, 0, Easing.out(Easing.cubic)).start(() => {
          if (!cancelled) timer = setTimeout(step, HOLD_MS);
        });
      });
    };

    timer = setTimeout(step, HOLD_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      group.stopAnimation();
      label.stopAnimation();
      group.setValue(0);
      label.setValue(0);
    };
  }, [hints, group, label]);

  const hint = hints[index];
  if (!hint) return null;

  return (
    <View style={styles.hintRow} pointerEvents="none" accessible={false}>
      <Text style={styles.hintText}>{prefix}</Text>
      <Animated.Text style={[styles.hintText, slideStyle(group)]}>{hint.group}</Animated.Text>
      <Animated.Text style={[styles.hintText, styles.hintLabel, slideStyle(label)]} numberOfLines={1}>
        {hint.label}
      </Animated.Text>
    </View>
  );
}
