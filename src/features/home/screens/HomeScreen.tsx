import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CategoryGrid } from '../../../components/CategoryGrid/CategoryGrid';
import { COMPACT_COLUMNS, ROUND_AVATAR_OUTER } from '../../../components/CategoryGrid/styles/CategoryGrid.styles';
import { EmptyCard } from '../../../components/EmptyCard/EmptyCard';
import { Icon } from '../../../components/Icon/Icon';
import { IconButton } from '../../../components/IconButton/IconButton';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import { SectionHeader } from '../../../components/SectionHeader/SectionHeader';
import { SkeletonBlock } from '../../../components/SkeletonLoader/SkeletonLoader';
import { useTabBarInset, useTabBarOverlayOffset } from '../../../components/FloatingTabBar/useTabBarInset';
import { colors, layout } from '../../../theme';
import { useAppSelector } from '../../../store';
import { appointmentService } from '../../../services/appointmentService';
import { labBookingService } from '../../../services/labBookingService';
import { specializationCategoryService, type ApprovedSpecializationCategory } from '../../../services/specializationCategoryService';
import type { RootStackParamList } from '../../../navigation/types';
import { LocalityChip } from '../../location/components/LocalityChip';
import { LocationPromptCard } from '../../location/components/LocationPromptCard';
import { useUserLocality } from '../../location/hooks/useUserLocality';
import { bannerService } from '../../../services/bannerService';
import { AttentionCard, CareGroupHeader, CareRow, RequestRow, ServiceTile, TimelineRow } from '../components/CareCards';
import { HomeBanners } from '../components/HomeBanners';
import type { HomeBanner } from '../types/banner.types';
import type { BannerRoute } from '../utils/bannerNavigation';
import { summarizeCare, type CareItem, type CareSummary } from '../utils/careActivity';
import { CARE_SEARCH_HINTS } from '../utils/careSearchHints';
import { styles } from '../styles/HomeScreen.styles';

const HOME_CATEGORY_LIMIT = COMPACT_COLUMNS * 2;
const LOOKBACK_LAB_MS = 14 * 24 * 60 * 60 * 1000;

type CareState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; summary: CareSummary };

let sessionBanners: HomeBanner[] | null = null;

