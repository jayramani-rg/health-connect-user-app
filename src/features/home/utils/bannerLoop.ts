export interface LoopSlide<T> {
  key: string;
  item: T;
}

export function buildLoopSlides<T extends { id: string }>(items: T[]): LoopSlide<T>[] {
  const slides = items.map(item => ({ key: item.id, item }));
  if (items.length < 2) return slides;
  return [{ key: `clone-last-${items[items.length - 1].id}`, item: items[items.length - 1] }, ...slides, { key: `clone-first-${items[0].id}`, item: items[0] }];
}

export function firstPage(count: number): number {
  return count > 1 ? 1 : 0;
}

export function realIndexForPage(page: number, count: number): number {
  if (count < 2) return Math.max(0, Math.min(page, count - 1));
  return (((page - 1) % count) + count) % count;
}

export function wrapPage(page: number, count: number): number | null {
  if (count < 2) return null;
  if (page <= 0) return count;
  if (page >= count + 1) return 1;
  return null;
}

export function pageForOffset(offset: number, step: number, count: number): number {
  if (step <= 0) return firstPage(count);
  const maxPage = count > 1 ? count + 1 : Math.max(0, count - 1);
  return Math.max(0, Math.min(maxPage, Math.round(offset / step)));
}
