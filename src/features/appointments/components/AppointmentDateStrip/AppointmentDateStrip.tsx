import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View, type ScrollViewInstance } from 'react-native';
import { toLocalDateKey } from '../../../../utils/helpers';
import { haptics } from '../../../../utils/haptics';
import { DATE_PILL_GAP, DATE_PILL_WIDTH, styles } from './styles/AppointmentDateStrip.styles';
import type { AppointmentDateStripProps } from './types/AppointmentDateStrip.types';

function weekdayLabel(date: Date, index: number): string {
  if (index === 0) return 'Today';
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function availabilityLabel(count: number | undefined, loaded: boolean, failed: boolean): string {
  if (failed || (!loaded && count === undefined)) return ' ';
  if (!count) return 'Full';
  return count === 1 ? '1 slot' : `${count} slots`;
}

export function AppointmentDateStrip({ days, selectedDate, onSelectDate, counts, countsLoaded, countsFailed }: AppointmentDateStripProps) {
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
        const count = counts[key];
        const known = countsLoaded && !countsFailed && count !== undefined;
        const empty = known && count === 0;
        const label = availabilityLabel(count, countsLoaded, countsFailed);
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
            accessibilityLabel={known ? `${fullDate}, ${empty ? 'no open slots' : label}` : fullDate}
            style={({ pressed }) => [styles.pill, selected && styles.pillSelected, empty && !selected && styles.pillEmpty, pressed && styles.pillPressed]}
          >
            <Text style={[styles.weekday, selected && styles.textSelected, empty && !selected && styles.textMuted]} numberOfLines={1}>
              {weekdayLabel(date, index)}
            </Text>
            <Text style={[styles.dayNumber, selected && styles.textSelected, empty && !selected && styles.textMuted]}>{date.getDate()}</Text>
            <View style={styles.availabilityRow}>
              {known ? <View style={[styles.dot, empty ? styles.dotEmpty : styles.dotOpen, selected && styles.dotSelected]} /> : null}
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
