// Строки списков (сценарии/колоды) и плитки статистики.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ProgressBar, Txt } from './ui';

export function ListRow({
  title,
  subtitle,
  accent,
  progress,
  dueBadge,
  onPress,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  progress?: number; // 0..1 доля выученного
  dueBadge?: number; // сколько пора повторить
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.surface, borderColor: c.border },
        pressed && { opacity: 0.75 },
      ]}>
      <View style={{ flex: 1 }}>
        <Txt variant="h3" numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="small" muted numberOfLines={1} style={{ marginTop: 2 }}>
            {subtitle}
          </Txt>
        ) : null}
        {progress !== undefined ? (
          <View style={{ marginTop: Spacing.sm }}>
            <ProgressBar value={progress} color={accent} height={6} />
          </View>
        ) : null}
      </View>
      <View style={styles.right}>
        {dueBadge ? (
          <View style={[styles.badge, { backgroundColor: c.primary }]}>
            <Txt variant="small" style={{ color: c.onPrimary, fontWeight: '800' }}>
              {dueBadge}
            </Txt>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
      </View>
    </Pressable>
  );
}

export function StatTile({
  value,
  label,
  color,
  icon,
}: {
  value: number | string;
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const c = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Txt variant="title" style={{ marginTop: Spacing.sm }}>
        {value}
      </Txt>
      <Txt variant="small" muted numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    minWidth: 100,
  },
});
