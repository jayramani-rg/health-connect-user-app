import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { images } from '../../../assets/images';
import { Button } from '../../../components/Button/Button';
import { Icon, type IoniconsIconName } from '../../../components/Icon/Icon';
import { STATUS_META as LAB_STATUS_META } from '../../../components/LabStatusBadge/LabStatusBadge';
import { statusMeta as appointmentStatusMeta } from '../../../components/StatusBadge/StatusBadge';
import { colors } from '../../../theme';
import { formatSlotTime } from '../../../utils/providerFormat';
import { formatWhen, type CareItem } from '../utils/careActivity';
import { styles } from '../styles/CareCards.styles';

interface StatusVisual {
  label: string;
  icon: IoniconsIconName;
  fg: string;
  bg: string;
}

const STATUS_ICON: Record<string, IoniconsIconName> = {
  PENDING: 'hourglass-outline',
  CONFIRMED: 'checkmark-circle-outline',
  IN_PROGRESS: 'radio-button-on',
  PAYMENT_PENDING: 'card-outline',
  COLLECTOR_ASSIGNED: 'person-outline',
  ON_THE_WAY: 'navigate-outline',
  SAMPLE_COLLECTED: 'flask-outline',
  PROCESSING: 'sync-outline',
};

function statusVisual(item: CareItem): StatusVisual | null {
  if (item.late) {
    return { label: 'Running late', icon: 'alert-circle-outline', fg: colors.warning, bg: colors.warningSoft };
  }
  const status = item.appointmentStatus ?? item.labStatus;
  if (!status) return null;
  const meta = item.appointmentStatus ? appointmentStatusMeta(item.appointmentStatus) : LAB_STATUS_META[item.labStatus!];
  return { label: meta.label, fg: meta.fg, bg: meta.bg, icon: STATUS_ICON[status] ?? 'ellipse-outline' };
}

function isLive(item: CareItem): boolean {
  return item.appointmentStatus === 'IN_PROGRESS' || item.labStatus === 'ON_THE_WAY' || item.labStatus === 'COLLECTOR_ASSIGNED';
}

function splitTime(iso: string): { clock: string; period: string | null } {
  const formatted = formatSlotTime(iso);
  const match = formatted.match(/^(.*?)\s*([AaPp]\.?\s?[Mm]\.?)$/);
  return match ? { clock: match[1], period: match[2].toUpperCase() } : { clock: formatted, period: null };
}

function StatusLine({ status }: { status: StatusVisual }) {
  return (
    <View style={styles.statusLine}>
      <Icon name={status.icon} size={14} color={status.fg} />
      <Text style={[styles.statusText, { color: status.fg }]} numberOfLines={1}>
        {status.label}
      </Text>
    </View>
  );
}

interface CareGroupHeaderProps {
  title: string;
  icon?: IoniconsIconName;
  iconColor?: string;
  meta?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function CareGroupHeader({ title, icon, iconColor, meta, actionLabel, onActionPress }: CareGroupHeaderProps) {
  return (
    <View style={styles.groupHeader}>
      {icon ? <Icon name={icon} size={16} color={iconColor ?? colors.textSecondary} /> : null}
      <Text style={styles.groupTitle} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          style={({ pressed }) => [styles.groupAction, pressed && styles.groupActionPressed]}
        >
          <Text style={styles.groupActionText}>{actionLabel}</Text>
          <Icon name="chevron-forward" size={14} color={colors.brand} />
        </Pressable>
      ) : meta ? (
        <Text style={styles.groupMeta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
    </View>
  );
}

function DateTile({ iso, tone }: { iso: string; tone: 'doctor' | 'lab' | 'pending' }) {
  const date = new Date(iso);
  const tileTone = tone === 'pending' ? styles.dateTilePending : tone === 'lab' ? styles.dateTileLab : styles.dateTileDoctor;
  const textTone = tone === 'pending' ? styles.dateTileTextPending : tone === 'lab' ? styles.dateTileTextLab : styles.dateTileTextDoctor;
  return (
    <View style={[styles.dateTile, tileTone]}>
      <Text style={[styles.dateTileLabel, textTone]} numberOfLines={1}>
        {date.toLocaleDateString(undefined, { month: 'short' })}
      </Text>
      <Text style={[styles.dateTileDay, textTone]}>{date.getDate()}</Text>
    </View>
  );
}

interface AttentionCardProps {
  item: CareItem;
  actionLabel: string;
  hint: string;
  onOpen: () => void;
  onAction: () => void;
}

export function AttentionCard({ item, actionLabel, hint, onOpen, onAction }: AttentionCardProps) {
  const status = statusVisual(item);
  const when = formatWhen(item.scheduledAt);

  return (
    <View style={styles.attentionCard}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={[status?.label, item.title, item.subtitle, when, item.modeLabel].filter(Boolean).join(', ')}
        accessibilityHint="Opens booking details"
        style={({ pressed }) => [styles.attentionBody, pressed && styles.rowPressed]}
      >
        {status ? (
          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <Icon name={status.icon} size={14} color={status.fg} />
            <Text style={[styles.statusPillText, { color: status.fg }]} numberOfLines={1}>
              {status.label}
            </Text>
          </View>
        ) : null}
        <View style={styles.attentionText}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.rowSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.metaLine}>
          <Icon name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {when}
          </Text>
        </View>
        <View style={styles.metaLine}>
          <Icon name={item.modeIcon} size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.modeLabel}
          </Text>
        </View>
      </Pressable>
      <View style={styles.attentionFooter}>
        <Text style={styles.attentionHint} numberOfLines={2}>
          {hint}
        </Text>
        <Button
          label={actionLabel}
          onPress={onAction}
          fullWidth={false}
          style={styles.attentionButton}
          labelStyle={styles.attentionButtonLabel}
        />
      </View>
    </View>
  );
}

