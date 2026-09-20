import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { activeopacity, toLocalDateKey } from '../../../../utils/helpers';
import { styles } from './styles/AppointmentDateStrip.styles';
import type { AppointmentDateStripProps } from './types/AppointmentDateStrip.types';

function dayLabel(date: Date, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function dateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function AppointmentDateStrip({ days, selectedDate, onSelectDate, counts, countsFailed }: AppointmentDateStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      {days.map((date, index) => {
        const key = toLocalDateKey(date);
        const selected = key === selectedDate;
        const count = counts[key];
        const loaded = count !== undefined;

        return (
          <TouchableOpacity
            key={key}
            activeOpacity={activeopacity}
            style={[styles.card, selected && styles.cardSelected]}
            onPress={() => onSelectDate(key)}
          >
            <Text style={[styles.dateLabel, selected && styles.dateLabelSelected]} numberOfLines={1}>
              {dayLabel(date, index)}, {dateLabel(date)}
            </Text>
            {countsFailed ? (
              <Text style={[styles.status, styles.statusMuted]}>Tap to check</Text>
            ) : !loaded ? (
              <Text style={[styles.status, styles.statusMuted]}>Checking…</Text>
            ) : count > 0 ? (
              <Text style={[styles.status, styles.statusAvailable]}>{count} slots available</Text>
            ) : (
              <Text style={[styles.status, styles.statusUnavailable]}>No slots available</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export type { AppointmentDateStripProps };
