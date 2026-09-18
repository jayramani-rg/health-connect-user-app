// features/common/screens/NoInternetScreen.tsx
// Cross-cutting screen (Sec 3.1) — shown by the navigator when
// networkSlice.isConnected === false (Sec 15.1). No business logic;
// purely presentational.

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../styles/NoInternetScreen.styles';
import { activeopacity } from '../../../utils/helpers';

const NoInternetScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.subtitle}>Please check your connection and try again.</Text>
      <TouchableOpacity
        style={styles.retryButton}
        activeOpacity={activeopacity}
        onPress={() => {
          // Demo only — real implementation re-checks NetInfo state.
        }}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NoInternetScreen;
