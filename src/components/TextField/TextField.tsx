import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { styles } from './styles/TextField.styles';
import type { TextFieldProps } from './types/TextField.types';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  errorText,
  helperText,
  prefix,
  suffix,
  secureTextEntry,
  keyboardType,
  maxLength,
  editable = true,
  multiline,
  autoCapitalize = 'sentences',
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.fieldRow,
          focused && styles.fieldRowFocused,
          !!errorText && styles.fieldRowError,
          !editable && styles.fieldRowDisabled,
        ]}
      >
        {prefix && (
          <>
            <Text style={styles.prefix}>{prefix}</Text>
            <View style={styles.divider} />
          </>
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA1AC"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix}
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

export type { TextFieldProps };
