import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../navigation/types';
import { useCall } from '../context/CallContextValue';
import { callScreenStyles } from './callScreenStyles';
import VideoCallScreen from './VideoCallScreen';
import VoiceCallScreen from './VoiceCallScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Calling'>;

const CallingScreen: React.FC<Props> = ({ navigation }) => {
  const { state } = useCall();
  const callType = state.call?.callType;

  if (callType === 'VIDEO') {
    return <VideoCallScreen navigation={navigation} />;
  }
  if (callType === 'VOICE') {
    return <VoiceCallScreen navigation={navigation} />;
  }
  return <View style={callScreenStyles.root} />;
};

export default CallingScreen;
