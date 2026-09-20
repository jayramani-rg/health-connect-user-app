import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/Button/Button';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/WelcomeScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.wordmark}>CAROVA</Text>
          <Text style={styles.headline}>Healthcare you can trust, booked in a minute.</Text>
          <Text style={styles.subhead}>Verified doctors and accredited labs. Appointments, reports and prescriptions in one place.</Text>
        </View>
        <View style={styles.actions}>
          <Button label="Continue with mobile number" onPress={() => navigation.navigate('MobileNumber')} variant="secondary" />
          <Text style={styles.legal}>By continuing you agree to our Terms & Privacy Policy.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
