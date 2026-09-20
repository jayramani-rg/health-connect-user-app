export interface CategoryGridItem {
  id: string;
  name: string;
}

export interface CategoryGridProps {
  categories: CategoryGridItem[];
  onSelect: (category: CategoryGridItem) => void;
}
