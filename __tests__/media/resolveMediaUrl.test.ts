import { ASSETS_BASE_URL } from '../../src/config/env';
import { resolveMediaUrl } from '../../src/utils/media';

describe('resolveMediaUrl', () => {
  it('prefixes server relative upload paths with the assets host', () => {
    expect(resolveMediaUrl('/profile-photos/c53cf065.jpg')).toBe(`${ASSETS_BASE_URL}/profile-photos/c53cf065.jpg`);
    expect(resolveMediaUrl('profile-photos/c53cf065.jpg')).toBe(`${ASSETS_BASE_URL}/profile-photos/c53cf065.jpg`);
  });

  it('keeps absolute and local URIs unchanged', () => {
    expect(resolveMediaUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(resolveMediaUrl(`${ASSETS_BASE_URL}/profile-photos/x.png`)).toBe(`${ASSETS_BASE_URL}/profile-photos/x.png`);
    expect(resolveMediaUrl('file:///data/user/0/photo.jpg')).toBe('file:///data/user/0/photo.jpg');
  });

  it('treats empty values as no image', () => {
    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl(undefined)).toBeNull();
    expect(resolveMediaUrl('   ')).toBeNull();
  });

  it('never produces a double host or double slash', () => {
    const url = resolveMediaUrl('/category-images/a.png')!;
    expect(url.split('://').length).toBe(2);
    expect(url.replace('://', '').includes('//')).toBe(false);
  });
});
