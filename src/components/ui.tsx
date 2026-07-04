// Базовые UI-примитивы: экран, типографика, кнопки, прогресс-бар, сегменты.
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/lib/store';

// --- Экран ---

export function Screen({
  children,
  scroll,
  edges = ['top'],
  padded = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  contentStyle?: ViewStyle;
}) {
  const c = useTheme();
  const inner: ViewStyle = {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: padded ? Spacing.lg : 0,
    ...contentStyle,
  };
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: c.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[inner, { paddingBottom: Spacing.xxl * 2 }]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

// --- Типографика ---

type TxtVariant = 'title' | 'h2' | 'h3' | 'body' | 'small' | 'label';

const VARIANT: Record<TxtVariant, TextStyle> = {
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
};

export function Txt({
  children,
  variant = 'body',
  color,
  muted,
  center,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  variant?: TxtVariant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  const c = useTheme();
  const resolved = color ?? (muted ? c.textSecondary : c.text);
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[VARIANT[variant], { color: resolved }, center && { textAlign: 'center' }, style]}>
      {children}
    </Text>
  );
}

export function Mono({ children, color, style }: { children: ReactNode; color?: string; style?: TextStyle }) {
  const c = useTheme();
  return (
    <Text style={[{ fontFamily: Fonts.mono, fontSize: 15, color: color ?? c.textSecondary }, style]}>
      {children}
    </Text>
  );
}

// --- Поверхность / карточка ---

export function Surface({
  children,
  style,
  onPress,
  accent,
}: {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  accent?: string;
}) {
  const c = useTheme();
  const base: ViewStyle = {
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: accent ?? c.border,
    padding: Spacing.lg,
    ...style,
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.75 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
}

// --- Кнопка ---

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  color,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'soft' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  style?: ViewStyle;
}) {
  const c = useTheme();
  const accent = color ?? c.primary;
  const bg = variant === 'primary' ? accent : variant === 'soft' ? c.surfaceAlt : 'transparent';
  const fg = variant === 'primary' ? c.onPrimary : accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg },
        variant === 'ghost' && { paddingHorizontal: Spacing.sm },
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

// --- Прогресс-бар ---

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const c = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, backgroundColor: c.surfaceAlt, borderRadius: Radius.pill, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color ?? c.primary }} />
    </View>
  );
}

// --- Плашка ---

export function Pill({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

// --- Сегменты (переключатель секций) ---

export interface Segment {
  key: string;
  label: string;
  color?: string;
}

export function SegmentedControl({
  segments,
  value,
  onChange,
}: {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
}) {
  const c = useTheme();
  return (
    <View style={[styles.segWrap, { backgroundColor: c.surfaceAlt }]}>
      {segments.map((s) => {
        const active = s.key === value;
        return (
          <Pressable
            key={s.key}
            onPress={() => onChange(s.key)}
            style={[styles.seg, active && { backgroundColor: c.surface }]}>
            <Text
              style={{
                color: active ? (s.color ?? c.text) : c.textSecondary,
                fontWeight: active ? '700' : '500',
                fontSize: 14,
              }}>
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// --- Звезда «сохранить» ---

export function SaveButton({ cardId, size = 26 }: { cardId: string; size?: number }) {
  const c = useTheme();
  const saved = useStore((s) => !!s.saved[cardId]);
  const toggle = useStore((s) => s.toggleSaved);
  return (
    <Pressable onPress={() => toggle(cardId)} hitSlop={10}>
      <Ionicons name={saved ? 'star' : 'star-outline'} size={size} color={saved ? c.star : c.textMuted} />
    </Pressable>
  );
}

// --- Пусто ---

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  subtitle,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  const c = useTheme();
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={44} color={c.textMuted} />
      <Txt variant="h3" center style={{ marginTop: Spacing.md }}>
        {title}
      </Txt>
      {subtitle ? (
        <Txt variant="small" muted center style={{ marginTop: Spacing.xs }}>
          {subtitle}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  segWrap: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
    gap: 4,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
});
