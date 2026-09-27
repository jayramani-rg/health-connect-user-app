import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  wordmark: {
    ...typography.display,
    fontSize: 30,
    letterSpacing: 2,
    color: colors.white,
  },
});

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.wordmark}>CAROVA</Text>
      <ActivityIndicator color={colors.white} />
    </View>
  );
}
