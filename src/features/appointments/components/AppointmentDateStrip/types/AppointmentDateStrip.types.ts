export interface AppointmentDateStripProps {
  days: Date[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  counts: Record<string, number>;
  countsFailed: boolean;
}
