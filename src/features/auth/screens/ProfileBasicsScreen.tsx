import React, { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button/Button';
import { TextField } from '../../../components/TextField/TextField';
import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { useAppDispatch, completeOnboarding } from '../../../store';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/ProfileBasicsScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileBasics'>;

const GENDER_OPTIONS = [
  { label: 'Female', value: 'FEMALE' },
  { label: 'Male', value: 'MALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
];

export default function ProfileBasicsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  function finish() {
    dispatch(completeOnboarding());
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>A few details</Text>
        <Text style={styles.skipLink} onPress={finish}>
          Skip
        </Text>
      </View>
      <Text style={styles.subtitle}>Helps doctors and labs address you correctly. You can do this later in your profile.</Text>
      <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Ananya Sharma" />
      <ChipGroup label="Gender" options={GENDER_OPTIONS} value={gender} onChange={(v) => setGender(v as string)} />
      <TextField label="Date of birth" value={dob} onChangeText={setDob} placeholder="DD / MM / YYYY" keyboardType="number-pad" />
      <View style={styles.footer}>
        <Button label="Save and continue" onPress={finish} />
      </View>
    </ScreenContainer>
  );
}
