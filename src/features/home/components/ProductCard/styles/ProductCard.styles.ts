// features/home/components/ProductCard/styles/ProductCard.styles.ts
import { StyleSheet } from 'react-native';
import { getHeight, getWidth, getFontSize } from '../../../../../utils/helpers';

const lightColors = {
  primary: '#2E5CFF',
  text: '#111111',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  greyAccent: '#F2F3F5',
};

export const styles = StyleSheet.create({
  container: {
    width: getWidth(160),
    backgroundColor: lightColors.white,
    borderRadius: 12,
    padding: getWidth(8),
    marginRight: getWidth(12),
  },
  image: {
    width: '100%',
    height: getHeight(120),
    borderRadius: 8,
    backgroundColor: lightColors.greyAccent,
  },
  wishlistButton: {
    position: 'absolute',
    top: getHeight(12),
    right: getWidth(12),
  },
  wishlistIcon: {
    fontSize: 18,
    color: lightColors.primary,
  },
  name: {
    fontSize: getFontSize(14),
    color: lightColors.text,
    marginTop: getHeight(8),
  },
  price: {
    fontSize: getFontSize(14),
    fontWeight: '700',
    color: lightColors.text,
    marginTop: getHeight(2),
  },
  addButton: {
    marginTop: getHeight(8),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: lightColors.primary,
    paddingVertical: getHeight(6),
    alignItems: 'center',
  },
  addButtonText: {
    color: lightColors.primary,
    fontWeight: '600',
    fontSize: getFontSize(13),
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: getHeight(8),
    borderRadius: 6,
    backgroundColor: lightColors.primary,
    paddingHorizontal: getWidth(10),
    paddingVertical: getHeight(6),
  },
  counterSign: {
    color: lightColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  counterValue: {
    color: lightColors.white,
    fontSize: getFontSize(13),
    fontWeight: '600',
  },
});
