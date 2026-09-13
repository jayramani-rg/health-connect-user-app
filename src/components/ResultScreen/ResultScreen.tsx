import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '../Button/Button';
import { styles } from './styles/ResultScreen.styles';
import type { ResultScreenProps } from './types/ResultScreen.types';

const TONE_ICON: Record<ResultScreenProps['tone'], string> = {
  success: '✓',
  pending: '◔',
  error: '↻',
};

const TONE_CIRCLE = {
  success: styles.iconCircleSuccess,
  pending: styles.iconCirclePending,
  error: styles.iconCircleError,
} as const;

const TONE_TEXT = {
  success: styles.iconTextSuccess,
  pending: styles.iconTextPending,
  error: styles.iconTextError,
} as const;

export function ResultScreen({ tone, title, description, primaryLabel, onPrimaryPress, secondaryLabel, onSecondaryPress }: ResultScreenProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.iconCircle, TONE_CIRCLE[tone]]}>
        <Text style={[styles.iconText, TONE_TEXT[tone]]}>{TONE_ICON[tone]}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.actions}>
        <Button label={primaryLabel} onPress={onPrimaryPress} />
        {secondaryLabel && onSecondaryPress && <Button label={secondaryLabel} onPress={onSecondaryPress} variant="ghost" />}
      </View>
    </View>
  );
}

export type { ResultScreenProps };
