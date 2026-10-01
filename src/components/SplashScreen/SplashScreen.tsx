import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import { CarovaWordmark } from '../BrandLogo/BrandLogo';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
});

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CarovaWordmark width={184} color={colors.white} />
      <ActivityIndicator color={colors.white} />
    </View>
  );
}
