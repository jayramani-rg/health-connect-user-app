import React from 'react';
import { ConfirmSheet } from '../../../components/ConfirmSheet/ConfirmSheet';

interface ProfileGateDialogProps {
  visible: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

export function ProfileGateDialog({ visible, onComplete, onDismiss }: ProfileGateDialogProps) {
  return (
    <ConfirmSheet
      visible={visible}
      title="Complete your profile"
      message="Please add your first name and last name before booking an appointment or starting a chat."
      icon="person-circle-outline"
      tone="primary"
      actions={[
        { label: 'Complete profile', variant: 'primary', onPress: onComplete },
        { label: 'Not now', variant: 'secondary', onPress: onDismiss },
      ]}
      onRequestClose={onDismiss}
    />
  );
}
