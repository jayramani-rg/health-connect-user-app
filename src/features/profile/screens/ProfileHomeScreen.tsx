import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Avatar } from '../../../components/Avatar/Avatar';
import { Card } from '../../../components/Card/Card';
import { ConfirmSheet } from '../../../components/ConfirmSheet/ConfirmSheet';
import type { ConfirmSheetAction } from '../../../components/ConfirmSheet/types/ConfirmSheet.types';
import { Icon, type IoniconsIconName } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors, spacing, typography } from '../../../theme';
import { ASSETS_BASE_URL } from '../../../config/env';
import { useAppDispatch, useAppSelector, logout } from '../../../store';
import { authService } from '../../../services/authService';
import { dependentService } from '../../../services/dependentService';
import { profileService } from '../../../services/profileService';
import type { RootStackParamList } from '../../../navigation/types';

type Sheet = 'none' | 'photo' | 'logout';

export default function ProfileHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.authData.user);
  const refreshToken = useAppSelector((state) => state.authData.tokens?.refreshToken ?? null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [familyCount, setFamilyCount] = useState(0);
  const [activeSheet, setActiveSheet] = useState<Sheet>('none');

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, dependentsRes] = await Promise.all([profileService.getMyProfile(), dependentService.listMine()]);
        setPhotoUrl(profileRes.data.profilePhotoUrl ?? null);
        setFamilyCount(dependentsRes.data.length);
      } catch {
        // Non-critical for the hub — the menu still works without the photo/count.
      }
    })();
  }, []);

  async function handlePickPhoto() {
    setActiveSheet('none');
    const picked = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 });
    if (picked.didCancel || !picked.assets || picked.assets.length === 0) return;
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
      // Non-critical — the hub still works, the user can retry from the same avatar tap.
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
      // Non-critical — the hub still works, the user can retry from the same avatar tap.
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

  const fullName = [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') || 'Your profile';

  const photoActions: ConfirmSheetAction[] = [
    { label: 'Choose new photo', variant: 'secondary', onPress: handlePickPhoto },
    { label: 'Remove photo', variant: 'destructive', onPress: handleRemovePhoto },
    { label: 'Cancel', variant: 'ghost', onPress: () => setActiveSheet('none') },
  ];

  const menu: { icon: IoniconsIconName; title: string; subtitle?: string; onPress: () => void }[] = [
    { icon: 'person-outline', title: 'Edit profile', subtitle: 'Personal & health information', onPress: () => navigation.navigate('EditProfile') },
    {
      icon: 'people-outline',
      title: 'Family members',
      subtitle: familyCount > 0 ? `${familyCount} added` : 'Book on behalf of family',
      onPress: () => navigation.navigate('FamilyMembers'),
    },
    { icon: 'settings-outline', title: 'Settings', onPress: () => navigation.navigate('Settings') },
    { icon: 'help-circle-outline', title: 'Help & support', onPress: () => navigation.navigate('HelpSupport') },
  ];

  return (
    <ScreenContainer tabBarInset>
      <View style={{ alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm }}>
        <Pressable onPress={handleAvatarPress} disabled={photoBusy} style={{ position: 'relative' }}>
          <Avatar name={fullName} imageUrl={photoUrl ? `${ASSETS_BASE_URL}${photoUrl}` : null} size={84} />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.primary,
              borderWidth: 2,
              borderColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {photoBusy ? <ActivityIndicator size="small" color={colors.white} /> : <Icon name="camera" size={14} color={colors.white} />}
          </View>
        </Pressable>
        <Text style={typography.h2}>{fullName}</Text>
        {authUser?.phone && <Text style={[typography.body, { color: colors.inkSoft }]}>{authUser.phone}</Text>}
        {authUser?.isPhoneVerified && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successSoft, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999 }}>
            <Icon name="checkmark-circle" size={13} color={colors.success} />
            <Text style={[typography.label, { color: colors.success }]}>Verified</Text>
          </View>
        )}
      </View>

      <View style={{ gap: spacing.sm }}>
        {menu.map((item) => (
          <Card key={item.title} variant="outline" elevation="none" onPress={item.onPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={item.icon} size={19} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyStrong}>{item.title}</Text>
                {item.subtitle && <Text style={[typography.caption, { color: colors.inkFaint }]}>{item.subtitle}</Text>}
              </View>
              <Icon name="chevron-forward" size={18} color={colors.inkFaint} />
            </View>
          </Card>
        ))}

        <Card variant="outline" elevation="none" onPress={() => setActiveSheet('logout')} style={{ marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
            <Icon name="log-out-outline" size={18} color={colors.error} />
            <Text style={[typography.bodyStrong, { color: colors.error }]}>Log out</Text>
          </View>
        </Card>
      </View>

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
          { label: 'Cancel', variant: 'secondary', onPress: () => setActiveSheet('none') },
          { label: 'Log out', variant: 'destructive', onPress: handleLogout },
        ]}
        onRequestClose={() => setActiveSheet('none')}
      />
    </ScreenContainer>
  );
}
