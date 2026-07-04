// Строки списков (колоды) и плитки статистики.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { elevation, Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { IconChip, ProgressBar, Txt } from './ui';

export function ListRow({
  title,
  subtitle,
  accent,
  icon = 'albums',
  progress,
  dueBadge,
  onPress,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  progress?: number; // 0..1 доля выученного
  dueBadge?: number; // сколько пора повторить
  onPress: () => void;
}) {
  const c = useTheme();
  const tint = accent ?? c.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.surface, borderColor: c.border },
        elevation(c.shadow, 1),
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}>
      <IconChip icon={icon} color={tint} bg={softFor(tint, c)} />
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
            <ProgressBar value={progress} color={tint} height={6} />
          </View>
        ) : null}
      </View>
      <View style={styles.right}>
        {dueBadge ? (
          <View style={[styles.badge, { backgroundColor: tint }]}>
            <Txt variant="small" style={{ color: c.onPrimary, fontFamily: Font.extrabold }}>
              {dueBadge}
            </Txt>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
      </View>
    </Pressable>
  );
}

// Мягкий фон под цвет акцента (для чипа). Совпадает с семантикой темы там, где можем.
function softFor(tint: string, c: ReturnType<typeof useTheme>): string {
  switch (tint) {
    case c.primary:
      return c.primarySoft;
    case c.hear:
      return c.hearSoft;
    case c.say:
      return c.saySoft;
    case c.accent:
      return c.accentSoft;
    case c.snooze:
      return c.snoozeSoft;
    case c.sos:
      return c.sosSoft;
    default:
      return c.surfaceAlt;
  }
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
    <View style={[styles.tile, { backgroundColor: c.surface, borderColor: c.border }, elevation(c.shadow, 1)]}>
      <IconChip icon={icon} color={color} bg={softFor(color, c)} size={38} />
      <Txt style={{ fontFamily: Font.black, fontSize: 30, letterSpacing: -0.5, marginTop: Spacing.sm, color }}>
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
