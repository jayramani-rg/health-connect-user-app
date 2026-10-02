import { useCallback, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../../../store';
import type { RootStackParamList } from '../../../navigation/types';
import { setPendingProfileAction } from '../profileGate';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
