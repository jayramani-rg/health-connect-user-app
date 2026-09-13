import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles/ProgressStepper.styles';
import type { ProgressStepperProps } from './types/ProgressStepper.types';

export function ProgressStepper({ currentStep, totalSteps, stepLabel }: ProgressStepperProps) {
  const percent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        Step {currentStep} of {totalSteps} · {stepLabel}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

export type { ProgressStepperProps };
