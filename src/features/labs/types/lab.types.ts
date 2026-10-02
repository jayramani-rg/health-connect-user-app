import type { LocalityMatch } from '../../doctors/types/doctor.types';

export type { LocalityMatch };

export interface LaboratoryServiceItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  sampleType: string | null;
  price: number;
  discountPrice: number | null;
  preparationInstructions: string | null;
  estimatedReportHours: number;
  labVisitEnabled: boolean;
  homeCollectionEnabled: boolean;
  isActive: boolean;
}

export interface LabListItem {
  laboratoryId: string;
  name: string;
  city: string;
  state: string;
  locality: string | null;
  photoUrl: string | null;
  homeCollectionEnabled: boolean;
  isAcceptingBookings: boolean;
  serviceCount: number;
  localityMatch: LocalityMatch | null;
  homeCollectionAvailableAtPincode: boolean | null;
}

export interface LabDetail {
  laboratoryId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleAddress: string | null;
  locality: string | null;
  contactPhone: string;
  photoUrl: string | null;
  homeCollectionEnabled: boolean;
  homeCollectionFee: number | null;
  isAcceptingBookings: boolean;
  operatingHours: string | null;
  services: LaboratoryServiceItem[];
}

export interface LabListQuery {
  search?: string;
  city?: string;
  homeCollectionOnly?: boolean;
  nearLocality?: string;
  nearCity?: string;
  pincode?: string;
  page?: number;
  pageSize?: number;
}

export interface LabServiceSearchResultItem {
  laboratoryServiceId: string;
  serviceName: string;
  category: string;
  price: number;
  discountPrice: number | null;
  homeCollectionEnabled: boolean;
  laboratoryId: string;
  laboratoryName: string;
  city: string;
  locality: string | null;
  localityMatch: LocalityMatch | null;
}

export interface LabServiceSearchQuery {
  search?: string;
  category?: string;
  homeCollectionOnly?: boolean;
  nearLocality?: string;
  nearCity?: string;
  page?: number;
  pageSize?: number;
}
