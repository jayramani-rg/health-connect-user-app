import React from 'react';
import { DialogSheet } from '../Dialog/Dialog';
import type { DialogActionVariant } from '../Dialog/types/Dialog.types';
import type { ConfirmSheetAction, ConfirmSheetProps } from './types/ConfirmSheet.types';

const VARIANT_MAP: Record<NonNullable<ConfirmSheetAction['variant']>, DialogActionVariant> = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'secondary',
  ghost: 'ghost',
  destructive: 'danger',
};

export function ConfirmSheet({ visible, title, message, actions, icon, tone, errorFallback, onRequestClose }: ConfirmSheetProps) {
  return (
    <DialogSheet
      visible={visible}
      title={title}
      message={message}
      icon={icon}
      tone={tone ?? (actions.some(action => action.variant === 'destructive') ? 'danger' : 'primary')}
      errorFallback={errorFallback}
      actions={actions.map((action, index) => ({
        label: action.label,
        onPress: action.onPress,
        variant: action.variant ? VARIANT_MAP[action.variant] : index === 0 ? 'primary' : 'secondary',
      }))}
      onRequestClose={() => onRequestClose?.()}
    />
  );
}

export type { ConfirmSheetProps, ConfirmSheetAction } from './types/ConfirmSheet.types';
