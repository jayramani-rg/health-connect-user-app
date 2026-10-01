import type { ReactNode } from 'react';
import type { AddressLocationValue } from '../../../utils/addressLocation';

export interface AddressLocationFormProps {
  value: AddressLocationValue;
  onChange: (next: AddressLocationValue) => void;
  /** Label for the one free-text field. */
  addressLabel?: string;
  addressPlaceholder?: string;
  /** Map card height. */
  mapHeight?: number;
  /** Optional extra action under the address field (e.g. "Use my current location" in the patient app). */
  footerAction?: ReactNode;
  disabled?: boolean;
}
