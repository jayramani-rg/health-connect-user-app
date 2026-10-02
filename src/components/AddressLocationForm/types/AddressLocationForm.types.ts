import type { ReactNode } from 'react';
import type { AddressLocationValue } from '../../../utils/addressLocation';

export interface AddressLocationFormProps {
  value: AddressLocationValue;
  onChange: (next: AddressLocationValue) => void;
  addressLabel?: string;
  addressPlaceholder?: string;
  mapHeight?: number;
  footerAction?: ReactNode;
  disabled?: boolean;
}
