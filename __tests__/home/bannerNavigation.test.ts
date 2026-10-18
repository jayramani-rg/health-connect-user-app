import { resolveBannerAction, safeExternalUrl } from '../../src/features/home/utils/bannerNavigation';
import type { BannerDestination } from '../../src/features/home/types/banner.types';

const ID = '3f2b8a52-6d0e-4c8a-9a51-1c2d3e4f5a6b';

function internal(target: string, param: string | null = null): BannerDestination {
  return { type: 'INTERNAL', internalTarget: target, internalParam: param, externalUrl: null };
}

function external(url: string | null): BannerDestination {
  return { type: 'EXTERNAL', internalTarget: null, internalParam: null, externalUrl: url };
}

describe('resolveBannerAction', () => {
  it('maps every supported screen to a known route', () => {
    expect(resolveBannerAction(internal('DOCTOR_CATEGORIES'))).toEqual({ kind: 'navigate', route: { name: 'DoctorCategories' } });
    expect(resolveBannerAction(internal('DOCTOR_LIST', 'Cardiology'))).toEqual({ kind: 'navigate', route: { name: 'DoctorList', params: { specialization: 'Cardiology' } } });
    expect(resolveBannerAction(internal('DOCTOR_LIST'))).toEqual({ kind: 'navigate', route: { name: 'DoctorList', params: {} } });
    expect(resolveBannerAction(internal('DOCTOR_PROFILE', ID))).toEqual({ kind: 'navigate', route: { name: 'DoctorProfile', params: { doctorProfileId: ID } } });
    expect(resolveBannerAction(internal('LAB_CATEGORIES'))).toEqual({ kind: 'navigate', route: { name: 'LabCategories' } });
    expect(resolveBannerAction(internal('LAB_LIST', 'Blood tests'))).toEqual({ kind: 'navigate', route: { name: 'LabList', params: { category: 'Blood tests' } } });
    expect(resolveBannerAction(internal('LAB_PROFILE', ID))).toEqual({ kind: 'navigate', route: { name: 'LabProfile', params: { laboratoryId: ID } } });
    expect(resolveBannerAction(internal('APPOINTMENTS'))).toEqual({ kind: 'navigate', route: { name: 'MainTabs', params: { screen: 'Appointments' } } });
    expect(resolveBannerAction(internal('HELP_SUPPORT'))).toEqual({ kind: 'navigate', route: { name: 'HelpSupport' } });
  });

  it('never executes unknown route strings', () => {
    expect(resolveBannerAction(internal('Settings'))).toEqual({ kind: 'none' });
    expect(resolveBannerAction(internal('PaymentSummary', ID))).toEqual({ kind: 'none' });
    expect(resolveBannerAction(internal(''))).toEqual({ kind: 'none' });
  });

  it('rejects malformed profile ids', () => {
    expect(resolveBannerAction(internal('DOCTOR_PROFILE', 'abc'))).toEqual({ kind: 'none' });
    expect(resolveBannerAction(internal('LAB_PROFILE', null))).toEqual({ kind: 'none' });
  });

  it('drops suspicious category names but keeps the screen', () => {
    expect(resolveBannerAction(internal('DOCTOR_LIST', '<script>'))).toEqual({ kind: 'navigate', route: { name: 'DoctorList', params: {} } });
  });

  it('opens only public https links', () => {
    expect(resolveBannerAction(external('https://carova.example/offers?id=1'))).toEqual({ kind: 'open-url', url: 'https://carova.example/offers?id=1' });
    expect(resolveBannerAction(external('javascript:alert(1)'))).toEqual({ kind: 'none' });
    expect(resolveBannerAction(external('http://carova.example'))).toEqual({ kind: 'none' });
    expect(resolveBannerAction(external(null))).toEqual({ kind: 'none' });
  });

  it('treats a missing or empty destination as not tappable', () => {
    expect(resolveBannerAction(undefined)).toEqual({ kind: 'none' });
    expect(resolveBannerAction({ type: 'NONE', internalTarget: null, internalParam: null, externalUrl: null })).toEqual({ kind: 'none' });
  });
});

describe('safeExternalUrl', () => {
  it.each([
    'https://user:pass@carova.example/',
    'https://carova.example:8443/',
    'https://localhost/',
    'https://10.0.0.1/',
    'https://intranet/',
    'https://carova.example/a b',
    'intent://scan/#Intent;scheme=zxing;end',
  ])('rejects %s', (url) => {
    expect(safeExternalUrl(url)).toBeNull();
  });
});
