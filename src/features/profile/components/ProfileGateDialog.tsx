import React from 'react';
import { Dialog } from '../../../components/Dialog/Dialog';

interface ProfileGateDialogProps {
  visible: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

export function ProfileGateDialog({ visible, onComplete, onDismiss }: ProfileGateDialogProps) {
  return (
    <Dialog
      visible={visible}
      title="Complete your profile"
      message="Please add your first name and last name before booking an appointment or starting a chat."
      actions={[
        { label: 'Not now', variant: 'secondary', onPress: onDismiss },
        { label: 'Complete Profile', onPress: onComplete },
      ]}
      onRequestClose={onDismiss}
    />
  );
}
