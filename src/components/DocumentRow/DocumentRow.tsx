import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { activeopacity } from '../../utils/helpers';
import { styles } from './styles/DocumentRow.styles';
import type { DocumentRowProps } from './types/DocumentRow.types';

const STATUS_LABEL: Record<DocumentRowProps['status'], string> = {
  idle: 'Upload',
  uploading: 'Uploading…',
  success: 'Uploaded ✓',
  error: 'Retry',
};

export function DocumentRow({ label, status, progress, onPress }: DocumentRowProps) {
  const statusText = status === 'uploading' && progress !== undefined ? `Uploading ${Math.round(progress)}%` : STATUS_LABEL[status];

  return (
    <TouchableOpacity
      activeOpacity={activeopacity}
      onPress={onPress}
      disabled={status === 'uploading'}
      style={[styles.row, status === 'success' && styles.rowSuccess, status === 'error' && styles.rowError]}
    >
      <View style={[styles.icon, status === 'success' && styles.iconSuccess]} />
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.status,
          status === 'success' && styles.statusSuccess,
          status === 'error' && styles.statusError,
          status === 'uploading' && styles.statusUploading,
        ]}
      >
        {statusText}
      </Text>
    </TouchableOpacity>
  );
}

export type { DocumentRowProps };
