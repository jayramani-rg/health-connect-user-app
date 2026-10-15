import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { images } from '../../../assets/images';
import { Avatar } from '../../../components/Avatar/Avatar';
import { Button } from '../../../components/Button/Button';
import { Icon, type IoniconsIconName } from '../../../components/Icon/Icon';
import { LabStatusBadge } from '../../../components/LabStatusBadge/LabStatusBadge';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import { colors } from '../../../theme';
import { LAB_PROGRESS_STAGES, formatWhen, heroEyebrow, labProgressIndex, type CareItem } from '../utils/careActivity';
import { styles } from '../styles/CareCards.styles';

function CareBadge({ item }: { item: CareItem }) {
  if (item.appointmentStatus) return <StatusBadge status={item.appointmentStatus} />;
  if (item.labStatus) return <LabStatusBadge status={item.labStatus} />;
  return null;
}

function Fact({ icon, label }: { icon: IoniconsIconName; label: string }) {
  return (
    <View style={styles.fact}>
      <Icon name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.factText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function LabProgress({ index }: { index: number }) {
  return (
    <View style={styles.progress} accessible accessibilityLabel={`Step ${index + 1} of ${LAB_PROGRESS_STAGES.length}, ${LAB_PROGRESS_STAGES[index]}`}>
      <View style={styles.progressTrack}>
        {LAB_PROGRESS_STAGES.map((stage, stageIndex) => (
          <View key={stage} style={[styles.progressSegment, stageIndex <= index && styles.progressSegmentDone]} />
        ))}
      </View>
      <Text style={styles.progressText}>
        Step {index + 1} of {LAB_PROGRESS_STAGES.length} · {LAB_PROGRESS_STAGES[index]}
      </Text>
    </View>
  );
}

interface UpNextCardProps {
  item: CareItem;
  actionLabel: string;
  onOpen: () => void;
  onAction: () => void;
}

export function UpNextCard({ item, actionLabel, onOpen, onAction }: UpNextCardProps) {
  const progressIndex = item.labStatus ? labProgressIndex(item.labStatus) : null;
  const live = item.bucket === 'live';

  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowDot, live && styles.eyebrowDotLive]} />
          <Text style={[styles.eyebrow, live && styles.eyebrowLive]} numberOfLines={1}>
            {heroEyebrow(item)}
          </Text>
        </View>
        <CareBadge item={item} />
      </View>

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${formatWhen(item.scheduledAt)}, ${item.modeLabel}`}
        accessibilityHint="Opens booking details"
        style={({ pressed }) => [styles.identity, pressed && styles.pressed]}
      >
        {item.kind === 'APPOINTMENT' ? (
          <Avatar name={item.title} size={48} />
        ) : (
          <View style={[styles.heroIcon, styles.iconLab]}>
            <Icon name="flask-outline" size={22} color={colors.accentStrong} />
          </View>
        )}
        <View style={styles.identityText}>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.heroSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>
        <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
      </Pressable>

      <View style={styles.facts}>
        <Fact icon="calendar-outline" label={formatWhen(item.scheduledAt)} />
        <Fact icon={item.modeIcon} label={item.modeLabel} />
      </View>

      {progressIndex !== null ? <LabProgress index={progressIndex} /> : null}

      <Button label={actionLabel} onPress={onAction} fullWidth />
    </View>
  );
}

interface CareRowProps {
  item: CareItem;
  onPress: () => void;
}

export function CareRow({ item, onPress }: CareRowProps) {
  const lab = item.kind === 'LAB';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${formatWhen(item.scheduledAt)}, ${item.modeLabel}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.rowIcon, lab ? styles.iconLab : styles.iconDoctor]}>
        <Icon name={item.modeIcon} size={18} color={lab ? colors.accentStrong : colors.brand} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {formatWhen(item.scheduledAt)} · {item.modeLabel}
        </Text>
      </View>
      <CareBadge item={item} />
    </Pressable>
  );
}

const SERVICE_ART = {
  doctor: images.findDoctor,
  lab: images.bookLabTest,
};

interface ServiceTileProps {
  title: string;
  tone: 'doctor' | 'lab';
  onPress: () => void;
}

export function ServiceTile({ title, tone, onPress }: ServiceTileProps) {
  const lab = tone === 'lab';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.tile, lab ? styles.tileLab : styles.tileDoctor, pressed && styles.tilePressed]}
    >
      <Text style={styles.tileTitle} numberOfLines={2}>
        {title}
      </Text>
      <View style={[styles.tileArrow, lab ? styles.tileArrowLab : styles.tileArrowDoctor]}>
        <Icon name="arrow-forward" size={16} color={colors.white} />
      </View>
      <Image source={SERVICE_ART[tone]} style={styles.tileArt} resizeMode="contain" accessibilityIgnoresInvertColors />
    </Pressable>
  );
}
