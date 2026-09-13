import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { activeopacity } from '../../utils/helpers';
import { styles } from './styles/ChipGroup.styles';
import type { ChipGroupProps } from './types/ChipGroup.types';

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
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={activeopacity}
              onPress={() => toggle(option.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export type { ChipGroupProps };
