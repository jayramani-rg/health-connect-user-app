import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ListGroup, ListRow } from '../../../components/ListGroup/ListGroup';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import { layout } from '../../../theme';
import type { RootStackParamList } from '../../../navigation/types';
import { ServiceTile } from '../../home/components/CareCards';

export default function BookHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');

  function submitSearch() {
    const query = search.trim();
    navigation.navigate('DoctorList', query ? { search: query } : undefined);
    setSearch('');
  }

  return (
    <ScreenContainer tabBarInset variant="page">
      <PageHeader title="Book care" />

      <View style={styles.cards}>
        <ServiceTile tone="doctor" title="Find a doctor" onPress={() => navigation.navigate('DoctorCategories')} />
        <ServiceTile tone="lab" title="Book a lab test" onPress={() => navigation.navigate('LabCategories')} />
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search doctors" onSubmitEditing={submitSearch} />

      <ListGroup title="Browse">
        <ListRow icon="medkit-outline" title="All doctors" onPress={() => navigation.navigate('DoctorList', undefined)} />
        <ListRow icon="flask-outline" title="All labs" onPress={() => navigation.navigate('LabList', undefined)} />
      </ListGroup>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cards: {
    flexDirection: 'row',
    gap: layout.blockGap,
  },
});