function greetingForHour(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function needsPayment(item: CareItem): boolean {
  return item.appointmentStatus === 'PAYMENT_PENDING' || item.labStatus === 'PAYMENT_PENDING';
}

function attentionAction(item: CareItem): { label: string; hint: string } {
  if (needsPayment(item)) {
    return { label: 'Pay now', hint: item.kind === 'APPOINTMENT' ? 'Complete payment to confirm your visit' : 'Complete payment to confirm your booking' };
  }
  return { label: 'View details', hint: 'Open the booking to continue' };
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isConnected = useAppSelector((state) => state.networkData.isConnected);
  const authUser = useAppSelector((state) => state.authData.user);
  const unreadNotifications = useAppSelector((state) => state.notificationsData.unreadCount);
  const bottomInset = useTabBarInset();
  const overlayOffset = useTabBarOverlayOffset();

  const [categories, setCategories] = useState<ApprovedSpecializationCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [care, setCare] = useState<CareState>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<HomeBanner[]>(sessionBanners ?? []);
  const [bannersLoading, setBannersLoading] = useState(sessionBanners === null);
  const locality = useUserLocality();

  const loadBanners = useCallback(async () => {
    try {
      const response = await bannerService.getActive();
      sessionBanners = response.data;
      setBanners(response.data);
    } catch {
      if (sessionBanners === null) sessionBanners = [];
    } finally {
      setBannersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const openBannerRoute = useCallback(
    (route: BannerRoute) => {
      const navigate = navigation.navigate as (name: BannerRoute['name'], params?: object) => void;
      navigate(route.name, 'params' in route ? route.params : undefined);
    },
    [navigation],
  );
  const refreshOnMount = useRef(locality.refreshQuietly);

  useEffect(() => {
    refreshOnMount.current();
  }, []);

  useEffect(() => {
    specializationCategoryService
      .getApproved()
      .then((res) => {
        setCategories(res.data.slice(0, HOME_CATEGORY_LIMIT));
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  const loadCare = useCallback(async () => {
    const now = Date.now();
    try {
      const [appointmentsRes, bookingsRes] = await Promise.all([
        appointmentService.list({ dateFromUtc: startOfToday().toISOString(), pageSize: 50 }),
        labBookingService.list({ dateFromUtc: new Date(now - LOOKBACK_LAB_MS).toISOString(), pageSize: 50 }),
      ]);
      setCare({ status: 'ready', summary: summarizeCare(appointmentsRes.data.items, bookingsRes.data.items) });
    } catch {
      setCare((previous) => (previous.status === 'ready' ? previous : { status: 'error' }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCare();
    }, [loadCare]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([loadCare(), loadBanners()]);
    setRefreshing(false);
  }

  function openItem(item: CareItem) {
    if (item.kind === 'APPOINTMENT') {
      navigation.navigate('AppointmentDetail', { appointmentId: item.id });
    } else {
      navigation.navigate('LabBookingDetail', { bookingId: item.id });
    }
  }

  function runPrimaryAction(item: CareItem) {
    if (needsPayment(item)) {
      navigation.navigate('PaymentSummary', { kind: item.kind === 'APPOINTMENT' ? 'APPOINTMENT' : 'LAB_BOOKING', bookingId: item.id });
      return;
    }
    openItem(item);
  }

  function openAppointmentsTab(mode?: 'DOCTOR' | 'LAB') {
    navigation.navigate('MainTabs', { screen: 'Appointments', params: mode ? { initialMode: mode } : undefined });
  }

  const firstName = authUser?.firstName?.trim() || 'there';

  function renderCare() {
    if (care.status === 'loading') {
      return <SkeletonBlock width="100%" height={152} radius={layout.cardRadius} />;
    }
    if (care.status === 'error') {
      return (
        <EmptyCard
          icon="cloud-offline-outline"
          title="Couldn't load your bookings"
          description="Check your connection and try again."
          actionLabel="Try again"
          onActionPress={() => {
            setCare({ status: 'loading' });
            loadCare();
          }}
        />
      );
    }

    const { attention, today, upcoming, awaiting, upcomingTotal } = care.summary;
    const nothingActive = attention.length === 0 && today.length === 0 && upcoming.length === 0 && awaiting.length === 0;

    if (nothingActive) {
      return (
        <EmptyCard
          icon="calendar-clear-outline"
          title="No upcoming visits"
        />
      );
    }

    return (
      <View style={styles.careList}>
        {attention.length > 0 ? (
          <View style={styles.careGroup}>
            <CareGroupHeader title="Needs your attention" icon="alert-circle" iconColor={colors.warning} meta={`${attention.length}`} />
            <View style={styles.attentionStack}>
              {attention.map((item) => {
                const action = attentionAction(item);
                return (
                  <AttentionCard
                    key={item.key}
                    item={item}
                    actionLabel={action.label}
                    hint={action.hint}
                    onOpen={() => openItem(item)}
                    onAction={() => runPrimaryAction(item)}
                  />
                );
              })}
            </View>
          </View>
        ) : null}

        {today.length > 0 ? (
          <View style={styles.careGroup}>
            <CareGroupHeader title="Today" icon="today-outline" iconColor={colors.brand} meta={todayLabel()} />
            <View style={styles.careCard}>
              {today.map((item, index) => (
                <TimelineRow key={item.key} item={item} first={index === 0} last={index === today.length - 1} onPress={() => openItem(item)} />
              ))}
            </View>
          </View>
        ) : null}

        {upcoming.length > 0 ? (
          <View style={styles.careGroup}>
            <CareGroupHeader
              title="Coming up"
              icon="calendar-outline"
              actionLabel={upcomingTotal > upcoming.length ? 'See all' : undefined}
              onActionPress={() => openAppointmentsTab()}
            />
            <View style={styles.careCard}>
              {upcoming.map((item, index) => (
                <React.Fragment key={item.key}>
                  {index > 0 ? <View style={styles.careDivider} /> : null}
                  <CareRow item={item} onPress={() => openItem(item)} />
                </React.Fragment>
              ))}
            </View>
          </View>
        ) : null}

        {awaiting.length > 0 ? (
          <View style={styles.careGroup}>
            <CareGroupHeader title="Awaiting confirmation" icon="hourglass-outline" iconColor={colors.pending} meta={`${awaiting.length}`} />
            <View style={styles.requestCard}>
              {awaiting.map((item, index) => (
                <React.Fragment key={item.key}>
                  {index > 0 ? <View style={styles.careDivider} /> : null}
                  <RequestRow item={item} onPress={() => openItem(item)} />
                </React.Fragment>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand} colors={[colors.brand]} />}
      >
        <View style={styles.intro}>
          <PageHeader
            eyebrow={greetingForHour()}
            title={firstName}
            subtitle={
              <View style={styles.localityWrap}>
                <LocalityChip label={locality.label} onPress={() => navigation.navigate('SelectLocation')} />
              </View>
            }
            actions={<IconButton icon="notifications-outline" accessibilityLabel="Notifications" badge={unreadNotifications} onPress={() => navigation.navigate('NotificationCenter')} />}
          />

          {locality.shouldShowPrompt && (
            <LocationPromptCard loading={locality.detecting} onEnable={() => locality.enableAndDetect()} onDismiss={locality.dismissPrompt} />
          )}

          <SearchBar value="" onChangeText={() => {}} placeholder="Search doctors and labs" placeholderHints={CARE_SEARCH_HINTS} onPress={() => navigation.navigate('DoctorList', {})} />
        </View>

        <HomeBanners banners={banners} loading={bannersLoading} onNavigate={openBannerRoute} />

        <View style={styles.section}>
          <SectionHeader title="Book care" size="large" />
          <View style={styles.serviceRow}>
            <ServiceTile tone="doctor" title="Find a doctor" onPress={() => navigation.navigate('DoctorCategories')} />
            <ServiceTile tone="lab" title="Book a lab test" onPress={() => navigation.navigate('LabCategories')} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Find by specialization" size="large" />
          {loadingCategories ? (
            <View style={styles.categorySkeleton}>
              {Array.from({ length: HOME_CATEGORY_LIMIT }).map((_, index) => (
                <View key={index} style={styles.categorySkeletonTile}>
                  <SkeletonBlock width={ROUND_AVATAR_OUTER} height={ROUND_AVATAR_OUTER} radius={ROUND_AVATAR_OUTER / 2} />
                  <SkeletonBlock width={52} height={10} />
                </View>
              ))}
            </View>
          ) : categories.length > 0 ? (
            <CategoryGrid
              categories={categories}
              variant="compact"
              onSelect={(category) => navigation.navigate('DoctorList', { specialization: category.name })}
            />
          ) : null}
          {!loadingCategories ? (
            <Pressable
              onPress={() => (categories.length > 0 ? navigation.navigate('DoctorCategories') : navigation.navigate('DoctorList', {}))}
              accessibilityRole="button"
              accessibilityLabel={categories.length > 0 ? 'View all specializations' : 'View all doctors'}
              style={({ pressed }) => [styles.viewAllButton, pressed && styles.viewAllButtonPressed]}
            >
              <Text style={styles.viewAllText}>{categories.length > 0 ? 'View all specializations' : 'View all doctors'}</Text>
              <Icon name="arrow-forward" size={18} color={colors.brand} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Your care" size="large" />
          {renderCare()}
        </View>
      </ScrollView>
      {!isConnected && <Text style={[styles.offlineBanner, { bottom: overlayOffset }]}>You are offline</Text>}
    </SafeAreaView>
  );
};

export default HomeScreen;
