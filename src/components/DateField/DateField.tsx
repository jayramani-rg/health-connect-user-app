import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { activeopacity } from '../../utils/helpers';
import { styles } from '../TextField/styles/TextField.styles';

interface DateFieldProps {
  label: string;
  /** ISO date string 'YYYY-MM-DD', or '' when unset. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  errorText?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

function toDateOrNull(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DateField({ label, value, onChange, placeholder = '16-Sept-2005', errorText, maximumDate, minimumDate }: DateFieldProps) {
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const selectedDate = toDateOrNull(value);

  function openPicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate ?? maximumDate ?? new Date(),
        mode: 'date',
        display: 'default',
        maximumDate,
        minimumDate,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date) onChange(toIsoDate(date));
        },
      });
    } else {
      setIosPickerVisible(true);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity activeOpacity={activeopacity} onPress={openPicker} style={[styles.fieldRow, !!errorText && styles.fieldRowError]}>
        <Text style={[styles.input, !selectedDate && { color: '#9AA1AC' }]}>{selectedDate ? formatDisplay(selectedDate) : placeholder}</Text>
      </TouchableOpacity>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      {Platform.OS === 'ios' && iosPickerVisible && (
        <DateTimePicker
          value={selectedDate ?? maximumDate ?? new Date()}
          mode="date"
          display="spinner"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(event, date) => {
            if (event.type === 'set' && date) onChange(toIsoDate(date));
            setIosPickerVisible(false);
          }}
        />
      )}
    </View>
  );
}
