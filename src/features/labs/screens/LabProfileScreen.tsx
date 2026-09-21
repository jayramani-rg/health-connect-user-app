import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Icon } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors, radius } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { ASSETS_BASE_URL } from '../../../config/env';
import { labService } from '../../../services/labService';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabDetail } from '../types/lab.types';
import { useChatCta } from '../../chat/hooks/useChatCta';
import { useProfileGate } from '../../profile/hooks/useProfileGate';
import { ProfileGateDialog } from '../../profile/components/ProfileGateDialog';
import { styles } from '../styles/LabProfileScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'LabProfile'>;

const LabProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { laboratoryId } = route.params;
  const [lab, setLab] = useState<LabDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [imageFailed, setImageFailed] = useState(false);
  const chatCta = useChatCta('LABORATORY', laboratoryId);
  const { runWithProfileGate, dialogVisible, handleCompleteProfile, handleDismissGate } = useProfileGate();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await labService.getById(laboratoryId);
        if (active) setLab(response.data);
      } catch (error) {
        if (active) setErrorText(error instanceof Error ? error.message : 'Could not load this lab.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [laboratoryId]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!lab) {
    return (
      <ScreenContainer>
        <Banner variant="error" message={errorText ?? 'Lab not found.'} />
      </ScreenContainer>
    );
  }

  const selectedTotal = lab.services
    .filter((s) => selectedIds.has(s.id))
    .reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);
  const chatConversationId = chatCta.state.kind === 'chat' ? chatCta.state.conversationId : null;
  const showImage = !!lab.photoUrl && !imageFailed;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          {showImage ? (
            <Image
              source={{ uri: `${ASSETS_BASE_URL}${lab.photoUrl}` }}
              style={{ width: '100%', height: '100%', borderRadius: radius.lg }}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Icon name="flask" size={28} color={colors.brand} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{lab.name}</Text>
          <Text style={styles.address}>
            {lab.address}, {lab.city}, {lab.state} {lab.pincode}
          </Text>
          {lab.operatingHours && <Text style={styles.operatingHours}>Open {lab.operatingHours}</Text>}
        </View>
      </View>

      {!lab.isAcceptingBookings && <Banner variant="warning" message="This lab is not accepting new bookings right now." />}

      <Text style={styles.sectionTitle}>Tests & Packages</Text>
      {lab.services.map((service) => {
        const selected = selectedIds.has(service.id);
        const hasDiscount = service.discountPrice !== null && service.discountPrice < service.price;
        return (
          <TouchableOpacity
            key={service.id}
            activeOpacity={activeopacity}
            style={[styles.serviceCard, selected && styles.serviceCardSelected]}
            onPress={() => toggle(service.id)}
          >
            <View style={styles.serviceTopRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{service.category}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.servicePrice}>₹{hasDiscount ? service.discountPrice : service.price}</Text>
                {hasDiscount && <Text style={styles.serviceStrikePrice}>₹{service.price}</Text>}
              </View>
            </View>
            {service.estimatedReportHours ? (
              <View style={styles.metaRow}>
                <Icon name="time-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>Report in ~{service.estimatedReportHours}h</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}

      <View style={styles.footer}>
        <Button
          label={selectedIds.size > 0 ? `Continue with ${selectedIds.size} selected (₹${selectedTotal})` : 'Select at least one test'}
          disabled={selectedIds.size === 0 || !lab.isAcceptingBookings}
          onPress={() =>
            runWithProfileGate(() => navigation.navigate('BookLabService', { laboratoryId, serviceIds: Array.from(selectedIds) }))
          }
        />
        {chatCta.state.kind === 'invite' && (
          <Button label="Chat with laboratory" variant="secondary" onPress={() => runWithProfileGate(chatCta.sendInvitation)} />
        )}
        {chatCta.state.kind === 'sending' && <Button label="Sending invitation…" variant="secondary" disabled onPress={() => {}} />}
        {chatCta.state.kind === 'pending' && <Button label="Invitation sent — waiting for reply" variant="ghost" disabled onPress={() => {}} />}
        {chatConversationId && (
          <Button label="Open chat" variant="secondary" onPress={() => navigation.navigate('ChatConversation', { conversationId: chatConversationId })} />
        )}
      </View>

      <ProfileGateDialog visible={dialogVisible} onComplete={handleCompleteProfile} onDismiss={handleDismissGate} />
    </ScreenContainer>
  );
};

export default LabProfileScreen;
