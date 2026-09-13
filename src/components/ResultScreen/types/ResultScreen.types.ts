export type ResultScreenTone = 'success' | 'pending' | 'error';

export interface ResultScreenProps {
  tone: ResultScreenTone;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}
