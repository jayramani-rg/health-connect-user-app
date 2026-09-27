import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, motion } from '../../theme';
import { haptics } from '../../utils/haptics';
import { styles } from './styles/ChipGroup.styles';
import type { ChipGroupProps } from './types/ChipGroup.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const progress = useSharedValue(selected ? 1 : 0);
  progress.value = withTiming(selected ? 1 : 0, { duration: motion.duration.fast });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: selected ? colors.primarySoft : colors.surface,
    borderColor: selected ? colors.primary : colors.border,
    transform: [{ scale: 0.97 + progress.value * 0.03 }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={[styles.chip, animatedStyle]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </AnimatedPressable>
  );
}

export function ChipGroup({ label, options, value, onChange, multi }: ChipGroupProps) {
  const selectedValues = Array.isArray(value) ? value : [value];

  function toggle(optionValue: string) {
    if (multi) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
      onChange(next);
    } else {
      onChange(optionValue);
    }
  }

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {options.map((option) => (
          <Chip key={option.value} label={option.label} selected={selectedValues.includes(option.value)} onPress={() => toggle(option.value)} />
        ))}
      </View>
    </View>
  );
}

export type { ChipGroupProps };
