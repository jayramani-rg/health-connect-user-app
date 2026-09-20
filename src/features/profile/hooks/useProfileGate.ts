import { useCallback, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../../../store';
import type { RootStackParamList } from '../../../navigation/types';
import { setPendingProfileAction } from '../profileGate';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Centralized guard for actions that require a completed profile (doctor/lab chat, doctor appointment
 * booking, lab slot booking). The backend's `isProfileComplete` flag — never derived locally — decides
 * whether the action runs immediately or a "Complete your profile" dialog interrupts it first. Accepting
 * the dialog resumes the exact same action once ProfileBasicsScreen saves successfully, so the caller
 * never has to be re-tapped manually.
 */
export function useProfileGate() {
  const isProfileComplete = useAppSelector((state) => state.authData.user?.isProfileComplete ?? false);
  const navigation = useNavigation<Nav>();
  const [dialogVisible, setDialogVisible] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);

  const runWithProfileGate = useCallback(
    (action: () => void) => {
      if (isProfileComplete) {
        action();
        return;
      }
      pendingRef.current = action;
      setDialogVisible(true);
    },
    [isProfileComplete],
  );

  const handleCompleteProfile = useCallback(() => {
    setDialogVisible(false);
    if (pendingRef.current) {
      setPendingProfileAction(pendingRef.current);
      pendingRef.current = null;
    }
    navigation.navigate('ProfileBasics');
  }, [navigation]);

  const handleDismissGate = useCallback(() => {
    setDialogVisible(false);
    pendingRef.current = null;
  }, []);

  return { runWithProfileGate, dialogVisible, handleCompleteProfile, handleDismissGate };
}
