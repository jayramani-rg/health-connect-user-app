import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
});

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>CAROVA</Text>
      <ActivityIndicator color={colors.white} />
    </View>
  );
}
