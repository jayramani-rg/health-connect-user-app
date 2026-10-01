import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../../components/Button/Button';
import { Icon } from '../../../components/Icon/Icon';
import { colors } from '../../../theme';
import { styles } from '../styles/Location.styles';

interface LocationPromptCardProps {
  loading: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

/** Our own soft ask, shown once. The OS permission dialog appears only after "Enable location" — declining here
 * (or there) just hides the card; the app works the same, minus "near you first" ordering. */
export function LocationPromptCard({ loading, onEnable, onDismiss }: LocationPromptCardProps) {
  return (
    <View style={styles.promptCard}>
      <View style={styles.promptRow}>
        <View style={styles.currentIcon}>
          <Icon name="navigate" size={18} color={colors.primary} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.promptTitle}>See care near you first</Text>
          <Text style={styles.promptText}>Allow approximate location and we'll show doctors and labs in your area at the top.</Text>
        </View>
      </View>
      <View style={styles.promptActions}>
        <View style={styles.flex1}>
          <Button label="Not now" variant="secondary" onPress={onDismiss} disabled={loading} />
        </View>
        <View style={styles.flex1}>
          <Button label="Enable location" onPress={onEnable} loading={loading} />
        </View>
      </View>
    </View>
  );
}
