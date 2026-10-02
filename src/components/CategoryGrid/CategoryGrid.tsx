import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { activeopacity } from '../../utils/helpers';
import { colors } from '../../theme';
import { ASSETS_BASE_URL } from '../../config/env';
import { styles } from './styles/CategoryGrid.styles';
import type { CategoryGridItem, CategoryGridProps } from './types/CategoryGrid.types';

const PALETTE = [
  { bg: colors.primarySoft, fg: colors.primary },
  { bg: colors.successSoft, fg: colors.success },
  { bg: colors.pendingSoft, fg: colors.pending },
  { bg: colors.warningSoft, fg: colors.warning },
];

export function CategoryGrid({ categories, onSelect, variant = 'grid' }: CategoryGridProps) {
  if (variant === 'strip') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {categories.map((category, index) => (
          <CategoryTile key={category.id} category={category} tint={PALETTE[index % PALETTE.length]} onPress={() => onSelect(category)} strip />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.grid}>
      {categories.map((category, index) => (
        <CategoryTile key={category.id} category={category} tint={PALETTE[index % PALETTE.length]} onPress={() => onSelect(category)} />
      ))}
    </View>
  );
}

function CategoryTile({
  category,
  tint,
  onPress,
  strip,
}: {
  category: CategoryGridItem;
  tint: { bg: string; fg: string };
  onPress: () => void;
  strip?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!category.imageUrl && !imageFailed;

  return (
    <TouchableOpacity activeOpacity={activeopacity} style={strip ? styles.stripTile : styles.tile} onPress={onPress}>
      <View style={[strip ? styles.stripAvatar : styles.avatar, { backgroundColor: tint.bg }]}>
        {showImage ? (
          <Image
            source={{ uri: `${ASSETS_BASE_URL}${category.imageUrl}` }}
            style={styles.avatarImage}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Text style={[styles.avatarInitial, { color: tint.fg }]}>{category.name.trim().charAt(0).toUpperCase() || '?'}</Text>
        )}
      </View>
      <Text style={strip ? styles.stripName : styles.name} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

export type { CategoryGridItem, CategoryGridProps };
