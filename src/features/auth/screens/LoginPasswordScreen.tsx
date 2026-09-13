import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button/Button';
import { PasswordField } from '../../../components/PasswordField/PasswordField';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { Banner } from '../../../components/Banner/Banner';
import { authService } from '../../../services/authService';
import { useAppDispatch, setAuthSession } from '../../../store';
import type { NormalizedError } from '../../../types/common.types';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/LoginPasswordScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'LoginPassword'>;

export default function LoginPasswordScreen({ navigation, route }: Props) {
  const { mobileNumber } = route.params;
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  async function handleSignIn() {
    if (!password || loading) return;
    setLoading(true);
    setError('');
    setLocked(false);
    try {
      const result = await authService.login({ role: 'PATIENT', mobileNumber, password, platform: 'ANDROID' });
      if (result.data.user && result.data.accessToken && result.data.refreshToken) {
        dispatch(
          setAuthSession({
            user: result.data.user,
            tokens: {
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              expiresIn: result.data.expiresIn ?? 0,
              refreshTokenExpiresIn: result.data.refreshTokenExpiresIn ?? 0,
            },
          }),
        );
        return;
      }
      setError(result.message);
    } catch (err) {
      const normalized = err as NormalizedError;
      setLocked(normalized.statusCode === 403);
      setError(normalized.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    try {
      await authService.sendOtp(mobileNumber, 'FORGOT_PASSWORD');
      navigation.navigate('Otp', { mobileNumber, purpose: 'FORGOT_PASSWORD', mode: 'forgotPassword' });
    } catch (err) {
      setError((err as NormalizedError).message);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>
        Enter your password to sign in as <Text style={styles.subtitleBold}>+91 {mobileNumber}</Text>.
      </Text>
      <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" />
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotLink}>Forgot password?</Text>
      </TouchableOpacity>
      {error ? <Banner variant={locked ? 'warning' : 'error'} message={error} /> : null}
      <View style={styles.footer}>
        <Button label="Sign in" onPress={handleSignIn} disabled={!password} loading={loading} />
      </View>
    </ScreenContainer>
  );
}
