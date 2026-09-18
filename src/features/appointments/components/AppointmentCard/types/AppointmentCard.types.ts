import type { AppointmentListItem } from '../../../types/appointment.types';

export interface AppointmentCardProps {
  appointment: AppointmentListItem;
  onPress: () => void;
}
