import type { ConsultationType } from '../types/appointment.types';

export const CONSULT_LABEL: Record<ConsultationType, string> = {
  IN_CLINIC: 'In-clinic',
  VIDEO: 'Video call',
  VOICE: 'Voice call',
};
