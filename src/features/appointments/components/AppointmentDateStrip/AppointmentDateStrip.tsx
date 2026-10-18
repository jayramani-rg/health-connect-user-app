import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View, type ScrollViewInstance } from 'react-native';
import { toLocalDateKey } from '../../../../utils/helpers';
import { haptics } from '../../../../utils/haptics';
import { dayAvailabilityLabel } from '../../utils/slotState';
import { DATE_PILL_GAP, DATE_PILL_WIDTH, styles } from './styles/AppointmentDateStrip.styles';
import type { AppointmentDateStripProps } from './types/AppointmentDateStrip.types';

function weekdayLabel(date: Date, index: number): string {
  if (index === 0) return 'Today';
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

const ACCESSIBILITY_STATUS = { FULL: 'fully booked', NO_SLOTS: 'no slots' } as const;

export function AppointmentDateStrip({ days, selectedDate, onSelectDate, counts, dayStatuses, countsLoaded, countsFailed }: AppointmentDateStripProps) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const selectedIndex = Math.max(0, days.findIndex((day) => toLocalDateKey(day) === selectedDate));

  useEffect(() => {
    const offset = Math.max(0, selectedIndex * (DATE_PILL_WIDTH + DATE_PILL_GAP) - DATE_PILL_WIDTH);
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  }, [selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {days.map((date, index) => {
        const key = toLocalDateKey(date);
        const selected = key === selectedDate;
        const count = counts[key] ?? 0;
        const status = dayStatuses[key];
        const known = countsLoaded && !countsFailed && status !== undefined;
        const empty = known && status !== 'AVAILABLE';
        const full = known && status === 'FULL';
        const label = known ? dayAvailabilityLabel(status, count) : ' ';
        const fullDate = date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

        return (
          <Pressable
            key={key}
            onPress={() => {
              if (!selected) haptics.selection();
              onSelectDate(key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={known ? `${fullDate}, ${status === 'AVAILABLE' ? label : ACCESSIBILITY_STATUS[status]}` : fullDate}
            style={({ pressed }) => [styles.pill, selected && styles.pillSelected, empty && !selected && styles.pillEmpty, pressed && styles.pillPressed]}
          >
            <Text style={[styles.weekday, selected && styles.textSelected, empty && !selected && styles.textMuted]} numberOfLines={1}>
              {weekdayLabel(date, index)}
            </Text>
            <Text style={[styles.dayNumber, selected && styles.textSelected, empty && !selected && styles.textMuted]}>{date.getDate()}</Text>
            <View style={styles.availabilityRow}>
              {known ? <View style={[styles.dot, full ? styles.dotFull : empty ? styles.dotEmpty : styles.dotOpen, selected && styles.dotSelected]} /> : null}
              <Text style={[styles.availability, selected && styles.availabilitySelected]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export type { AppointmentDateStripProps };
