import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '../Button/Button';
import { styles } from './styles/EmptyState.styles';
import type { EmptyStateProps } from './types/EmptyState.types';

export function EmptyState({ title, description, actionLabel, onActionPress }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onActionPress ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onActionPress} variant="secondary" fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

export type { EmptyStateProps };
