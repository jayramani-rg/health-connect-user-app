import React, { memo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { AvailableSlot } from '../../types/appointment.types';
import { slotAccessibilityLabel, slotStateLabel, type SlotVisualState } from '../../utils/slotState';
import { SLOT_HEIGHT, slotTone, styles } from './styles/SlotChip.styles';
import { SkeletonBlock } from '../../../../components/SkeletonLoader/SkeletonLoader';
import { colors, radius } from '../../../../theme';

export interface SlotChipProps {
  slot: AvailableSlot;
  state: SlotVisualState;
  width: number;
  onPress: (slot: AvailableSlot) => void;
}

const LOCKED: SlotVisualState[] = ['booked', 'unavailable', 'processing'];
const EMPHASIS: SlotVisualState[] = ['selected', 'held', 'waiting', 'processing'];

export function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function SlotChipBase({ slot, state, width, onPress }: SlotChipProps) {
  const tone = slotTone[state];
  const disabled = LOCKED.includes(state);
  const caption = slotStateLabel(state);
  const time = formatSlotTime(slot.startAtUtc);

  return (
    <Pressable
      onPress={() => onPress(slot)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: state === 'selected', busy: state === 'processing' }}
      accessibilityLabel={slotAccessibilityLabel(time, state, slot.queueLength ?? 0)}
      style={({ pressed }) => [
        styles.chip,
        EMPHASIS.includes(state) && styles.chipEmphasis,
        { width, backgroundColor: tone.background, borderColor: tone.border, borderStyle: tone.dashed ? 'dashed' : 'solid' },
        pressed && !disabled && styles.pressed,
      ]}
    >
      {state === 'processing' ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text
          style={[styles.time, { color: tone.time }, tone.strike && styles.strike]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {time}
        </Text>
      )}
      {caption ? (
        <Text style={[styles.caption, { color: tone.caption }]} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </Pressable>
  );
}

export const SlotChip = memo(SlotChipBase);

const LEGEND_LABEL: Partial<Record<SlotVisualState, { label: string; spoken: string }>> = {
  available: { label: 'Available', spoken: 'available' },
  selected: { label: 'Selected', spoken: 'selected' },
  reserved: { label: 'Held', spoken: 'held by another patient' },
  booked: { label: 'Booked', spoken: 'booked' },
  unavailable: { label: 'Unavailable', spoken: 'not available' },
};

const DEFAULT_LEGEND: SlotVisualState[] = ['available', 'selected', 'reserved', 'booked'];

export function SlotLegend({ states = DEFAULT_LEGEND }: { states?: SlotVisualState[] }) {
  const items = states.flatMap((state) => {
    const entry = LEGEND_LABEL[state];
    return entry ? [{ state, ...entry }] : [];
  });
  return (
    <View style={styles.legend} accessibilityRole="summary" accessibilityLabel={`Legend: ${items.map((item) => item.spoken).join(', ')}`}>
      {items.map(({ state, label }) => {
        const tone = slotTone[state];
        return (
          <View key={state} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: tone.background, borderColor: tone.border }]} />
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function SlotGridSkeleton({ width, count = 9 }: { width: number; count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock key={index} width={width} height={SLOT_HEIGHT} radius={radius.md} />
      ))}
    </View>
  );
}

export { styles as slotStyles };
