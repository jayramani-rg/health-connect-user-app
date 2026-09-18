export interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  relation: string;
  dob: string | null;
  gender: string | null;
}

export interface SaveDependentRequest {
  firstName: string;
  lastName: string;
  relation: string;
  dob?: string;
  gender?: string;
}

export interface PatientAddress {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface SavePatientAddressRequest {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}
