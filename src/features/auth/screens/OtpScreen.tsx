import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button/Button';
import { OtpInput } from '../../../components/OtpInput/OtpInput';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { Banner } from '../../../components/Banner/Banner';
import { authService } from '../../../services/authService';
import { isValidOtp } from '../../../utils/validation';
import { OTP_RESEND_COOLDOWN_SECONDS } from '../../../utils/helpers';
import type { NormalizedError } from '../../../types/common.types';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/OtpScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export default function OtpScreen({ navigation, route }: Props) {
  const { mobileNumber, purpose, mode } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleVerify(otpValue?: string) {
    const value = otpValue ?? code;
    if (!isValidOtp(value) || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await authService.verifyOtp(mobileNumber, purpose, value);
      const verificationToken = result.data.verificationToken;
      navigation.navigate('CreatePassword', {
        verificationToken,
        mobileNumber,
        mode: mode === 'forgotPassword' ? 'reset' : 'register',
      });
    } catch (err) {
      setError((err as NormalizedError).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await authService.resendOtp(mobileNumber, purpose);
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setCode('');
    } catch (err) {
      setError((err as NormalizedError).message);
    } finally {
      setResending(false);
    }
  }

  return (
    <ScreenContainer>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.subtitle}>Sent to +91 {mobileNumber}</Text>
      <OtpInput
        value={code}
        onChange={(value) => {
          setCode(value);
          if (value.length === 6) handleVerify(value);
        }}
        errorText={error ? ' ' : undefined}
        autoFocus
      />
      {error ? <Banner variant="error" message={error} /> : null}
      <View style={styles.resendRow}>
        {cooldown > 0 ? (
          <Text style={styles.resendText}>Resend code in 0:{cooldown.toString().padStart(2, '0')}</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.resendLink}>{resending ? 'Sending…' : 'Resend code'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.footer}>
        <Button label="Verify" onPress={() => handleVerify()} disabled={!isValidOtp(code)} loading={loading} />
      </View>
    </ScreenContainer>
  );
}
