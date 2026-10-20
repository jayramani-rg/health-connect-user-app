import type { ConfirmOptions, DialogOptions, NoticeOptions } from './types/Dialog.types';

export interface DialogRequest extends DialogOptions {
  id: number;
}

type Listener = (queue: DialogRequest[]) => void;

let queue: DialogRequest[] = [];
let listeners: Listener[] = [];
let counter = 0;

function emit() {
  const snapshot = [...queue];
  listeners.forEach(listener => listener(snapshot));
}

export function showDialog(options: DialogOptions): number {
  counter += 1;
  queue = [...queue, { ...options, id: counter }];
  emit();
  return counter;
}

export function closeDialog(id: number): void {
  const next = queue.filter(item => item.id !== id);
  if (next.length === queue.length) return;
  queue = next;
  emit();
}

export function subscribeDialogs(listener: Listener): () => void {
  listeners.push(listener);
  listener([...queue]);
  return () => {
    listeners = listeners.filter(item => item !== listener);
  };
}

export function confirmAction({
  title,
  message,
  icon,
  tone = 'danger',
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  errorFallback,
}: ConfirmOptions): number {
  return showDialog({
    title,
    message,
    icon,
    tone,
    errorFallback,
    onDismiss: onCancel,
    actions: [
      { label: confirmLabel, variant: tone === 'danger' ? 'danger' : 'primary', onPress: onConfirm },
      { label: cancelLabel, variant: 'secondary', onPress: onCancel },
    ],
  });
}

export function showNotice({ title, message, icon, tone = 'info', actionLabel = 'OK', onClose }: NoticeOptions): number {
  return showDialog({
    title,
    message,
    icon,
    tone,
    onDismiss: onClose,
    actions: [{ label: actionLabel, variant: 'primary', onPress: onClose }],
  });
}
