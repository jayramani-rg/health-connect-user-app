import React, { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button/Button';
import { PasswordField, isPasswordValid } from '../../../components/PasswordField/PasswordField';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { Banner } from '../../../components/Banner/Banner';
import { authService } from '../../../services/authService';
import { registrationService } from '../../../services/registrationService';
import { useAppDispatch, setAuthSession } from '../../../store';
import type { NormalizedError } from '../../../types/common.types';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/CreatePasswordScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePassword'>;

export default function CreatePasswordScreen({ navigation, route }: Props) {
  const { verificationToken, mobileNumber, mode } = route.params;
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = isPasswordValid(password);

  async function handleSubmit() {
    if (!valid || loading) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        const result = await registrationService.createPatientPassword(verificationToken, password);
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
              isNewRegistration: true,
            }),
          );
        }
      } else {
        await authService.resetPassword(verificationToken, password);
        navigation.reset({ index: 0, routes: [{ name: 'LoginPassword', params: { mobileNumber } }] });
      }
    } catch (err) {
      setError((err as NormalizedError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{mode === 'register' ? 'Create a password' : 'Set a new password'}</Text>
      <Text style={styles.subtitle}>
        {mode === 'register'
          ? "You'll use your mobile number and this password to sign in."
          : 'Choose a new password for your account.'}
      </Text>
      <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" showChecklist />
      {error ? <Banner variant="error" message={error} /> : null}
      <View style={styles.footer}>
        <Button label={mode === 'register' ? 'Create account' : 'Reset password'} onPress={handleSubmit} disabled={!valid} loading={loading} />
      </View>
    </ScreenContainer>
  );
}
