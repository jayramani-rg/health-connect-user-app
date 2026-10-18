import type { IoniconsIconName } from '../../../components/Icon/Icon';
import type { AppointmentListItem, AppointmentStatus } from '../../appointments/types/appointment.types';
import type { LabBookingListItem, LabBookingStatus } from '../../labBookings/types/labBooking.types';
import { CONSULT_LABEL } from '../../appointments/utils/consultationType';
import { formatWhen, isSameDay } from '../../../utils/dateFormat';

export { formatWhen };

export type CareBucket = 'live' | 'attention' | 'scheduled' | 'tracking' | 'awaiting';

export interface CareItem {
  key: string;
  kind: 'APPOINTMENT' | 'LAB';
  id: string;
  title: string;
  subtitle: string | null;
  scheduledAt: string;
  modeLabel: string;
  modeIcon: IoniconsIconName;
  remote: boolean;
  bucket: CareBucket;
  late: boolean;
  appointmentStatus?: AppointmentStatus;
  labStatus?: LabBookingStatus;
}

export interface CareSummary {
  attention: CareItem[];
  today: CareItem[];
  upcoming: CareItem[];
  awaiting: CareItem[];
  upcomingTotal: number;
}

const UPCOMING_LIMIT = 3;
const LAB_LATE_GRACE_MS = 30 * 60 * 1000;

const CONSULT_ICON: Record<AppointmentListItem['consultationType'], IoniconsIconName> = {
  IN_CLINIC: 'business-outline',
  VIDEO: 'videocam-outline',
  VOICE: 'call-outline',
};

function appointmentEnd(item: AppointmentListItem): number {
  return new Date(item.scheduledStartAtUtc).getTime() + item.durationMinutes * 60 * 1000;
}

function stillRelevantToday(item: AppointmentListItem, now: Date): boolean {
  return appointmentEnd(item) >= now.getTime() || isSameDay(item.scheduledStartAtUtc, now);
}

function appointmentBucket(item: AppointmentListItem, now: Date): CareBucket | null {
  switch (item.status) {
    case 'IN_PROGRESS':
      return 'live';
    case 'PAYMENT_PENDING':
      return 'attention';
    case 'PENDING':
      return stillRelevantToday(item, now) ? 'awaiting' : null;
    case 'CONFIRMED':
      return stillRelevantToday(item, now) ? 'scheduled' : null;
    default:
      return null;
  }
}

function appointmentLate(item: AppointmentListItem, now: Date): boolean {
  if (item.status !== 'CONFIRMED' && item.status !== 'PENDING') return false;
  return appointmentEnd(item) < now.getTime();
}

function labBucket(item: LabBookingListItem, now: Date): CareBucket | null {
  switch (item.status) {
    case 'ON_THE_WAY':
    case 'COLLECTOR_ASSIGNED':
      return isSameDay(item.scheduledAtUtc, now) ? 'live' : 'scheduled';
    case 'PAYMENT_PENDING':
      return 'attention';
    case 'PENDING':
      return 'awaiting';
    case 'CONFIRMED':
      return isSameDay(item.scheduledAtUtc, now) || new Date(item.scheduledAtUtc).getTime() >= now.getTime() ? 'scheduled' : null;
    case 'SAMPLE_COLLECTED':
    case 'PROCESSING':
      return 'tracking';
    default:
      return null;
  }
}

function labLate(item: LabBookingListItem, now: Date): boolean {
  if (item.status !== 'CONFIRMED' && item.status !== 'PENDING') return false;
  if (!isSameDay(item.scheduledAtUtc, now)) return false;
  return new Date(item.scheduledAtUtc).getTime() + LAB_LATE_GRACE_MS < now.getTime();
}

function fromAppointment(item: AppointmentListItem, bucket: CareBucket, now: Date): CareItem {
  return {
    key: `appointment-${item.id}`,
    kind: 'APPOINTMENT',
    id: item.id,
    title: item.doctorName,
    subtitle: item.doctorSpecialization,
    scheduledAt: item.scheduledStartAtUtc,
    modeLabel: CONSULT_LABEL[item.consultationType],
    modeIcon: CONSULT_ICON[item.consultationType],
    remote: item.consultationType !== 'IN_CLINIC',
    bucket,
    late: appointmentLate(item, now),
    appointmentStatus: item.status,
  };
}

function fromLabBooking(item: LabBookingListItem, bucket: CareBucket, now: Date): CareItem {
  const homeCollection = item.collectionMethod === 'HOME_COLLECTION';
  return {
    key: `lab-${item.id}`,
    kind: 'LAB',
    id: item.id,
    title: item.laboratoryName,
    subtitle: item.serviceNames.length > 0 ? item.serviceNames.join(', ') : null,
    scheduledAt: item.scheduledAtUtc,
    modeLabel: homeCollection ? 'Home collection' : 'Lab visit',
    modeIcon: homeCollection ? 'home-outline' : 'flask-outline',
    remote: false,
    bucket,
    late: labLate(item, now),
    labStatus: item.status,
  };
}

function byTime(a: CareItem, b: CareItem): number {
  return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
}

export function summarizeCare(appointments: AppointmentListItem[], bookings: LabBookingListItem[], now: Date = new Date()): CareSummary {
  const items: CareItem[] = [];
  appointments.forEach((item) => {
    const bucket = appointmentBucket(item, now);
    if (bucket) items.push(fromAppointment(item, bucket, now));
  });
  bookings.forEach((item) => {
    const bucket = labBucket(item, now);
    if (bucket) items.push(fromLabBooking(item, bucket, now));
  });
  items.sort(byTime);

  const live = items.filter((item) => item.bucket === 'live');
  const scheduled = items.filter((item) => item.bucket === 'scheduled');
  const tracking = items.filter((item) => item.bucket === 'tracking').reverse();
  const scheduledToday = scheduled.filter((item) => isSameDay(item.scheduledAt, now));
  const scheduledLater = scheduled.filter((item) => !isSameDay(item.scheduledAt, now));
  const laterPool = [...scheduledLater, ...tracking];

  return {
    attention: items.filter((item) => item.bucket === 'attention'),
    today: [...live, ...scheduledToday],
    upcoming: laterPool.slice(0, UPCOMING_LIMIT),
    awaiting: items.filter((item) => item.bucket === 'awaiting'),
    upcomingTotal: laterPool.length,
  };
}
