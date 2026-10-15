import type { DoctorListItem } from '../../../types/doctor.types';

export interface DoctorCardProps {
  doctor: DoctorListItem;
  onPress: () => void;
  onBook?: () => void;
  showNextMode?: boolean;
}
