import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { Icon } from '../../../components/Icon/Icon';
import { colors, spacing } from '../../../theme';
import { PulsingAvatar } from '../components/PulsingAvatar';
import { VoiceCallControls } from '../components/VoiceCallControls';
import { useCall } from '../context/CallContextValue';
import { useCallPresentation, useConfirmLeaveCall } from '../hooks/useCallPresentation';
import { callScreenStyles as styles } from './callScreenStyles';

const VoiceCallScreen: React.FC<{ navigation: NavigationProp<ParamListBase> }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { endCall } = useCall();
  const { media, controls, other, ended, mediaConnected, statusText, notice, subtitle, photoUrl, call } = useCallPresentation();

  useConfirmLeaveCall(navigation);

  if (!call || !other) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.typePill}>
          <Icon name="call" size={14} color={colors.white} />
          <Text style={styles.typeText}>Voice call</Text>
        </View>
      </View>

      <View style={styles.center}>
        <PulsingAvatar name={other.name} imageUrl={photoUrl} size={132} pulsing={!ended && !mediaConnected} />
        <Text style={styles.name} numberOfLines={2}>
          {other.name}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        <Text style={styles.statusLarge}>{statusText}</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        {notice ? (
          <View style={styles.notice} accessibilityLiveRegion="polite">
            <Icon name="warning" size={16} color={colors.white} />
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}
        {!ended ? <VoiceCallControls media={media} controls={controls} onEnd={() => endCall('HANGUP')} /> : null}
      </View>
    </View>
  );
};

export default VoiceCallScreen;
