import { buildLoopSlides, firstPage, pageForOffset, realIndexForPage, wrapPage } from '../../src/features/home/utils/bannerLoop';

const banners = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('bannerLoop', () => {
  it('adds one clone at each edge only when there is more than one banner', () => {
    expect(buildLoopSlides(banners).map(slide => slide.item.id)).toEqual(['c', 'a', 'b', 'c', 'a']);
    expect(new Set(buildLoopSlides(banners).map(slide => slide.key)).size).toBe(5);
    expect(buildLoopSlides([{ id: 'a' }]).map(slide => slide.key)).toEqual(['a']);
    expect(buildLoopSlides([])).toEqual([]);
  });

  it('starts on the first real banner', () => {
    expect(firstPage(3)).toBe(1);
    expect(firstPage(1)).toBe(0);
    expect(realIndexForPage(firstPage(3), 3)).toBe(0);
  });

  it('maps clone pages to the matching real banner', () => {
    expect(realIndexForPage(0, 3)).toBe(2);
    expect(realIndexForPage(3, 3)).toBe(2);
    expect(realIndexForPage(4, 3)).toBe(0);
  });

  it('wraps forward from the trailing clone to the first banner without going backwards', () => {
    expect(wrapPage(4, 3)).toBe(1);
    expect(wrapPage(0, 3)).toBe(3);
    expect(wrapPage(2, 3)).toBeNull();
    expect(wrapPage(0, 1)).toBeNull();
  });

  it('rounds and clamps scroll offsets to pages', () => {
    expect(pageForOffset(0, 100, 3)).toBe(0);
    expect(pageForOffset(149, 100, 3)).toBe(1);
    expect(pageForOffset(10_000, 100, 3)).toBe(4);
    expect(pageForOffset(50, 0, 3)).toBe(1);
  });

  it('runs a full forward cycle that returns to the start', () => {
    let page = firstPage(3);
    const seen: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      page += 1;
      page = wrapPage(page, 3) ?? page;
      seen.push(realIndexForPage(page, 3));
    }
    expect(seen).toEqual([1, 2, 0, 1, 2, 0]);
  });
});
