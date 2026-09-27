import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../theme';
import { TAB_BAR_CLEARANCE } from '../../../components/FloatingTabBar/styles/FloatingTabBar.styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
