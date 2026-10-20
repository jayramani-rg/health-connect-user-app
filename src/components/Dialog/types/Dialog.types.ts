import type { IoniconsIconName } from '../../Icon/Icon';

export type DialogTone = 'danger' | 'primary' | 'warning' | 'success' | 'info';

export type DialogActionVariant = 'primary' | 'danger' | 'secondary' | 'ghost';

export interface DialogAction {
  label: string;
  onPress?: () => unknown;
  variant?: DialogActionVariant;
  accessibilityHint?: string;
}

export interface DialogOptions {
  title: string;
  message?: string;
  icon?: IoniconsIconName;
  tone?: DialogTone;
  actions: DialogAction[];
  dismissible?: boolean;
  errorFallback?: string;
  onDismiss?: () => void;
}

export interface DialogSheetProps extends DialogOptions {
  visible: boolean;
  onRequestClose: () => void;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  icon?: IoniconsIconName;
  tone?: DialogTone;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => unknown;
  onCancel?: () => void;
  errorFallback?: string;
}

export interface NoticeOptions {
  title: string;
  message?: string;
  icon?: IoniconsIconName;
  tone?: DialogTone;
  actionLabel?: string;
  onClose?: () => void;
}
