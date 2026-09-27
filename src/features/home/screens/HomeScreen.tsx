import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Avatar } from '../../../components/Avatar/Avatar';
import { Banner } from '../../../components/Banner/Banner';
import { CategoryGrid } from '../../../components/CategoryGrid/CategoryGrid';
import { ChatListItem } from '../../../components/ChatListItem/ChatListItem';
import { Icon } from '../../../components/Icon/Icon';
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import { SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import { TAB_BAR_CLEARANCE } from '../../../components/FloatingTabBar/styles/FloatingTabBar.styles';
import { colors } from '../../../theme';
import { useAppSelector } from '../../../store';
import { activeopacity } from '../../../utils/helpers';
import { appointmentService } from '../../../services/appointmentService';
import { chatService } from '../../../services/chatService';
import { labBookingService } from '../../../services/labBookingService';
import { profileService } from '../../../services/profileService';
import { specializationCategoryService, type ApprovedSpecializationCategory } from '../../../services/specializationCategoryService';
import type { RootStackParamList } from '../../../navigation/types';
import { CONSULT_LABEL } from '../../appointments/utils/consultationType';
import type { AppointmentListItem } from '../../appointments/types/appointment.types';
import type { ChatConversationListItem } from '../../chat/types/chat.types';
import type { LabBookingListItem } from '../../labBookings/types/labBooking.types';
import { ASSETS_BASE_URL } from '../../../config/env';
import { styles } from '../styles/HomeScreen.styles';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isConnected = useAppSelector((state) => state.networkData.isConnected);
  const authUser = useAppSelector((state) => state.authData.user);
  const unreadNotifications = useAppSelector((state) => state.notificationsData.unreadCount);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<ApprovedSpecializationCategory[]>([]);
  const [upcoming, setUpcoming] = useState<AppointmentListItem | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [chats, setChats] = useState<ChatConversationListItem[]>([]);
  const [reports, setReports] = useState<LabBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService
      .getMyProfile()
      .then((res) => setAvatarUrl(res.data.profilePhotoUrl ? `${ASSETS_BASE_URL}${res.data.profilePhotoUrl}` : null))
      .catch(() => {});
    specializationCategoryService
      .getApproved()
      .then((res) => setCategories(res.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      const [confirmedRes, pendingRes, chatsRes, reportsRes] = await Promise.all([
        appointmentService.list({ status: 'CONFIRMED', pageSize: 1 }),
        appointmentService.list({ status: 'PENDING', pageSize: 1 }),
        chatService.listConversations(),
        labBookingService.list({ status: 'REPORT_READY', pageSize: 3 }),
      ]);
      setUpcoming(confirmedRes.data.items[0] ?? null);
      setPendingCount(pendingRes.data.totalCount);
      setChats(chatsRes.data.slice(0, 2));
      setReports(reportsRes.data.items);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function goToProfile() {
    navigation.navigate('MainTabs', { screen: 'Profile' });
  }

  const firstName = authUser?.firstName?.trim() || 'there';
  const fullName = [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: TAB_BAR_CLEARANCE }}>
        <View style={styles.greetingRow}>
          <TouchableOpacity activeOpacity={activeopacity} onPress={goToProfile}>
            <Avatar name={fullName} imageUrl={avatarUrl} size={48} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={activeopacity} style={styles.greetingTextWrap} onPress={goToProfile}>
            <Text style={styles.greeting}>Hi, {firstName}</Text>
            <Text style={styles.subGreeting}>Here's what's next for your care.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={activeopacity}
            style={styles.bellButton}
            onPress={() => navigation.navigate('NotificationCenter')}
          >
            <Icon name="notifications-outline" size={22} color={colors.ink} />
            {unreadNotifications > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 24 }}>
          <SearchBar value="" onChangeText={() => {}} placeholder="Search doctors by name or specialization" onPress={() => navigation.navigate('DoctorList', {})} />
        </View>

        {pendingCount > 0 && (
          <Banner variant="info" message={`You have ${pendingCount} appointment request${pendingCount > 1 ? 's' : ''} awaiting a response.`} />
        )}

        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <>
            {categories.length > 0 && (
              <View style={styles.categoryStrip}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Browse by specialization</Text>
                  <TouchableOpacity activeOpacity={activeopacity} onPress={() => navigation.navigate('DoctorCategories')}>
                    <Text style={styles.linkText}>See all</Text>
                  </TouchableOpacity>
                </View>
                <CategoryGrid
                  categories={categories}
                  variant="strip"
                  onSelect={(category) => navigation.navigate('DoctorList', { specialization: category.name })}
                />
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity activeOpacity={activeopacity} style={styles.actionCard} onPress={() => navigation.navigate('DoctorCategories')}>
                <View style={styles.actionIconWrap}>
                  <Icon name="medkit" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionTitle}>Find a doctor</Text>
                <Text style={styles.actionSubtitle}>By specialization or type</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={activeopacity} style={styles.actionCard} onPress={() => navigation.navigate('LabCategories')}>
                <View style={styles.actionIconWrap}>
                  <Icon name="flask" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionTitle}>Book a lab test</Text>
                <Text style={styles.actionSubtitle}>Visit or home collection</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Upcoming appointment</Text>
              <TouchableOpacity activeOpacity={activeopacity} onPress={() => navigation.navigate('MainTabs', { screen: 'Appointments' })}>
                <Text style={styles.linkText}>View all</Text>
              </TouchableOpacity>
            </View>

            {upcoming ? (
              <TouchableOpacity
                activeOpacity={activeopacity}
                style={styles.card}
                onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: upcoming.id })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardTitle}>{upcoming.doctorName}</Text>
                  <StatusBadge status={upcoming.status} />
                </View>
                <Text style={styles.cardSubtitle}>
                  {CONSULT_LABEL[upcoming.consultationType]} ·{' '}
                  {new Date(upcoming.scheduledStartAtUtc).toLocaleString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyCard}>No upcoming appointments yet.</Text>
              </View>
            )}

            {reports.length > 0 && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent reports</Text>
                  <TouchableOpacity
                    activeOpacity={activeopacity}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Appointments', params: { initialMode: 'LAB' } })}
                  >
                    <Text style={styles.linkText}>View all</Text>
                  </TouchableOpacity>
                </View>
                {reports.map((booking) => (
                  <TouchableOpacity
                    key={booking.id}
                    activeOpacity={activeopacity}
                    style={styles.reportCard}
                    onPress={() => navigation.navigate('LabBookingDetail', { bookingId: booking.id })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={styles.reportIconWrap}>
                        <Icon name="document-text" size={18} color={colors.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {booking.serviceNames.join(', ')}
                        </Text>
                        <Text style={styles.cardSubtitle}>{booking.laboratoryName}</Text>
                      </View>
                    </View>
                    <Icon name="chevron-forward" size={18} color={colors.inkFaint} />
                  </TouchableOpacity>
                ))}
              </>
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Active chats</Text>
              <TouchableOpacity activeOpacity={activeopacity} onPress={() => navigation.navigate('ChatList')}>
                <Text style={styles.linkText}>View all</Text>
              </TouchableOpacity>
            </View>

            {chats.length > 0 ? (
              <View style={styles.chatListCard}>
                {chats.map((chat, index) => (
                  <View key={chat.id}>
                    {index > 0 && <View style={styles.chatSeparator} />}
                    <ChatListItem conversation={chat} onPress={() => navigation.navigate('ChatConversation', { conversationId: chat.id })} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyCard}>No chats yet. Start one from a doctor or lab profile.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      {!isConnected && <Text style={styles.offlineBanner}>You are offline</Text>}
    </SafeAreaView>
  );
};

export default HomeScreen;
