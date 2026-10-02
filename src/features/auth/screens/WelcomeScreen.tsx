import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CarovaWordmark } from '../../../components/BrandLogo/BrandLogo';
import { Button } from '../../../components/Button/Button';
import { WelcomeIllustration } from '../../../components/WelcomeIllustration/WelcomeIllustration';
import type { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme';
import { styles } from '../styles/WelcomeScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View entering={FadeInUp.duration(400)} style={styles.hero}>
        <WelcomeIllustration />
        <CarovaWordmark width={132} color={colors.white} />
        <Text style={styles.headline}>Healthcare you can trust, booked in a minute.</Text>
        <Text style={styles.subhead}>Verified doctors and accredited labs. Appointments, reports and prescriptions in one place.</Text>
        <View style={styles.heroSpacer} />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.sheet}>
        <View style={{ gap: 12 }}>
          <Button label="Continue with mobile number" onPress={() => navigation.navigate('MobileNumber')} />
          <Text style={styles.legal}>By continuing you agree to our Terms & Privacy Policy.</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
