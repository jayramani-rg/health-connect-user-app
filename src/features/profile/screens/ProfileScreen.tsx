import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { DateField } from '../../../components/DateField/DateField';
import { TextField } from '../../../components/TextField/TextField';
import { colors, typography } from '../../../theme';
import { useAppDispatch, updateUserProfile } from '../../../store';
import { profileService } from '../../../services/profileService';
import type { RootStackParamList } from '../../../navigation/types';
import type { PatientGender } from '../../patients/types/patient.types';
import { styles } from '../styles/ProfileScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const GENDER_OPTIONS = [
  { label: 'Female', value: 'FEMALE' },
  { label: 'Male', value: 'MALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
];

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ label: v, value: v }));

const MAX_DOB = new Date();
const MIN_DOB = new Date(MAX_DOB.getFullYear() - 120, MAX_DOB.getMonth(), MAX_DOB.getDate());

const ProfileScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergyDetails, setAllergyDetails] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const profileRes = await profileService.getMyProfile();
        const p = profileRes.data;
        setFirstName(p.firstName ?? '');
        setLastName(p.lastName ?? '');
        setGender(p.gender ?? '');
        setDob(p.dob ?? '');
        setBloodGroup(p.bloodGroup ?? '');
        setAllergyDetails(p.allergyDetails ?? '');
        setChronicConditions(p.chronicConditions ?? '');
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'Could not load your profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const valid = firstName.trim().length > 0 && lastName.trim().length > 0;

  async function handleSave() {
    if (!valid || saving) return;
    setSaving(true);
    setErrorText(null);
    setSuccessText(null);
    try {
      const response = await profileService.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: (gender as PatientGender) || undefined,
        dob: dob || undefined,
        bloodGroup: bloodGroup || undefined,
        allergyDetails: allergyDetails.trim() || undefined,
        chronicConditions: chronicConditions.trim() || undefined,
      });
      dispatch(
        updateUserProfile({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          isProfileComplete: response.data.isProfileComplete,
        }),
      );
      setSuccessText('Profile updated.');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {errorText && <Banner variant="error" message={errorText} />}
      {successText && <Banner variant="success" message={successText} />}

      <View style={styles.sectionCard}>
        <Text style={[typography.title, { color: colors.ink }]}>Personal information</Text>
        <TextField label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
        <TextField label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
        <ChipGroup label="Gender" options={GENDER_OPTIONS} value={gender} onChange={(v) => setGender(v as string)} />
        <DateField label="Date of birth" value={dob} onChange={setDob} maximumDate={MAX_DOB} minimumDate={MIN_DOB} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={[typography.title, { color: colors.ink }]}>Health information</Text>
        <ChipGroup label="Blood group" options={BLOOD_GROUP_OPTIONS} value={bloodGroup} onChange={(v) => setBloodGroup(v as string)} />
        <TextField label="Allergies (optional)" value={allergyDetails} onChangeText={setAllergyDetails} multiline placeholder="e.g. Penicillin" />
        <TextField
          label="Chronic conditions (optional)"
          value={chronicConditions}
          onChangeText={setChronicConditions}
          multiline
          placeholder="e.g. Diabetes"
        />
      </View>

      <View style={styles.saveBar}>
        <Button label="Save changes" onPress={handleSave} loading={saving} disabled={!valid} />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
