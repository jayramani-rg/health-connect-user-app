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
  appointmentStatus?: AppointmentStatus;
  labStatus?: LabBookingStatus;
}

export interface CareSummary {
  hero: CareItem | null;
  attention: CareItem[];
  today: CareItem[];
  upcoming: CareItem[];
  awaiting: CareItem[];
  upcomingTotal: number;
}

export const LAB_PROGRESS_STAGES = ['Booked', 'Sample collected', 'Processing', 'Report ready'];

const LAB_STAGE_INDEX: Partial<Record<LabBookingStatus, number>> = {
  CONFIRMED: 0,
  COLLECTOR_ASSIGNED: 0,
  ON_THE_WAY: 0,
  SAMPLE_COLLECTED: 1,
  PROCESSING: 2,
  REPORT_READY: 3,
};

export function labProgressIndex(status: LabBookingStatus): number | null {
  return LAB_STAGE_INDEX[status] ?? null;
}

const CONSULT_ICON: Record<AppointmentListItem['consultationType'], IoniconsIconName> = {
  IN_CLINIC: 'business-outline',
  VIDEO: 'videocam-outline',
  VOICE: 'call-outline',
};

function appointmentBucket(item: AppointmentListItem, now: Date): CareBucket | null {
  const start = new Date(item.scheduledStartAtUtc).getTime();
  const end = start + item.durationMinutes * 60 * 1000;
  switch (item.status) {
    case 'IN_PROGRESS':
      return 'live';
    case 'PAYMENT_PENDING':
    case 'RESCHEDULE_PROPOSED':
      return 'attention';
    case 'PENDING':
      return end >= now.getTime() ? 'awaiting' : null;
    case 'CONFIRMED':
      return end >= now.getTime() ? 'scheduled' : null;
    default:
      return null;
  }
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

function fromAppointment(item: AppointmentListItem, bucket: CareBucket): CareItem {
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
    appointmentStatus: item.status,
  };
}

function fromLabBooking(item: LabBookingListItem, bucket: CareBucket): CareItem {
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
    if (bucket) items.push(fromAppointment(item, bucket));
  });
  bookings.forEach((item) => {
    const bucket = labBucket(item, now);
    if (bucket) items.push(fromLabBooking(item, bucket));
  });
  items.sort(byTime);

  const live = items.filter((item) => item.bucket === 'live');
  const scheduled = items.filter((item) => item.bucket === 'scheduled');
  const tracking = items.filter((item) => item.bucket === 'tracking').reverse();
  const scheduledToday = scheduled.filter((item) => isSameDay(item.scheduledAt, now));
  const scheduledLater = scheduled.filter((item) => !isSameDay(item.scheduledAt, now));

  const hero = live[0] ?? scheduledToday[0] ?? scheduledLater[0] ?? tracking[0] ?? null;
  const notHero = (item: CareItem) => item.key !== hero?.key;

  const today = [...live, ...scheduledToday].filter(notHero);
  const laterPool = [...scheduledLater, ...tracking].filter(notHero);

  return {
    hero,
    attention: items.filter((item) => item.bucket === 'attention'),
    today,
    upcoming: laterPool.slice(0, 3),
    awaiting: items.filter((item) => item.bucket === 'awaiting'),
    upcomingTotal: laterPool.length,
  };
}

export function heroEyebrow(item: CareItem, now: Date = new Date()): string {
  if (item.bucket === 'live') return item.kind === 'LAB' ? 'Collection today' : 'Happening now';
  if (item.bucket === 'tracking') return 'Tracking your sample';
  if (isSameDay(item.scheduledAt, now)) return 'Today';
  return 'Up next';
}
