// features/home/screens/HomeScreen.tsx
// Premium dashboard: quick actions (find doctor / find lab), upcoming appointment, active chats,
// and pending-request status — kept to these, not overloaded with every feature in the app.

import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { ChatListItem } from '../../../components/ChatListItem/ChatListItem';
import { Icon } from '../../../components/Icon/Icon';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import { colors } from '../../../theme';
import { useAppSelector } from '../../../store';
import { activeopacity } from '../../../utils/helpers';
import { appointmentService } from '../../../services/appointmentService';
import { chatService } from '../../../services/chatService';
import type { RootStackParamList } from '../../../navigation/types';
import { CONSULT_LABEL } from '../../appointments/utils/consultationType';
import type { AppointmentListItem } from '../../appointments/types/appointment.types';
import type { ChatConversationListItem } from '../../chat/types/chat.types';
import { styles } from '../styles/HomeScreen.styles';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isConnected = useAppSelector((state) => state.networkData.isConnected);

  const [upcoming, setUpcoming] = useState<AppointmentListItem | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [chats, setChats] = useState<ChatConversationListItem[]>([]);

  const load = useCallback(async () => {
    try {
      const [confirmedRes, pendingRes, chatsRes] = await Promise.all([
        appointmentService.list({ status: 'CONFIRMED', pageSize: 1 }),
        appointmentService.list({ status: 'PENDING', pageSize: 1 }),
        chatService.listConversations(),
      ]);
      setUpcoming(confirmedRes.data.items[0] ?? null);
      setPendingCount(pendingRes.data.totalCount);
      setChats(chatsRes.data.slice(0, 2));
    } catch {
      // Dashboard is best-effort — the dedicated tabs surface real errors on demand.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.subGreeting}>Here's what's next for your care.</Text>

        {pendingCount > 0 && (
          <Banner variant="info" message={`You have ${pendingCount} appointment request${pendingCount > 1 ? 's' : ''} awaiting a response.`} />
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={activeopacity} style={styles.actionCard} onPress={() => navigation.navigate('DoctorCategories')}>
            <View style={styles.actionIconWrap}>
              <Icon name="medkit" size={22} color={colors.brand} />
            </View>
            <Text style={styles.actionTitle}>Find a doctor</Text>
            <Text style={styles.actionSubtitle}>By specialization or type</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={activeopacity} style={styles.actionCard} onPress={() => navigation.navigate('LabCategories')}>
            <View style={styles.actionIconWrap}>
              <Icon name="flask" size={22} color={colors.brand} />
            </View>
            <Text style={styles.actionTitle}>Book a lab test</Text>
            <Text style={styles.actionSubtitle}>Visit or home collection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming appointment</Text>
          <TouchableOpacity activeOpacity={activeopacity} onPress={() => navigation.navigate('MainTabs')}>
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

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active chats</Text>
          <TouchableOpacity activeOpacity={activeopacity} onPress={() => navigation.navigate('MainTabs')}>
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
      </ScrollView>
      {!isConnected && <Text style={styles.offlineBanner}>You are offline</Text>}
    </SafeAreaView>
  );
};

export default HomeScreen;
