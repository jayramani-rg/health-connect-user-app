// features/home/components/ProductCard/types/ProductCard.types.ts
// Tier 3: Component Types (Sec 9.1). Live adjacent to the component,
// exported from the component barrel for consumer convenience (Sec 4.2).

import type { StyleProp, ViewStyle } from 'react-native';

export interface ProductDetail {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  isInWishlist?: boolean;
}

// Required props first, optional props after (Sec 4.3).
export interface ProductCardProps {
  item: ProductDetail;
  containerStyle?: StyleProp<ViewStyle>;
  cartQuantity?: number;
  onPress?: () => void;
  onAddToCart?: () => void;
  onRemoveFromCart?: () => void;
  onWishlistToggle?: () => void;
}
