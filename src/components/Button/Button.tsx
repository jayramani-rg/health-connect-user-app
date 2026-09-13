import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme';
import { activeopacity } from '../../utils/helpers';
import { styles } from './styles/Button.styles';
import type { ButtonProps } from './types/Button.types';

export function Button({ label, onPress, variant = 'primary', disabled, loading, icon, fullWidth = true, style, labelStyle }: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = variant === 'primary' ? styles.primary : variant === 'secondary' ? styles.secondary : styles.ghost;
  const variantLabelStyle = variant === 'primary' ? styles.labelPrimary : variant === 'secondary' ? styles.labelSecondary : styles.labelGhost;

  return (
    <TouchableOpacity
      activeOpacity={activeopacity}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, variantStyle, fullWidth && styles.fullWidth, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.brand} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={[variantLabelStyle, labelStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export type { ButtonProps };