interface TimelineRowProps {
  item: CareItem;
  first: boolean;
  last: boolean;
  onPress: () => void;
}

export function TimelineRow({ item, first, last, onPress }: TimelineRowProps) {
  const status = statusVisual(item);
  const live = isLive(item);
  const { clock, period } = splitTime(item.scheduledAt);
  const dotColor = status?.fg ?? colors.borderStrong;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[formatSlotTime(item.scheduledAt), item.title, item.modeLabel, status?.label].filter(Boolean).join(', ')}
      accessibilityHint="Opens booking details"
      style={({ pressed }) => [styles.timelineRow, live && styles.timelineRowLive, pressed && styles.rowPressed]}
    >
      <View style={styles.timeColumn}>
        <Text style={[styles.timeClock, live && styles.timeClockLive]} numberOfLines={1}>
          {clock}
        </Text>
        {period ? <Text style={styles.timePeriod}>{period}</Text> : null}
      </View>
      <View style={styles.rail}>
        <View style={[styles.railLineTop, first && styles.railLineHidden]} />
        <View style={[styles.railDot, { borderColor: dotColor }, live && { backgroundColor: dotColor }]} />
        <View style={[styles.railLineBottom, last && styles.railLineHidden]} />
      </View>
      <View style={styles.timelineText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.metaLine}>
          <Icon name={item.modeIcon} size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.subtitle ? `${item.modeLabel} · ${item.subtitle}` : item.modeLabel}
          </Text>
        </View>
        {status ? <StatusLine status={status} /> : null}
      </View>
      <Icon name="chevron-forward" size={18} color={colors.textTertiary} style={styles.timelineChevron} />
    </Pressable>
  );
}

interface CareRowProps {
  item: CareItem;
  onPress: () => void;
}

export function CareRow({ item, onPress }: CareRowProps) {
  const status = statusVisual(item);
  const when = formatWhen(item.scheduledAt);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[item.title, when, item.modeLabel, status?.label, item.subtitle].filter(Boolean).join(', ')}
      accessibilityHint="Opens booking details"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <DateTile iso={item.scheduledAt} tone={item.kind === 'LAB' ? 'lab' : 'doctor'} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.metaLine}>
          <Icon name={item.modeIcon} size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {formatSlotTime(item.scheduledAt)} · {item.modeLabel}
          </Text>
        </View>
        {status ? <StatusLine status={status} /> : null}
      </View>
      <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

export function RequestRow({ item, onPress }: CareRowProps) {
  const when = formatWhen(item.scheduledAt);
  const confirmer = item.kind === 'LAB' ? 'the lab' : 'the doctor';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[item.title, `Requested for ${when}`, item.modeLabel, `Waiting for ${confirmer} to confirm`].join(', ')}
      accessibilityHint="Opens booking details"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <DateTile iso={item.scheduledAt} tone="pending" />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.metaLine}>
          <Icon name={item.modeIcon} size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            Requested {formatSlotTime(item.scheduledAt)} · {item.modeLabel}
          </Text>
        </View>
        <StatusLine status={{ label: `Waiting for ${confirmer} to confirm`, icon: 'hourglass-outline', fg: colors.pending, bg: colors.pendingSoft }} />
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
