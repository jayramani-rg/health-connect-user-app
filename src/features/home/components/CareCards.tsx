import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { images } from '../../../assets/images';
import { Icon } from '../../../components/Icon/Icon';
import { STATUS_META as LAB_STATUS_META } from '../../../components/LabStatusBadge/LabStatusBadge';
import { STATUS_META as APPOINTMENT_STATUS_META } from '../../../components/StatusBadge/StatusBadge';
import { colors } from '../../../theme';
import { isSameDay } from '../../../utils/dateFormat';
import { formatSlotTime } from '../../../utils/providerFormat';
import { formatWhen, type CareItem } from '../utils/careActivity';
import { styles } from '../styles/CareCards.styles';

function statusMeta(item: CareItem): { label: string; fg: string } | null {
  if (item.appointmentStatus) return APPOINTMENT_STATUS_META[item.appointmentStatus];
  if (item.labStatus) return LAB_STATUS_META[item.labStatus];
  return null;
}

function DateTile({ iso, lab }: { iso: string; lab: boolean }) {
  const date = new Date(iso);
  const today = isSameDay(iso);
  const tone = lab ? styles.dateTileLab : styles.dateTileDoctor;
  const textTone = lab ? styles.dateTileTextLab : styles.dateTileTextDoctor;
  return (
    <View style={[styles.dateTile, tone]}>
      <Text style={[styles.dateTileLabel, textTone]} numberOfLines={1}>
        {today ? 'Today' : date.toLocaleDateString(undefined, { month: 'short' })}
      </Text>
      <Text style={[styles.dateTileDay, textTone]}>{date.getDate()}</Text>
    </View>
  );
}

interface CareRowProps {
  item: CareItem;
  onPress: () => void;
}

export function CareRow({ item, onPress }: CareRowProps) {
  const status = statusMeta(item);
  const detail = item.late ? 'Running late' : item.subtitle;
  const a11y = [item.title, formatWhen(item.scheduledAt), item.modeLabel, status?.label, detail].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityHint="Opens booking details"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <DateTile iso={item.scheduledAt} lab={item.kind === 'LAB'} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.rowLine}>
          <Icon name={item.modeIcon} size={14} color={item.late ? colors.warning : colors.textSecondary} />
          <Text style={[styles.rowMeta, item.late && styles.rowMetaLate]} numberOfLines={1}>
            {formatSlotTime(item.scheduledAt)} · {item.modeLabel}
          </Text>
        </View>
        {status || detail ? (
          <View style={styles.rowLine}>
            {status ? (
              <>
                <View style={[styles.statusDot, { backgroundColor: status.fg }]} />
                <Text style={[styles.statusText, { color: status.fg }]} numberOfLines={1}>
                  {status.label}
                </Text>
              </>
            ) : null}
            {detail ? (
              <Text style={[styles.rowDetail, item.late && styles.rowDetailLate]} numberOfLines={1}>
                {status ? '· ' : ''}
                {detail}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
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
