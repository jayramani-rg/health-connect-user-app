export interface DateStripProps {
  /** yyyy-MM-dd, in the doctor's local calendar (UI-only — slot times themselves are UTC). */
  selectedDate: string;
  onSelectDate: (date: string) => void;
  daysCount?: number;
}
