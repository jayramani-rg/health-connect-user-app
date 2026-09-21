import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Avatar } from '../../../components/Avatar/Avatar';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { DateField } from '../../../components/DateField/DateField';
import { Icon } from '../../../components/Icon/Icon';
import { TextField } from '../../../components/TextField/TextField';
import { colors, spacing } from '../../../theme';
import { ASSETS_BASE_URL } from '../../../config/env';
import { useAppDispatch, useAppSelector, logout, updateUserProfile } from '../../../store';
import { authService } from '../../../services/authService';
import { dependentService } from '../../../services/dependentService';
import { profileService } from '../../../services/profileService';
import type { RootStackParamList } from '../../../navigation/types';
import type { PatientGender, PatientProfile } from '../../patients/types/patient.types';
import { styles } from '../styles/ProfileScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const GENDER_OPTIONS = [
  { label: 'Female', value: 'FEMALE' },
  { label: 'Male', value: 'MALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
];

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ label: v, value: v }));

const MAX_DOB = new Date();
const MIN_DOB = new Date(MAX_DOB.getFullYear() - 120, MAX_DOB.getMonth(), MAX_DOB.getDate());

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.authData.user);
  const refreshToken = useAppSelector((state) => state.authData.tokens?.refreshToken ?? null);

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [familyCount, setFamilyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
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
        const [profileRes, dependentsRes] = await Promise.all([profileService.getMyProfile(), dependentService.listMine()]);
        const p = profileRes.data;
        setProfile(p);
        setFirstName(p.firstName ?? '');
        setLastName(p.lastName ?? '');
        setGender(p.gender ?? '');
        setDob(p.dob ?? '');
        setBloodGroup(p.bloodGroup ?? '');
        setAllergyDetails(p.allergyDetails ?? '');
        setChronicConditions(p.chronicConditions ?? '');
        setFamilyCount(dependentsRes.data.length);
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
      setProfile(response.data);
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

  async function handlePickPhoto() {
    const picked = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 });
    if (picked.didCancel || !picked.assets || picked.assets.length === 0) return;
    const asset = picked.assets[0];
    if (!asset?.uri) return;

    setPhotoBusy(true);
    setErrorText(null);
    try {
      const response = await profileService.uploadMyPhoto({
        uri: asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        type: asset.type ?? 'image/jpeg',
      });
      setProfile(response.data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not upload your photo.');
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleChangePhoto() {
    if (photoBusy) return;
    if (!profile?.profilePhotoUrl) {
      handlePickPhoto();
      return;
    }
    Alert.alert('Profile photo', undefined, [
      { text: 'Choose new photo', onPress: handlePickPhoto },
      {
        text: 'Remove photo',
        style: 'destructive',
        onPress: async () => {
          setPhotoBusy(true);
          setErrorText(null);
          try {
            const response = await profileService.removeMyPhoto();
            setProfile(response.data);
          } catch (error) {
            setErrorText(error instanceof Error ? error.message : 'Could not remove your photo.');
          } finally {
            setPhotoBusy(false);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function confirmLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          authService.logout(refreshToken ?? undefined).catch(() => {});
          dispatch(logout());
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your profile';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleChangePhoto} disabled={photoBusy} style={styles.avatarWrap}>
          <Avatar name={fullName} imageUrl={profile?.profilePhotoUrl ? `${ASSETS_BASE_URL}${profile.profilePhotoUrl}` : null} size={72} />
          <View style={styles.avatarEditBadge}>
            {photoBusy ? <ActivityIndicator size="small" color={colors.white} /> : <Icon name="camera" size={13} color={colors.white} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{fullName}</Text>
        {authUser?.phone && <Text style={styles.phone}>{authUser.phone}</Text>}
        {authUser?.isPhoneVerified && (
          <View style={styles.verifiedPill}>
            <Icon name="checkmark-circle" size={13} color={colors.success} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {errorText && <Banner variant="error" message={errorText} />}
      {successText && <Banner variant="success" message={successText} />}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal information</Text>
        <TextField label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
        <TextField label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
        <ChipGroup label="Gender" options={GENDER_OPTIONS} value={gender} onChange={(v) => setGender(v as string)} />
        <DateField label="Date of birth" value={dob} onChange={setDob} maximumDate={MAX_DOB} minimumDate={MIN_DOB} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Health information</Text>
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

      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('FamilyMembers')} activeOpacity={0.7}>
        <View style={styles.linkRowLeft}>
          <Icon name="people-outline" size={20} color={colors.brand} />
          <View>
            <Text style={styles.linkTitle}>Family members</Text>
            <Text style={styles.linkSubtitle}>{familyCount > 0 ? `${familyCount} added` : 'Book on behalf of family'}</Text>
          </View>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutRow} onPress={confirmLogout} activeOpacity={0.7}>
        <Icon name="log-out-outline" size={18} color={colors.error} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;
