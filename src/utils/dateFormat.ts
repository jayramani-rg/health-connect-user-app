const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function isSameDay(iso: string, now: Date = new Date()): boolean {
  return startOfDay(new Date(iso)) === startOfDay(now);
}

export function formatWhen(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS);
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Tomorrow, ${time}`;
  if (dayDiff === -1) return `Yesterday, ${time}`;
  const sameYear = date.getFullYear() === now.getFullYear();
  const day = date.toLocaleDateString(undefined, sameYear ? { weekday: 'short', day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });
  return `${day}, ${time}`;
}
