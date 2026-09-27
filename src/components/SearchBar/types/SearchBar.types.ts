import type { ReturnKeyTypeOptions } from 'react-native';

export interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  onPressClear?: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
  autoFocus?: boolean;
  editable?: boolean;
  onPress?: () => void;
}
