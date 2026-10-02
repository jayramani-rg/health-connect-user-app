export interface ConfirmSheetAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
}

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  actions: ConfirmSheetAction[];
  onRequestClose?: () => void;
}
