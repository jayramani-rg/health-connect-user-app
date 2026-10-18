import type { BannerDestination } from '../types/banner.types';

export type BannerRoute =
  | { name: 'DoctorCategories' }
  | { name: 'DoctorList'; params: { specialization?: string } }
  | { name: 'DoctorProfile'; params: { doctorProfileId: string } }
  | { name: 'LabCategories' }
  | { name: 'LabList'; params: { category?: string } | undefined }
  | { name: 'LabProfile'; params: { laboratoryId: string } }
  | { name: 'MainTabs'; params: { screen: 'Appointments' } }
  | { name: 'HelpSupport' };

export type BannerAction = { kind: 'navigate'; route: BannerRoute } | { kind: 'open-url'; url: string } | { kind: 'none' };

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME = /^[\p{L}\p{N} &/().,'-]{1,100}$/u;

function safeName(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed && NAME.test(trimmed) ? trimmed : undefined;
}

export function safeExternalUrl(value: string | null): string | null {
  if (!value || /\s/.test(value)) return null;
  const match = /^https:\/\/([^/?#]+)(?:[/?#].*)?$/i.exec(value);
  if (!match) return null;
  const host = match[1].toLowerCase();
  if (host.includes('@') || host.includes(':') || host === 'localhost' || !host.includes('.') || /^[\d.]+$/.test(host)) return null;
  return value;
}

export function resolveBannerAction(destination: BannerDestination | null | undefined): BannerAction {
  if (!destination) return { kind: 'none' };

  if (destination.type === 'EXTERNAL') {
    const url = safeExternalUrl(destination.externalUrl);
    return url ? { kind: 'open-url', url } : { kind: 'none' };
  }

  if (destination.type !== 'INTERNAL') return { kind: 'none' };

  const param = destination.internalParam;
  switch (destination.internalTarget) {
    case 'DOCTOR_CATEGORIES':
      return { kind: 'navigate', route: { name: 'DoctorCategories' } };
    case 'DOCTOR_LIST': {
      const specialization = safeName(param);
      return { kind: 'navigate', route: { name: 'DoctorList', params: specialization ? { specialization } : {} } };
    }
    case 'DOCTOR_PROFILE':
      return param && GUID.test(param) ? { kind: 'navigate', route: { name: 'DoctorProfile', params: { doctorProfileId: param } } } : { kind: 'none' };
    case 'LAB_CATEGORIES':
      return { kind: 'navigate', route: { name: 'LabCategories' } };
    case 'LAB_LIST': {
      const category = safeName(param);
      return { kind: 'navigate', route: { name: 'LabList', params: category ? { category } : undefined } };
    }
    case 'LAB_PROFILE':
      return param && GUID.test(param) ? { kind: 'navigate', route: { name: 'LabProfile', params: { laboratoryId: param } } } : { kind: 'none' };
    case 'APPOINTMENTS':
      return { kind: 'navigate', route: { name: 'MainTabs', params: { screen: 'Appointments' } } };
    case 'HELP_SUPPORT':
      return { kind: 'navigate', route: { name: 'HelpSupport' } };
    default:
      return { kind: 'none' };
  }
}
