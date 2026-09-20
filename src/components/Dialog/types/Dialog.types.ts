export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  /** Rendered top-to-bottom; the last one is treated as the primary/confirming action. */
  actions: DialogAction[];
  onRequestClose?: () => void;
}
