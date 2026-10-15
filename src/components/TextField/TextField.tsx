import React, { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors } from '../../theme';
import { useKeyboardAwareField } from '../KeyboardAware/KeyboardAwareContext';
import { styles } from './styles/TextField.styles';
import type { HostInstance } from 'react-native';
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
  onSubmitEditing,
  returnKeyType,
  showCount,
  onFocus,
  onBlur,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HostInstance>(null);
  const keyboardField = useKeyboardAwareField(wrapperRef);
  const counterVisible = !!maxLength && (showCount ?? !!multiline);
  const message = errorText || helperText;

  return (
    <View ref={wrapperRef} style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.fieldRow,
          multiline && styles.fieldRowMultiline,
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
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkFaint}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          scrollEnabled={multiline ? true : undefined}
          textAlignVertical={multiline ? 'top' : undefined}
          autoCapitalize={autoCapitalize}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          onContentSizeChange={multiline && focused ? keyboardField.reveal : undefined}
          onFocus={() => {
            setFocused(true);
            keyboardField.reveal();
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            keyboardField.release();
            onBlur?.();
          }}
        />
        {suffix}
      </View>
      {message || counterVisible ? (
        <View style={styles.footerRow}>
          {message ? (
            <Text style={[styles.message, errorText ? styles.errorText : styles.helperText]} accessibilityLiveRegion={errorText ? 'polite' : 'none'}>
              {message}
            </Text>
          ) : (
            <View style={styles.message} />
          )}
          {counterVisible ? (
            <Text style={styles.counter}>
              {value.length}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export type { TextFieldProps };
