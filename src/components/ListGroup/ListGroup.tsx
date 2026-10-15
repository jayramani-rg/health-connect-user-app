import React, { isValidElement, type ReactNode } from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme';
import { Icon, type IoniconsIconName } from '../Icon/Icon';
import { styles } from './styles/ListGroup.styles';

export interface ListGroupProps {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ListGroup({ title, children, style }: ListGroupProps) {
  const rows = React.Children.toArray(children).filter(isValidElement);
  if (rows.length === 0) return null;

  return (
    <View style={style}>
      {title ? (
        <Text style={styles.groupTitle} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <React.Fragment key={row.key ?? index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {row}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export interface ListRowProps {
  title: string;
  subtitle?: string | null;
  value?: string | null;
  icon?: IoniconsIconName;
  tone?: 'default' | 'danger';
  trailing?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function ListRow({ title, subtitle, value, icon, tone = 'default', trailing, showChevron, onPress, disabled }: ListRowProps) {
  const danger = tone === 'danger';
  const chevron = showChevron ?? (!!onPress && !danger);
  const content = (
    <>
      {icon ? (
        <View style={[styles.iconTile, danger && styles.iconTileDanger]}>
          <Icon name={icon} size={20} color={danger ? colors.error : colors.brand} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {chevron ? <Icon name="chevron-forward" size={18} color={colors.textTertiary} /> : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={[title, value, subtitle].filter(Boolean).join(', ')}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed, disabled && styles.rowDisabled]}
    >
      {content}
    </Pressable>
  );
}

export interface DetailRowProps {
  label: string;
  value?: string | null;
  children?: ReactNode;
}

export function DetailRow({ label, value, children }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {value ? (
        <Text style={styles.detailValue} selectable>
          {value}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export default ListGroup;
