// features/home/screens/HomeScreen.tsx
// Demonstrates the Banner + FlatList layout pattern (Sec 12.1) — a
// FlatList with a ListHeaderComponent banner, avoiding nested
// ScrollViews. Screen owns orchestration only; ProductCard owns
// presentation.

import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';

import { useAppSelector } from '../../../store';
import images from '../../../assets/profileImages';
import ProductCard, { ProductDetail } from '../components/ProductCard/ProductCard';
import { styles } from '../styles/HomeScreen.styles';

// Sec 17.2 — Mock-first development. Shape matches ProductDetail exactly
// so swapping to a real API response later requires no UI changes.
const MOCK_ITEMS: ProductDetail[] = [
  { id: '1', name: 'Handwoven Rug', price: 2499, imageUrl: 'https://picsum.photos/seed/1/300' },
  { id: '2', name: 'Terracotta Vase', price: 899, imageUrl: 'https://picsum.photos/seed/2/300' },
  { id: '3', name: 'Brass Diya Set', price: 1299, imageUrl: 'https://picsum.photos/seed/3/300' },
];

const HomeScreen: React.FC = () => {
  // Demo store read — screens use useAppSelector, never raw useSelector.
  const isConnected = useAppSelector(state => state.networkData.isConnected);

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={item => item.id}
        numColumns={2}
        ListHeaderComponent={
          <Image source={images.homeBanner} style={styles.banner} resizeMode="cover" />
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            cartQuantity={0}
            onPress={() => {}}
            onAddToCart={() => {}}
            onRemoveFromCart={() => {}}
            onWishlistToggle={() => {}}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No products yet.</Text>}
      />
      {!isConnected && <Text style={styles.offlineBanner}>You are offline</Text>}
    </View>
  );
};

export default HomeScreen;
