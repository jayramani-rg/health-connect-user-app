import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IoniconsIconName } from '../../../../components/Icon/Icon';
import { colors } from '../../../../theme';
import { haptics } from '../../../../utils/haptics';
import { formatFee } from '../../../../utils/providerFormat';
import type { ConsultationType } from '../../types/doctor.types';
import { styles } from './styles/ConsultationModePicker.styles';

export interface ConsultationModeOption {
  mode: ConsultationType;
  enabled: boolean;
  fee: number | null;
  durationMinutes: number | null;
}

export interface ConsultationModePickerProps {
  options: ConsultationModeOption[];
  value: ConsultationType | null;
  onChange: (mode: ConsultationType) => void;
}

const MODE_META: Record<ConsultationType, { label: string; icon: IoniconsIconName }> = {
  VIDEO: { label: 'Video', icon: 'videocam-outline' },
  VOICE: { label: 'Voice', icon: 'call-outline' },
  IN_CLINIC: { label: 'In-clinic', icon: 'business-outline' },
};

export function ConsultationModePicker({ options, value, onChange }: ConsultationModePickerProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const meta = MODE_META[option.mode];
        const selected = option.enabled && option.mode === value;
        const feeText = option.enabled ? (option.fee != null ? formatFee(option.fee) : 'Fee on request') : 'Not offered';
        return (
          <Pressable
            key={option.mode}
            disabled={!option.enabled}
            onPress={() => {
              if (!selected) haptics.selection();
              onChange(option.mode);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: !option.enabled }}
            accessibilityLabel={`${meta.label} consultation, ${feeText}${option.durationMinutes && option.enabled ? `, ${option.durationMinutes} minutes` : ''}`}
            style={({ pressed }) => [
              styles.tile,
              selected && styles.tileSelected,
              !option.enabled && styles.tileDisabled,
              pressed && option.enabled && styles.tilePressed,
            ]}
          >
            {selected ? (
              <View style={styles.check}>
                <Icon name="checkmark" size={11} color={colors.white} />
              </View>
            ) : null}
            <View style={[styles.iconTile, selected && styles.iconTileSelected, !option.enabled && styles.iconTileDisabled]}>
              <Icon name={meta.icon} size={18} color={selected ? colors.white : option.enabled ? colors.brand : colors.textTertiary} />
            </View>
            <Text style={[styles.label, !option.enabled && styles.textDisabled]} numberOfLines={1}>
              {meta.label}
            </Text>
            <Text style={[styles.fee, selected && styles.feeSelected, !option.enabled && styles.textDisabled]} numberOfLines={1}>
              {feeText}
            </Text>
            <Text style={[styles.duration, !option.enabled && styles.textDisabled]} numberOfLines={1}>
              {option.enabled && option.durationMinutes ? `${option.durationMinutes} min` : ' '}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
