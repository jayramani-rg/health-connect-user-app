export interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  errorText?: string;
  showChecklist?: boolean;
}

export interface PasswordRuleState {
  label: string;
  met: boolean;
}
