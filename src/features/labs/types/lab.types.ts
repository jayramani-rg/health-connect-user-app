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
  photoUrl: string | null;
  homeCollectionEnabled: boolean;
  isAcceptingBookings: boolean;
  serviceCount: number;
}

export interface LabDetail {
  laboratoryId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
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
}

export interface LabServiceSearchQuery {
  search?: string;
  category?: string;
  homeCollectionOnly?: boolean;
  page?: number;
  pageSize?: number;
}
