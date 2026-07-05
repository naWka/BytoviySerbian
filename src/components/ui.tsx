// Базовые UI-примитивы: экран, типографика, кнопки, прогресс, кольцо, сегменты, чипы.
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { elevation, Font, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useGradients, useTheme } from '@/hooks/use-theme';
import { speak } from '@/lib/speech';
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

// --- Типографика (Nunito, вес несёт иерархию) ---

type TxtVariant = 'title' | 'h2' | 'h3' | 'body' | 'small' | 'label';

const VARIANT: Record<TxtVariant, TextStyle> = {
  title: { fontFamily: Font.black, fontSize: 30, letterSpacing: -0.5 },
  h2: { fontFamily: Font.extrabold, fontSize: 21, letterSpacing: -0.3 },
  h3: { fontFamily: Font.bold, fontSize: 17 },
  body: { fontFamily: Font.regular, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: Font.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: Font.extrabold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' },
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
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const c = useTheme();
  const resolved = color ?? (muted ? c.textSecondary : c.text);
  // Если снаружи задан свой fontSize без lineHeight — снимаем lineHeight варианта,
  // иначе крупный глиф режется в маленькой строке (баг «U» вместо «0»).
  const override = StyleSheet.flatten(style) as TextStyle | undefined;
  const base: TextStyle =
    override?.fontSize != null && override.lineHeight == null
      ? { ...VARIANT[variant], lineHeight: undefined }
      : VARIANT[variant];
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[base, { color: resolved }, center && { textAlign: 'center' }, style]}>
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
  elevated,
}: {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  accent?: string;
  elevated?: boolean;
}) {
  const c = useTheme();
  const base: ViewStyle = {
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: accent ?? c.border,
    padding: Spacing.lg,
    ...(elevated ? elevation(c.shadow, 1) : null),
    ...style,
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.85, transform: [{ scale: 0.995 }] }]}>
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
  gradient,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'soft' | 'ghost' | 'gradient';
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  gradient?: readonly [string, string];
  style?: ViewStyle;
}) {
  const c = useTheme();
  const g = useGradients();
  const accent = color ?? c.primary;

  if (variant === 'gradient') {
    const cols = gradient ?? g.primary;
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }, style]}>
        <LinearGradient
          colors={cols}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, elevation(accent, 1)]}>
          {icon ? <Ionicons name={icon} size={19} color={c.onPrimary} /> : null}
          <Text style={{ color: c.onPrimary, fontSize: 16, fontFamily: Font.extrabold }}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const bg = variant === 'primary' ? accent : variant === 'soft' ? c.surfaceAlt : 'transparent';
  const fg = variant === 'primary' ? c.onPrimary : accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg },
        variant === 'ghost' && { paddingHorizontal: Spacing.sm },
        pressed && { opacity: 0.82, transform: [{ scale: 0.99 }] },
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={19} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 16, fontFamily: Font.bold }}>{label}</Text>
    </Pressable>
  );
}

// --- Прогресс-бар ---

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const c = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, backgroundColor: c.surfaceAlt, borderRadius: Radius.pill, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color ?? c.primary, borderRadius: Radius.pill }} />
    </View>
  );
}

// --- Кольцо прогресса (дневная цель / выучено) ---

export function Ring({
  value,
  size = 92,
  stroke = 9,
  color,
  track,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const c = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const half = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={half} cy={half} r={r} stroke={track ?? c.surfaceAlt} strokeWidth={stroke} fill="none" />
        <Circle
          cx={half}
          cy={half}
          r={r}
          stroke={color ?? c.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          transform={`rotate(-90 ${half} ${half})`}
        />
      </Svg>
      {children}
    </View>
  );
}

// --- Плашка ---

export function Pill({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: Radius.pill, paddingHorizontal: 11, paddingVertical: 4, alignSelf: 'flex-start' }}>
      <Text style={{ color, fontSize: 12, fontFamily: Font.extrabold, letterSpacing: 0.2 }}>{text}</Text>
    </View>
  );
}

// --- Цветной чип-иконка (заливка + иконка) ---

export function IconChip({
  icon,
  color,
  bg,
  size = 46,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  size?: number;
}) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 3, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={size * 0.5} color={color} />
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
            style={[styles.seg, active && { backgroundColor: c.surface }, active && elevation(c.shadow, 1)]}>
            <Text
              style={{
                color: active ? (s.color ?? c.text) : c.textSecondary,
                fontFamily: active ? Font.extrabold : Font.semibold,
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

// --- Кнопка «слушать» (BS-25: озвучка сербского слова) ---

export function SpeakButton({
  text,
  latin,
  size = 22,
  soft = true,
}: {
  text: string;
  latin?: string;
  size?: number;
  soft?: boolean;
}) {
  const c = useTheme();
  const dim = size + 16;
  return (
    <Pressable
      onPress={() => speak(text, { latin })}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: soft ? c.primarySoft : 'transparent',
        },
        pressed && { opacity: 0.7 },
      ]}>
      <Ionicons name="volume-high" size={size} color={c.primary} />
    </Pressable>
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
      <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={40} color={c.primary} />
      </View>
      <Txt variant="h2" center style={{ marginTop: Spacing.lg }}>
        {title}
      </Txt>
      {subtitle ? (
        <Txt variant="small" muted center style={{ marginTop: Spacing.xs, maxWidth: 300 }}>
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
    paddingVertical: 15,
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
