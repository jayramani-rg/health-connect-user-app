const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatFee(value: number): string {
  const whole = Math.round(value).toString();
  if (whole.length <= 3) return `₹${whole}`;
  const lastThree = whole.slice(-3);
  const rest = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${lastThree}`;
}

export function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatNextAvailable(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS);
  const time = formatSlotTime(iso);
  if (dayDiff <= 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Tomorrow, ${time}`;
  return `${date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`;
}

export function isToday(iso: string, now: Date = new Date()): boolean {
  return startOfDay(new Date(iso)) === startOfDay(now);
}

export function joinArea(locality: string | null | undefined, city: string | null | undefined): string {
  return [locality, city].filter((part) => !!part && part.trim().length > 0).join(', ');
}
