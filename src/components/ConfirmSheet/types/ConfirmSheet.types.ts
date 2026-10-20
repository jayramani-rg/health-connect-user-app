import type { IoniconsIconName } from '../../Icon/Icon';
import type { DialogTone } from '../../Dialog/types/Dialog.types';

export interface ConfirmSheetAction {
  label: string;
  onPress: () => unknown;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
}

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  actions: ConfirmSheetAction[];
  icon?: IoniconsIconName;
  tone?: DialogTone;
  errorFallback?: string;
  onRequestClose?: () => void;
}
