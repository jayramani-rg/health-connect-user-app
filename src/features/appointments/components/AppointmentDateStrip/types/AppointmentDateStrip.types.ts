import type { DayAvailabilityStatus } from '../../../types/appointment.types';

export interface AppointmentDateStripProps {
  days: Date[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  counts: Record<string, number>;
  dayStatuses: Record<string, DayAvailabilityStatus>;
  countsLoaded: boolean;
  countsFailed: boolean;
}
