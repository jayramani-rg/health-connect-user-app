// features/home/components/ProductCard/ProductCard.tsx
// Handbook Sec 4.2 — THE reference implementation for shared UI
// components in this codebase. Domain-agnostic: receives all data and
// callbacks through props, no navigation, no store access (Sec 4.1).

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { styles } from './styles/ProductCard.styles';
import { activeopacity } from '../../../../utils/helpers';
import type { ProductCardProps, ProductDetail } from './types/ProductCard.types';

// Barrel re-export — consumers import the type from this file, not the
// nested types/ subfolder.
export type { ProductDetail };

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  containerStyle,
  cartQuantity = 0,
  onPress,
  onAddToCart,
  onRemoveFromCart,
  onWishlistToggle,
}) => {
  // Local state for a UI-only concern — does not need to survive
  // navigation or be read by another screen (Sec 4.2).
  const [isFavorite, setIsFavorite] = useState(!!item.isInWishlist);

  // Sync local state when the prop changes (e.g. after an API sync).
  useEffect(() => {
    setIsFavorite(!!item.isInWishlist);
  }, [item.isInWishlist]);

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      activeOpacity={activeopacity}
      onPress={onPress}
      accessible
      accessibilityLabel={item.name}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />

      <TouchableOpacity
        style={styles.wishlistButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={activeopacity}
        onPress={() => {
          setIsFavorite(prev => !prev);
          onWishlistToggle?.();
        }}
      >
        <Text style={styles.wishlistIcon}>{isFavorite ? '♥' : '♡'}</Text>
      </TouchableOpacity>

      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.price}>₹{item.price}</Text>

      {/* Clean ternary between add-button and counter — never a
          hidden/shown pattern (Sec 4.2). */}
      {cartQuantity === 0 ? (
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={activeopacity}
          onPress={onAddToCart}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onRemoveFromCart}
          >
            <Text style={styles.counterSign}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{cartQuantity}</Text>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onAddToCart}
          >
            <Text style={styles.counterSign}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// React.memo wrapping — prevents unnecessary re-renders when parent
// state changes but this card's props haven't (Sec 4.2, Sec 16.1).
export default React.memo(ProductCard);
