import React, { useRef } from 'react';
import { Text, TextInput, View } from 'react-native';
import { styles } from './styles/OtpInput.styles';
import type { OtpInputProps } from './types/OtpInput.types';

export function OtpInput({ length = 6, value, onChange, errorText, autoFocus }: OtpInputProps) {
  const inputRefs = useRef<Array<React.ComponentRef<typeof TextInput> | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  function handleChange(text: string, index: number) {
    const cleaned = text.replace(/[^0-9]/g, '');

    if (cleaned.length > 1) {
      const next = (value + cleaned).slice(0, length);
      onChange(next);
      const focusIndex = Math.min(next.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const chars = value.split('');
    chars[index] = cleaned;
    const next = chars.join('').slice(0, length);
    onChange(next);

    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View>
      <View style={styles.row}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[styles.cell, digit ? styles.cellActive : null, errorText ? styles.cellError : null]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={length}
            autoFocus={autoFocus && index === 0}
          />
        ))}
      </View>
      {errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
}

export type { OtpInputProps };
