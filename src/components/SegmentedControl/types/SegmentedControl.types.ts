export interface SegmentedOption {
  label: string;
  value: string;
  badge?: number;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel?: string;
}
