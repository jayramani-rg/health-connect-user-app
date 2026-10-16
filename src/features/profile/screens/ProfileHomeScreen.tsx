import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Avatar } from '../../../components/Avatar/Avatar';
import { ConfirmSheet } from '../../../components/ConfirmSheet/ConfirmSheet';
import type { ConfirmSheetAction } from '../../../components/ConfirmSheet/types/ConfirmSheet.types';
import { Icon } from '../../../components/Icon/Icon';
import { ListGroup, ListRow } from '../../../components/ListGroup/ListGroup';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors } from '../../../theme';
import { ASSETS_BASE_URL } from '../../../config/env';
import { useAppDispatch, useAppSelector, logout } from '../../../store';
import { authService } from '../../../services/authService';
import { dependentService } from '../../../services/dependentService';
import { profileService } from '../../../services/profileService';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/ProfileHomeScreen.styles';

type Sheet = 'none' | 'photo' | 'logout';

export default function ProfileHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.authData.user);
  const refreshToken = useAppSelector(
    state => state.authData.tokens?.refreshToken ?? null,
  );

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [familyCount, setFamilyCount] = useState(0);
  const [activeSheet, setActiveSheet] = useState<Sheet>('none');

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, dependentsRes] = await Promise.all([
          profileService.getMyProfile(),
          dependentService.listMine(),
        ]);
        setPhotoUrl(profileRes.data.profilePhotoUrl ?? null);
        setFamilyCount(dependentsRes.data.length);
      } catch {}
    })();
  }, []);

  async function handlePickPhoto() {
    setActiveSheet('none');
    const picked = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });
    if (picked.didCancel || !picked.assets || picked.assets.length === 0)
      return;
    const asset = picked.assets[0];
    if (!asset?.uri) return;

    setPhotoBusy(true);
    try {
      const response = await profileService.uploadMyPhoto({
        uri: asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        type: asset.type ?? 'image/jpeg',
      });
      setPhotoUrl(response.data.profilePhotoUrl ?? null);
    } catch {
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleRemovePhoto() {
    setActiveSheet('none');
    setPhotoBusy(true);
    try {
      const response = await profileService.removeMyPhoto();
      setPhotoUrl(response.data.profilePhotoUrl ?? null);
    } catch {
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleAvatarPress() {
    if (photoBusy) return;
    if (!photoUrl) {
      handlePickPhoto();
      return;
    }
    setActiveSheet('photo');
  }

  function handleLogout() {
    setActiveSheet('none');
    authService.logout(refreshToken ?? undefined).catch(() => {});
    dispatch(logout());
  }

  const fullName =
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    'Your profile';

  const photoActions: ConfirmSheetAction[] = [
    {
      label: 'Choose new photo',
      variant: 'secondary',
      onPress: handlePickPhoto,
    },
    {
      label: 'Remove photo',
      variant: 'destructive',
      onPress: handleRemovePhoto,
    },
    {
      label: 'Cancel',
      variant: 'ghost',
      onPress: () => setActiveSheet('none'),
    },
  ];

  const verified = !!authUser?.isPhoneVerified;
  const profileComplete = authUser?.isProfileComplete ?? true;

  return (
    <ScreenContainer tabBarInset variant="page" style={styles.screen}>
      <View style={styles.top}>
        <PageHeader title="Profile" />

        <View style={styles.identityCard}>
          <Pressable
            onPress={handleAvatarPress}
            disabled={photoBusy}
            accessibilityRole="button"
            accessibilityLabel={
              photoUrl ? 'Change profile photo' : 'Add profile photo'
            }
            style={styles.avatarWrap}
          >
            <Avatar
              name={fullName}
              imageUrl={photoUrl ? `${ASSETS_BASE_URL}${photoUrl}` : null}
              size={64}
            />
            <View style={styles.avatarBadge}>
              {photoBusy ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="camera" size={13} color={colors.white} />
              )}
            </View>
          </Pressable>
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={2}>
              {fullName}
            </Text>
            {authUser?.phone ? (
              <View style={styles.phoneRow}>
                <Text style={styles.phone} numberOfLines={1}>
                  {authUser.phone}
                </Text>
                {verified ? (
                  <Icon
                    name="checkmark-circle"
                    size={15}
                    color={colors.success}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>
      </View>

      {!profileComplete ? (
        <ListGroup>
          <ListRow
            icon="alert-circle-outline"
            title="Complete your profile"
            onPress={() => navigation.navigate('ProfileBasics')}
          />
        </ListGroup>
      ) : null}

      <ListGroup title="Personal">
        <ListRow
          icon="person-outline"
          title="Personal information"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ListRow
          icon="people-outline"
          title="Family members"
          subtitle={
            familyCount > 0
              ? `${familyCount} added`
              : 'Book on behalf of family'
          }
          onPress={() => navigation.navigate('FamilyMembers')}
        />
        <ListRow
          icon="location-outline"
          title="Saved addresses"
          onPress={() => navigation.navigate('SavedAddresses')}
        />
      </ListGroup>

      <ListGroup title="Activity">
        <ListRow
          icon="call-outline"
          title="Call history"
          onPress={() => navigation.navigate('CallHistory')}
        />
      </ListGroup>

      <ListGroup title="Account">
        <ListRow
          icon="settings-outline"
          title="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <ListRow
          icon="help-circle-outline"
          title="Help & support"
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <ListRow
          icon="log-out-outline"
          title="Log out"
          tone="danger"
          onPress={() => setActiveSheet('logout')}
        />
      </ListGroup>

      <ConfirmSheet
        visible={activeSheet === 'photo'}
        title="Profile photo"
        message="Update or remove your profile photo."
        actions={photoActions}
        onRequestClose={() => setActiveSheet('none')}
      />
      <ConfirmSheet
        visible={activeSheet === 'logout'}
        title="Log out"
        message="Are you sure you want to log out?"
        actions={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onPress: () => setActiveSheet('none'),
          },
          { label: 'Log out', variant: 'destructive', onPress: handleLogout },
        ]}
        onRequestClose={() => setActiveSheet('none')}
      />
    </ScreenContainer>
  );
}
