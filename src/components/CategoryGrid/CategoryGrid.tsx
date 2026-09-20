import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { activeopacity } from '../../utils/helpers';
import { colors } from '../../theme';
import { styles } from './styles/CategoryGrid.styles';
import type { CategoryGridItem, CategoryGridProps } from './types/CategoryGrid.types';

// Rotating soft-tint palette, same soft/strong color pairs used for avatar-initial treatments
// elsewhere in the app (see DoctorCard) — keeps categories visually distinct without maintaining a
// bespoke icon-per-category mapping that would need updating every time an admin adds one.
const PALETTE = [
  { bg: colors.brandSoft, fg: colors.brand },
  { bg: colors.successSoft, fg: colors.success },
  { bg: colors.pendingSoft, fg: colors.pending },
  { bg: colors.warningSoft, fg: colors.warning },
];

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
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
}: {
  category: CategoryGridItem;
  tint: { bg: string; fg: string };
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.tile} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: tint.bg }]}>
        <Text style={[styles.avatarInitial, { color: tint.fg }]}>{category.name.trim().charAt(0).toUpperCase() || '?'}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

export type { CategoryGridItem, CategoryGridProps };
