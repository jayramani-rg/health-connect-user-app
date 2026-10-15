import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';
import { layout } from '../../theme';
import { haptics } from '../../utils/haptics';
import { styles } from './styles/FilterChips.styles';

export interface FilterOption<T extends string = string> {
  label: string;
  value: T;
  count?: number;
}

export interface FilterChipsProps<T extends string = string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  inset?: number;
  accessibilityLabel?: string;
}

interface ChipFrame {
  x: number;
  width: number;
}

export function FilterChips<T extends string = string>({ options, value, onChange, inset = layout.gutter, accessibilityLabel }: FilterChipsProps<T>) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const frames = useRef<Record<string, ChipFrame>>({});
  const viewportWidth = useRef(0);
  const scrollX = useRef(0);

  const revealValue = useCallback(
    (target: string, animated: boolean) => {
      const frame = frames.current[target];
      const viewport = viewportWidth.current;
      if (!frame || viewport === 0) return;
      const left = frame.x - inset;
      const right = frame.x + frame.width + inset - viewport;
      if (left < scrollX.current) {
        scrollRef.current?.scrollTo({ x: Math.max(0, left), animated });
      } else if (right > scrollX.current) {
        scrollRef.current?.scrollTo({ x: right, animated });
      }
    },
    [inset],
  );

  useEffect(() => {
    revealValue(value, true);
  }, [value, revealValue]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollX.current = event.nativeEvent.contentOffset.x;
  }

  function handleChipLayout(optionValue: string, event: LayoutChangeEvent) {
    const { x, width } = event.nativeEvent.layout;
    frames.current[optionValue] = { x, width };
    if (optionValue === value) revealValue(optionValue, false);
  }

  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: inset }]}
        onLayout={(event) => {
          viewportWidth.current = event.nativeEvent.layout.width;
        }}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        {options.map((option) => {
          const selected = option.value === value;
          const hasCount = typeof option.count === 'number' && option.count > 0;
          return (
            <Pressable
              key={option.value}
              onLayout={(event) => handleChipLayout(option.value, event)}
              onPress={() => {
                if (selected) return;
                haptics.selection();
                onChange(option.value);
              }}
              hitSlop={{ top: 4, bottom: 4 }}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={hasCount ? `${option.label}, ${option.count}` : option.label}
              style={({ pressed }) => [styles.chip, selected ? styles.chipSelected : styles.chipIdle, pressed && !selected && styles.chipPressed]}
            >
              <Text style={[styles.label, selected ? styles.labelSelected : styles.labelIdle]} numberOfLines={1}>
                {option.label}
              </Text>
              {hasCount ? (
                <View style={[styles.count, selected ? styles.countSelected : styles.countIdle]}>
                  <Text style={[styles.countText, selected ? styles.countTextSelected : styles.countTextIdle]}>
                    {option.count! > 99 ? '99+' : option.count}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default FilterChips;
