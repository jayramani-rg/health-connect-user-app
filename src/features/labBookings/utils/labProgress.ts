import type { CollectionMethod, LabBookingStatus } from '../types/labBooking.types';

export type ProgressStepState = 'done' | 'current' | 'upcoming';

export interface ProgressStep {
  label: string;
  detail?: string;
  state: ProgressStepState;
}

export interface PatientProgress {
  headline: string;
  message: string;
  tone: 'brand' | 'warning' | 'success' | 'muted';
  steps: ProgressStep[];
  reportsExpected: boolean;
}

interface ProgressInput {
  status: LabBookingStatus;
  collectionMethod: CollectionMethod;
  collectorName: string | null;
  laboratoryName: string;
}

const CURRENT_STEP: Partial<Record<LabBookingStatus, number>> = {
  PAYMENT_PENDING: 1,
  PENDING: 1,
  CONFIRMED: 2,
  COLLECTOR_ASSIGNED: 2,
  ON_THE_WAY: 2,
  COLLECTION_FAILED: 2,
  SAMPLE_COLLECTED: 3,
  PROCESSING: 3,
  REPORT_READY: 4,
};

function collectionDetail(status: LabBookingStatus, isHome: boolean, collectorName: string | null): string | undefined {
  if (!isHome) return status === 'CONFIRMED' ? 'At your visit' : undefined;
  switch (status) {
    case 'CONFIRMED':
      return 'Arranged by the lab';
    case 'COLLECTOR_ASSIGNED':
      return collectorName ? `${collectorName} assigned` : 'Collector assigned';
    case 'ON_THE_WAY':
      return 'On the way';
    case 'COLLECTION_FAILED':
      return 'New attempt needed';
    default:
      return undefined;
  }
}

function copyFor(input: ProgressInput): Pick<PatientProgress, 'headline' | 'message' | 'tone'> {
  const { status, collectionMethod, collectorName, laboratoryName } = input;
  const isHome = collectionMethod === 'HOME_COLLECTION';
  const lab = laboratoryName || 'The lab';
  switch (status) {
    case 'PAYMENT_PENDING':
      return { headline: 'Payment pending', message: 'Complete the payment to send this booking to the lab.', tone: 'warning' };
    case 'PENDING':
      return { headline: 'Waiting for the lab', message: `${lab} will review your booking and confirm it shortly.`, tone: 'brand' };
    case 'CONFIRMED':
      return isHome
        ? { headline: 'Booking confirmed', message: `${lab} will collect your sample at the scheduled time.`, tone: 'brand' }
        : { headline: 'Booking confirmed', message: `Visit ${lab} at your scheduled time for the sample collection.`, tone: 'brand' };
    case 'COLLECTOR_ASSIGNED':
      return { headline: 'Collector assigned', message: `${collectorName ?? 'A collector'} from ${lab} will collect your sample.`, tone: 'brand' };
    case 'ON_THE_WAY':
      return { headline: 'On the way', message: collectorName ? `${collectorName} is on the way to collect your sample.` : `${lab} is on the way to collect your sample.`, tone: 'brand' };
    case 'COLLECTION_FAILED':
      return { headline: 'Collection not completed', message: `The last collection attempt was unsuccessful. ${lab} will arrange another visit.`, tone: 'warning' };
    case 'SAMPLE_COLLECTED':
      return { headline: 'Sample collected', message: 'Your report will appear here as soon as the lab uploads it.', tone: 'brand' };
    case 'PROCESSING':
      return { headline: 'Report in progress', message: 'The lab is processing your sample. You will be notified when the report is ready.', tone: 'brand' };
    case 'REPORT_READY':
      return { headline: 'Report ready', message: 'Your report is available below.', tone: 'success' };
    case 'REJECTED':
      return { headline: 'Booking declined', message: `${lab} could not take this booking.`, tone: 'muted' };
    case 'CANCELLED':
      return { headline: 'Booking cancelled', message: 'This booking was cancelled.', tone: 'muted' };
    case 'EXPIRED':
      return { headline: 'Request expired', message: 'The lab did not respond in time, so this request closed.', tone: 'muted' };
    case 'NO_SHOW':
      return { headline: 'Visit missed', message: 'The lab marked this visit as missed.', tone: 'muted' };
    default:
      return { headline: 'Lab booking', message: '', tone: 'muted' };
  }
}

export function patientProgress(input: ProgressInput): PatientProgress {
  const isHome = input.collectionMethod === 'HOME_COLLECTION';
  const current = CURRENT_STEP[input.status];
  const labels = ['Booked', 'Accepted', isHome ? 'Sample collection' : 'Lab visit', 'Report ready'];
  const steps: ProgressStep[] =
    current === undefined
      ? []
      : labels.map((label, index) => ({
          label,
          detail: index === 2 && current === 2 ? collectionDetail(input.status, isHome, input.collectorName) : undefined,
          state: index < current ? 'done' : index === current ? 'current' : 'upcoming',
        }));
  return {
    ...copyFor(input),
    steps,
    reportsExpected: current !== undefined && current >= 3,
  };
}
