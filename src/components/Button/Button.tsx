import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, motion } from '../../theme';
import { haptics } from '../../utils/haptics';
import { styles } from './styles/Button.styles';
import type { ButtonProps } from './types/Button.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANT_STYLE = {
  primary: styles.primary,
  secondary: styles.secondary,
  tertiary: styles.tertiary,
  ghost: styles.ghost,
  destructive: styles.destructive,
};

const VARIANT_LABEL_STYLE = {
  primary: styles.labelPrimary,
  secondary: styles.labelSecondary,
  tertiary: styles.labelTertiary,
  ghost: styles.labelGhost,
  destructive: styles.labelDestructive,
};

const SPINNER_COLOR = {
  primary: colors.white,
  secondary: colors.primaryStrong,
  tertiary: colors.ink,
  ghost: colors.primary,
  destructive: colors.error,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  fullWidth = true,
  style,
  labelStyle,
  haptics: enableHaptics = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={() => {
        if (enableHaptics) haptics.light();
        onPress();
      }}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withSpring(0.96, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      style={[styles.base, VARIANT_STYLE[variant], fullWidth && styles.fullWidth, isDisabled && styles.disabled, animatedStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLOR[variant]} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={[VARIANT_LABEL_STYLE[variant], labelStyle]}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

export type { ButtonProps };
