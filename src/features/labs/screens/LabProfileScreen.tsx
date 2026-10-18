import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button/Button';
import { EmptyCard } from '../../../components/EmptyCard/EmptyCard';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { FilterChips } from '../../../components/FilterChips/FilterChips';
import { Icon } from '../../../components/Icon/Icon';
import { ProviderHero, type ProviderHeroChip } from '../../../components/ProviderHero/ProviderHero';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SectionHeader } from '../../../components/SectionHeader/SectionHeader';
import { SkeletonBlock, SkeletonCard } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors } from '../../../theme';
import { haptics } from '../../../utils/haptics';
import { formatFee } from '../../../utils/providerFormat';
import { labService } from '../../../services/labService';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabDetail, LaboratoryServiceItem } from '../types/lab.types';
import { useChatCta } from '../../chat/hooks/useChatCta';
import { useProfileGate } from '../../profile/hooks/useProfileGate';
import { ProfileGateDialog } from '../../profile/components/ProfileGateDialog';
import { styles } from '../styles/LabProfileScreen.styles';
import { getErrorMessage } from '../../../utils/errors';

type Props = NativeStackScreenProps<RootStackParamList, 'LabProfile'>;

const ALL = '__all__';

function effectivePrice(service: LaboratoryServiceItem): number {
  return service.discountPrice != null && service.discountPrice < service.price ? service.discountPrice : service.price;
}

function reportLabel(hours: number): string | null {
  if (!hours) return null;
  if (hours < 24) return `Report in ${hours}h`;
  const days = Math.round(hours / 24);
  return `Report in ${days} ${days === 1 ? 'day' : 'days'}`;
}

const LabProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { laboratoryId } = route.params;
  const [lab, setLab] = useState<LabDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>(ALL);
  const chatCta = useChatCta('LABORATORY', laboratoryId);
  const { runWithProfileGate, dialogVisible, handleCompleteProfile, handleDismissGate } = useProfileGate();

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await labService.getById(laboratoryId);
      setLab(response.data);
    } catch (error) {
      setErrorText(getErrorMessage(error, 'Could not load this lab.'));
    } finally {
      setLoading(false);
    }
  }, [laboratoryId]);

  useEffect(() => {
    load();
  }, [load]);

  const activeServices = useMemo(() => (lab?.services ?? []).filter((s) => s.isActive), [lab]);
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    activeServices.forEach((s) => counts.set(s.category, (counts.get(s.category) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [activeServices]);
  const visibleServices = category === ALL ? activeServices : activeServices.filter((s) => s.category === category);

  function toggle(id: string) {
    haptics.selection();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <ScreenContainer variant="page">
        <SkeletonCard />
        <View style={styles.skeletonRow}>
          <SkeletonBlock width="48%" height={76} radius={16} />
          <SkeletonBlock width="48%" height={76} radius={16} />
        </View>
        <SkeletonBlock width="40%" height={16} />
        <SkeletonBlock width="100%" height={68} radius={16} />
        <SkeletonBlock width="100%" height={68} radius={16} />
      </ScreenContainer>
    );
  }

  if (!lab) {
    return (
      <ScreenContainer variant="page">
        <EmptyState title="Could not load this lab" description={errorText ?? 'Please try again.'} actionLabel="Try again" onActionPress={load} />
      </ScreenContainer>
    );
  }

  const selectedServices = activeServices.filter((s) => selectedIds.has(s.id));
  const selectedTotal = selectedServices.reduce((sum, s) => sum + effectivePrice(s), 0);
  const chatConversationId = chatCta.state.kind === 'chat' ? chatCta.state.conversationId : null;
  const address = [lab.address, lab.locality, lab.city].filter(Boolean).join(', ') + (lab.pincode ? ` ${lab.pincode}` : '');
  const offersLabVisit = activeServices.some((s) => s.labVisitEnabled);
  const offersHome = lab.homeCollectionEnabled && activeServices.some((s) => s.homeCollectionEnabled);
  const startingPrice = activeServices.length > 0 ? Math.min(...activeServices.map(effectivePrice)) : null;

  const chips: ProviderHeroChip[] = [];
  if (!lab.isAcceptingBookings) chips.push({ icon: 'pause-circle-outline', label: 'Not taking bookings', tone: 'warning' });
  if (offersHome) chips.push({ icon: 'home-outline', label: 'Home collection', tone: 'brand' });
  if (offersLabVisit) chips.push({ icon: 'business-outline', label: 'Lab visit' });
  if (startingPrice != null) chips.push({ icon: 'pricetag-outline', label: `Tests from ${formatFee(startingPrice)}` });

  const footer = (
    <View style={styles.footer}>
      <View style={styles.footerText}>
        <Text style={styles.footerTotal}>{selectedServices.length > 0 ? formatFee(selectedTotal) : 'Select tests'}</Text>
        <Text style={styles.footerMeta} numberOfLines={1}>
          {selectedServices.length > 0 ? `${selectedServices.length} ${selectedServices.length === 1 ? 'test' : 'tests'} selected` : `${activeServices.length} tests available`}
        </Text>
      </View>
      <View style={styles.footerCta}>
        <Button
          label={lab.isAcceptingBookings ? 'Continue' : 'Unavailable'}
          disabled={selectedServices.length === 0 || !lab.isAcceptingBookings}
          onPress={() => runWithProfileGate(() => navigation.navigate('BookLabService', { laboratoryId, serviceIds: selectedServices.map((s) => s.id) }))}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer variant="page" footer={footer}>
      <ProviderHero
        name={lab.name}
        imageUrl={lab.photoUrl}
        shape="rounded"
        fallbackIcon="flask-outline"
        verified={lab.isVerified}
        title="Diagnostic laboratory"
        subtitle={address}
        meta={lab.operatingHours ? `Open ${lab.operatingHours}` : null}
        chips={chips}
      />

      <SectionHeader title="Collection options" style={styles.section} />
      <View style={styles.optionRow}>
        <View style={[styles.optionCard, !offersLabVisit && styles.optionCardOff]}>
          <Icon name="business-outline" size={18} color={offersLabVisit ? colors.brand : colors.textTertiary} />
          <Text style={[styles.optionTitle, !offersLabVisit && styles.optionOff]}>Lab visit</Text>
          <Text style={styles.optionMeta}>{offersLabVisit ? 'Give your sample at the lab' : 'Not offered'}</Text>
        </View>
        <View style={[styles.optionCard, !offersHome && styles.optionCardOff]}>
          <Icon name="home-outline" size={18} color={offersHome ? colors.brand : colors.textTertiary} />
          <Text style={[styles.optionTitle, !offersHome && styles.optionOff]}>Home collection</Text>
          <Text style={styles.optionMeta}>
            {offersHome ? (lab.homeCollectionFee ? `${formatFee(lab.homeCollectionFee)} visit fee` : 'No visit fee') : 'Not offered'}
          </Text>
        </View>
      </View>

      <SectionHeader title="Tests and packages" meta={`${activeServices.length}`} style={styles.section} />
      {categories.length > 1 ? (
        <FilterChips
          options={[{ label: 'All', value: ALL, count: activeServices.length }, ...categories.map(([name, count]) => ({ label: name, value: name, count }))]}
          value={category}
          onChange={setCategory}
          accessibilityLabel="Filter tests by category"
        />
      ) : null}

      {visibleServices.length === 0 ? (
        <EmptyCard icon="flask-outline" title="No tests listed yet" description="This laboratory has not published any tests." />
      ) : (
        <View style={styles.list}>
          {visibleServices.map((service, index) => {
            const selected = selectedIds.has(service.id);
            const price = effectivePrice(service);
            const discounted = price < service.price;
            const meta = [service.sampleType, reportLabel(service.estimatedReportHours)].filter(Boolean).join(' · ');
            return (
              <Pressable
                key={service.id}
                onPress={() => toggle(service.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${service.name}, ${formatFee(price)}`}
                style={({ pressed }) => [styles.row, index > 0 && styles.rowDivider, selected && styles.rowSelected, pressed && styles.rowPressed]}
              >
                <View style={[styles.checkbox, selected && styles.checkboxOn]}>{selected ? <Icon name="checkmark" size={13} color={colors.white} /> : null}</View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{service.name}</Text>
                  {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
                  <View style={styles.tags}>
                    {service.homeCollectionEnabled && lab.homeCollectionEnabled ? <Text style={styles.tag}>Home</Text> : null}
                    {service.labVisitEnabled ? <Text style={styles.tag}>Lab visit</Text> : null}
                  </View>
                </View>
                <View style={styles.priceCol}>
                  <Text style={styles.price}>{formatFee(price)}</Text>
                  {discounted ? <Text style={styles.strike}>{formatFee(service.price)}</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.hint}>You will pick a date, time and collection method on the next step.</Text>

      <View style={styles.chatCard}>
        <Icon name="chatbubbles-outline" size={18} color={colors.brand} />
        <Text style={styles.chatText}>{chatCta.state.kind === 'pending' ? 'Chat invitation sent. Waiting for a reply.' : 'Questions about a test?'}</Text>
        {chatCta.state.kind === 'invite' ? (
          <Button label="Message" variant="secondary" onPress={() => runWithProfileGate(chatCta.sendInvitation)} style={styles.chatButton} />
        ) : chatCta.state.kind === 'sending' ? (
          <Button label="Sending" variant="secondary" disabled loading onPress={() => undefined} style={styles.chatButton} />
        ) : chatConversationId ? (
          <Button label="Open chat" variant="secondary" onPress={() => navigation.navigate('ChatConversation', { conversationId: chatConversationId })} style={styles.chatButton} />
        ) : null}
      </View>

      <ProfileGateDialog visible={dialogVisible} onComplete={handleCompleteProfile} onDismiss={handleDismissGate} />
    </ScreenContainer>
  );
};

export default LabProfileScreen;
