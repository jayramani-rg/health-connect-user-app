import React, { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button/Button';
import { TextField } from '../../../components/TextField/TextField';
import { DateField } from '../../../components/DateField/DateField';
import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { Banner } from '../../../components/Banner/Banner';
import { profileService } from '../../../services/profileService';
import { hasPendingProfileAction, consumePendingProfileAction } from '../../profile/profileGate';
import { useAppDispatch, completeOnboarding, updateUserProfile } from '../../../store';
import type { NormalizedError } from '../../../types/common.types';
import type { PatientGender } from '../../patients/types/patient.types';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/ProfileBasicsScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileBasics'>;

const GENDER_OPTIONS = [
  { label: 'Female', value: 'FEMALE' },
  { label: 'Male', value: 'MALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
];

const MAX_DOB = new Date();
const MIN_DOB = new Date(MAX_DOB.getFullYear() - 120, MAX_DOB.getMonth(), MAX_DOB.getDate());

export default function ProfileBasicsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // A gate-triggered visit (booking/chat blocked on an incomplete profile) must not offer a way out —
  // "Skip" only makes sense for the optional post-registration onboarding visit.
  const canSkip = !hasPendingProfileAction();
  const valid = firstName.trim().length > 0 && lastName.trim().length > 0;

  function finishWithoutSaving() {
    dispatch(completeOnboarding());
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }

  async function handleSave() {
    if (!valid || loading) return;
    setLoading(true);
    setError('');
    try {
      const response = await profileService.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: (gender as PatientGender) || undefined,
        dob: dob || undefined,
      });
      dispatch(
        updateUserProfile({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          isProfileComplete: response.data.isProfileComplete,
        }),
      );
      dispatch(completeOnboarding());

      const pending = consumePendingProfileAction();
      if (pending) {
        navigation.goBack();
        pending();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }
    } catch (err) {
      setError((err as NormalizedError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>A few details</Text>
        {canSkip && (
          <Text style={styles.skipLink} onPress={finishWithoutSaving}>
            Skip
          </Text>
        )}
      </View>
      <Text style={styles.subtitle}>
        {canSkip
          ? 'Helps doctors and labs address you correctly. You can do this later in your profile.'
          : 'Please add your first and last name to continue — this is required before booking or starting a chat.'}
      </Text>
      <TextField label="First name" value={firstName} onChangeText={setFirstName} placeholder="Ananya" autoCapitalize="words" />
      <TextField label="Last name" value={lastName} onChangeText={setLastName} placeholder="Sharma" autoCapitalize="words" />
      <ChipGroup label="Gender (optional)" options={GENDER_OPTIONS} value={gender} onChange={(v) => setGender(v as string)} />
      <DateField label="Date of birth (optional)" value={dob} onChange={setDob} maximumDate={MAX_DOB} minimumDate={MIN_DOB} />
      {error ? <Banner variant="error" message={error} /> : null}
      <View style={styles.footer}>
        <Button label="Save and continue" onPress={handleSave} disabled={!valid} loading={loading} />
      </View>
    </ScreenContainer>
  );
}
