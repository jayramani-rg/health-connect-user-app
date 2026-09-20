export interface AppointmentDateStripProps {
  /** The dates to render, in order — index 0 is treated as "Today", index 1 as "Tomorrow". */
  days: Date[];
  /** yyyy-MM-dd, in the doctor's local (IST) calendar. */
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** dateKey -> real slot count from the backend. A missing key means the count hasn't loaded yet. */
  counts: Record<string, number>;
  /** True once the count-loading attempt has failed — cards show a neutral placeholder instead of a stale "Checking…". */
  countsFailed: boolean;
}
