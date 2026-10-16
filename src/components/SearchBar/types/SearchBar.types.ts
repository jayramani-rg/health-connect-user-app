import type { ReturnKeyTypeOptions } from 'react-native';

export interface SearchHint {
  group: string;
  label: string;
}

export interface SearchHints {
  prefix: string;
  hints: SearchHint[];
}

export interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  placeholderHints?: SearchHints;
  onSubmitEditing?: () => void;
  onPressClear?: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
  autoFocus?: boolean;
  editable?: boolean;
  onPress?: () => void;
}
