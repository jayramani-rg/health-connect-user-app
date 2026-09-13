export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  errorText?: string;
  autoFocus?: boolean;
}
