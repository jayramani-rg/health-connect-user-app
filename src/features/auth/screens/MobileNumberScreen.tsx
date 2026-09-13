import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button/Button';
import { TextField } from '../../../components/TextField/TextField';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { Banner } from '../../../components/Banner/Banner';
import { authService } from '../../../services/authService';
import { isValidMobile } from '../../../utils/validation';
import type { NormalizedError } from '../../../types/common.types';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/MobileNumberScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'MobileNumber'>;

export default function MobileNumberScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = isValidMobile(mobileNumber);

  async function handleContinue() {
    if (!valid || loading) return;
    setError('');

    if (mode === 'login') {
      navigation.navigate('LoginPassword', { mobileNumber });
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(mobileNumber, 'REGISTRATION');
      navigation.navigate('Otp', { mobileNumber, purpose: 'REGISTRATION', mode: 'register' });
    } catch (err) {
      setError((err as NormalizedError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>What&apos;s your mobile number?</Text>
      <Text style={styles.subtitle}>
        {mode === 'register' ? "We'll text a 6-digit code to verify it." : 'Enter the number linked to your account.'}
      </Text>
      <TextField
        label="Mobile number"
        value={mobileNumber}
        onChangeText={(v) => setMobileNumber(v.replace(/[^0-9]/g, '').slice(0, 10))}
        placeholder="98765 43210"
        prefix="+91"
        keyboardType="number-pad"
        maxLength={10}
      />
      <Text style={styles.helper}>One account per number, per role. This is a patient account.</Text>
      {error ? <Banner variant="error" message={error} /> : null}
      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={!valid} loading={loading} />
      </View>
    </ScreenContainer>
  );
}
