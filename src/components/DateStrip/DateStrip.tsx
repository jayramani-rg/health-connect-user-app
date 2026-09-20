import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { activeopacity, toLocalDateKey } from '../../utils/helpers';
import { styles } from './styles/DateStrip.styles';
import type { DateStripProps } from './types/DateStrip.types';

export function DateStrip({ selectedDate, onSelectDate, daysCount = 14 }: DateStripProps) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: daysCount }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  }, [daysCount]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((date) => {
        const key = toLocalDateKey(date);
        const selected = key === selectedDate;
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={activeopacity}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onSelectDate(key)}
          >
            <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
              {date.toLocaleDateString(undefined, { weekday: 'short' })}
            </Text>
            <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>{date.getDate()}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export type { DateStripProps };
