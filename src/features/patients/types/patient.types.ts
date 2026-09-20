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

export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface PatientProfile {
  firstName: string | null;
  lastName: string | null;
  gender: PatientGender | null;
  dob: string | null;
  bloodGroup: string | null;
  profilePhotoUrl: string | null;
  allergyDetails: string | null;
  chronicConditions: string | null;
  isProfileComplete: boolean;
}

export interface UpdatePatientProfileRequest {
  firstName: string;
  lastName: string;
  gender?: PatientGender;
  dob?: string;
  bloodGroup?: string;
  allergyDetails?: string;
  chronicConditions?: string;
}
