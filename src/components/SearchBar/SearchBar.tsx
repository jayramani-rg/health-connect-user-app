import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../Icon/Icon';
import { RotatingPlaceholder } from './RotatingPlaceholder';
import { styles } from './styles/SearchBar.styles';
import type { SearchBarProps } from './types/SearchBar.types';

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  placeholderHints,
  onSubmitEditing,
  onPressClear,
  returnKeyType = 'search',
  autoFocus,
  editable = true,
  onPress,
}: SearchBarProps) {
  const showHints = !!placeholderHints && value.length === 0;

  const content = (
    <View style={styles.row}>
      <Icon name="search" size={18} color={colors.inkFaint} />
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={showHints ? undefined : placeholder}
          placeholderTextColor={colors.inkFaint}
          accessibilityLabel={placeholder}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          autoFocus={autoFocus}
          editable={editable}
          pointerEvents={onPress ? 'none' : 'auto'}
        />
        {showHints ? <RotatingPlaceholder prefix={placeholderHints.prefix} hints={placeholderHints.hints} /> : null}
      </View>
      {value.length > 0 && onPressClear && (
        <Pressable onPress={onPressClear} hitSlop={8}>
          <Icon name="close-circle" size={18} color={colors.inkFaint} />
        </Pressable>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="search" accessibilityLabel={placeholder}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export type { SearchBarProps };
