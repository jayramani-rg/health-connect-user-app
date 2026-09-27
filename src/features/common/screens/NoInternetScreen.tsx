import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';

import { styles } from '../styles/NoInternetScreen.styles';
import { Icon } from '../../../components/Icon/Icon';
import { colors } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { useAppDispatch, setIsConnected } from '../../../store';

const NoInternetScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [checking, setChecking] = useState(false);

  async function handleRetry() {
    if (checking) return;
    setChecking(true);
    const state = await NetInfo.fetch();
    const connected = !!state.isConnected;
    dispatch(setIsConnected(connected));
    setChecking(false);
    if (connected && navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.iconCircle}>
        <Icon name="cloud-offline-outline" size={32} color={colors.inkFaint} />
      </View>
      <Text style={styles.title}>No internet connection</Text>
      <Text style={styles.subtitle}>Please check your connection and try again.</Text>
      <TouchableOpacity style={styles.retryButton} activeOpacity={activeopacity} onPress={handleRetry} disabled={checking}>
        {checking ? <ActivityIndicator color={colors.white} /> : <Text style={styles.retryText}>Retry</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NoInternetScreen;
