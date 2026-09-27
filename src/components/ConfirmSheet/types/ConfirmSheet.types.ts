export interface ConfirmSheetAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
}

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  /** Rendered top-to-bottom; the last one is treated as the primary/confirming action. */
  actions: ConfirmSheetAction[];
  onRequestClose?: () => void;
}
