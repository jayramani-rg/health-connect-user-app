import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Avatar } from '../../../components/Avatar/Avatar';
import { CategoryGrid } from '../../../components/CategoryGrid/CategoryGrid';
import { Icon, type IoniconsIconName } from '../../../components/Icon/Icon';
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import { SkeletonBlock } from '../../../components/SkeletonLoader/SkeletonLoader';
import { TAB_BAR_CLEARANCE } from '../../../components/FloatingTabBar/styles/FloatingTabBar.styles';
import { colors } from '../../../theme';
import { useAppSelector } from '../../../store';
import { activeopacity } from '../../../utils/helpers';
import { profileService } from '../../../services/profileService';
import { specializationCategoryService, type ApprovedSpecializationCategory } from '../../../services/specializationCategoryService';
import type { RootStackParamList } from '../../../navigation/types';
import { ASSETS_BASE_URL } from '../../../config/env';
import { LocalityChip } from '../../location/components/LocalityChip';
import { LocationPromptCard } from '../../location/components/LocationPromptCard';
import { useUserLocality } from '../../location/hooks/useUserLocality';
import { styles } from '../styles/HomeScreen.styles';

const HOME_CATEGORY_LIMIT = 8;

interface ServiceTileProps {
  icon: IoniconsIconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ServiceTile({ icon, title, subtitle, onPress }: ServiceTileProps) {
  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.serviceTile} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      <View style={styles.serviceTopRow}>
        <View style={styles.serviceIconWrap}>
          <Icon name={icon} size={22} color={colors.brand} />
        </View>
        <Icon name="arrow-forward" size={18} color={colors.brand} />
      </View>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isConnected = useAppSelector((state) => state.networkData.isConnected);
  const authUser = useAppSelector((state) => state.authData.user);
  const unreadNotifications = useAppSelector((state) => state.notificationsData.unreadCount);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<ApprovedSpecializationCategory[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const locality = useUserLocality();
  const refreshOnMount = useRef(locality.refreshQuietly);

  useEffect(() => {
    refreshOnMount.current();
  }, []);

  useEffect(() => {
    profileService
      .getMyProfile()
      .then((res) => setAvatarUrl(res.data.profilePhotoUrl ? `${ASSETS_BASE_URL}${res.data.profilePhotoUrl}` : null))
      .catch(() => {});
    specializationCategoryService
      .getApproved()
      .then((res) => {
        setCategories(res.data.slice(0, HOME_CATEGORY_LIMIT));
        setTotalCategories(res.data.length);
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  function goToProfile() {
    navigation.navigate('MainTabs', { screen: 'Profile' });
  }

  const firstName = authUser?.firstName?.trim() || 'there';
  const fullName = [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_CLEARANCE }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={activeopacity} onPress={goToProfile} accessibilityLabel="Open profile">
            <Avatar name={fullName} imageUrl={avatarUrl} size={44} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.greeting} numberOfLines={1}>
              Hi, {firstName}
            </Text>
            <LocalityChip label={locality.label} onPress={() => navigation.navigate('SelectLocation')} />
          </View>
          <TouchableOpacity
            activeOpacity={activeopacity}
            style={styles.bellButton}
            onPress={() => navigation.navigate('NotificationCenter')}
            accessibilityLabel="Notifications"
          >
            <Icon name="notifications-outline" size={22} color={colors.ink} />
            {unreadNotifications > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {locality.shouldShowPrompt && (
          <LocationPromptCard loading={locality.detecting} onEnable={() => locality.enableAndDetect()} onDismiss={locality.dismissPrompt} />
        )}

        <View style={styles.searchWrap}>
          <SearchBar value="" onChangeText={() => {}} placeholder="Search doctors by name or specialization" onPress={() => navigation.navigate('DoctorList', {})} />
        </View>

        <View style={styles.serviceRow}>
          <ServiceTile icon="medkit-outline" title="Find a doctor" subtitle="Clinic or online visit" onPress={() => navigation.navigate('DoctorCategories')} />
          <ServiceTile icon="flask-outline" title="Book lab test" subtitle="Lab visit or home pickup" onPress={() => navigation.navigate('LabCategories')} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Find by specialization</Text>
        </View>

        {loadingCategories ? (
          <View style={styles.categorySkeleton}>
            {Array.from({ length: HOME_CATEGORY_LIMIT }).map((_, index) => (
              <View key={index} style={styles.categorySkeletonTile}>
                <SkeletonBlock width={60} height={60} radius={30} />
                <SkeletonBlock width={52} height={10} />
              </View>
            ))}
          </View>
        ) : categories.length > 0 ? (
          <>
            <CategoryGrid
              categories={categories}
              variant="compact"
              onSelect={(category) => navigation.navigate('DoctorList', { specialization: category.name })}
            />
            {totalCategories > HOME_CATEGORY_LIMIT && (
              <TouchableOpacity
                activeOpacity={activeopacity}
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('DoctorCategories')}
                accessibilityRole="button"
              >
                <Text style={styles.viewAllText}>View all specializations</Text>
                <Icon name="chevron-forward" size={16} color={colors.brand} />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity activeOpacity={activeopacity} style={styles.viewAllButton} onPress={() => navigation.navigate('DoctorList', {})}>
            <Text style={styles.viewAllText}>Browse all doctors</Text>
            <Icon name="chevron-forward" size={16} color={colors.brand} />
          </TouchableOpacity>
        )}
      </ScrollView>
      {!isConnected && <Text style={styles.offlineBanner}>You are offline</Text>}
    </SafeAreaView>
  );
};

export default HomeScreen;
