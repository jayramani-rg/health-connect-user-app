export interface ChipOption {
  label: string;
  value: string;
}

export interface ChipGroupProps {
  label?: string;
  options: ChipOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
}
