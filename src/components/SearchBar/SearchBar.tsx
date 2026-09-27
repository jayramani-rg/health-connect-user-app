import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../Icon/Icon';
import { styles } from './styles/SearchBar.styles';
import type { SearchBarProps } from './types/SearchBar.types';

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  onSubmitEditing,
  onPressClear,
  returnKeyType = 'search',
  autoFocus,
  editable = true,
  onPress,
}: SearchBarProps) {
  const content = (
    <View style={styles.row}>
      <Icon name="search" size={18} color={colors.inkFaint} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        autoFocus={autoFocus}
        editable={editable}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
      {value.length > 0 && onPressClear && (
        <Pressable onPress={onPressClear} hitSlop={8}>
          <Icon name="close-circle" size={18} color={colors.inkFaint} />
        </Pressable>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

export type { SearchBarProps };
