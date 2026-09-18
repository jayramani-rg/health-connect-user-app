export type CollectionMethod = 'LAB_VISIT' | 'HOME_COLLECTION';

export type LabBookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COLLECTOR_ASSIGNED'
  | 'ON_THE_WAY'
  | 'COLLECTION_FAILED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'REPORT_READY'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NO_SHOW';

export interface LabBookingListItem {
  id: string;
  collectionMethod: CollectionMethod;
  status: LabBookingStatus;
  scheduledAtUtc: string;
  laboratoryId: string;
  laboratoryName: string;
  patientUserId: string;
  patientName: string | null;
  totalAmount: number;
  serviceNames: string[];
}

export interface LabBookingItemDto {
  laboratoryServiceId: string;
  serviceName: string;
  price: number;
}

export interface LabReport {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface LabBookingHistoryEntry {
  action: string;
  fromStatus: LabBookingStatus | null;
  toStatus: LabBookingStatus;
  actorRole: string | null;
  actorName: string | null;
  note: string | null;
  createdAt: string;
}

export interface LabBookingDetail {
  id: string;
  collectionMethod: CollectionMethod;
  status: LabBookingStatus;
  scheduledAtUtc: string;
  notes: string | null;

  laboratoryId: string;
  laboratoryName: string;
  laboratoryPhone: string;

  patientUserId: string;
  patientName: string | null;
  dependentId: string | null;
  dependentName: string | null;
  dependentRelation: string | null;

  addressLine1: string | null;
  addressLine2: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPincode: string | null;

  assignedCollectorId: string | null;
  assignedCollectorName: string | null;

  totalAmount: number | null;
  items: LabBookingItemDto[];

  cancelledByRole: string | null;
  cancellationReason: string | null;
  rejectionReason: string | null;
  collectionFailureReason: string | null;

  acceptedAt: string | null;
  collectedAt: string | null;
  reportReadyAt: string | null;

  reports: LabReport[];
  history: LabBookingHistoryEntry[];
}

export interface BookLabServicePayload {
  laboratoryId: string;
  laboratoryServiceIds: string[];
  collectionMethod: CollectionMethod;
  scheduledAtUtc: string;
  dependentId?: string;
  patientAddressId?: string;
  notes?: string;
}

export interface LabBookingQuery {
  status?: LabBookingStatus;
  collectionMethod?: CollectionMethod;
  laboratoryId?: string;
  dateFromUtc?: string;
  dateToUtc?: string;
  page?: number;
  pageSize?: number;
}

export interface AvailableLabSlot {
  startAtUtc: string;
}

export interface AvailableLabSlotsResponse {
  date: string;
  collectionMethod: CollectionMethod;
  labAcceptingBookings: boolean;
  slots: AvailableLabSlot[];
}

export type LabBookingTab = 'upcoming' | 'pending' | 'processing' | 'reports' | 'cancelled';

export const LAB_STATUS_BY_TAB: Record<LabBookingTab, LabBookingStatus[]> = {
  upcoming: ['CONFIRMED', 'COLLECTOR_ASSIGNED', 'ON_THE_WAY'],
  pending: ['PENDING'],
  processing: ['SAMPLE_COLLECTED', 'PROCESSING'],
  reports: ['REPORT_READY'],
  cancelled: ['CANCELLED', 'REJECTED', 'EXPIRED', 'NO_SHOW', 'COLLECTION_FAILED'],
};
