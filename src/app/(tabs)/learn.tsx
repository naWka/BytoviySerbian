import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StatTile } from '@/components/lists';
import { EmptyState, Screen, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { learnCounts } from '@/lib/learn';
import { currentStreak, useStore } from '@/lib/store';

export default function LearnScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const buried = useStore((s) => s.buried);
  const stats = useStore((s) => s.stats);
  const now = Date.now();

  const k = learnCounts(progress, buried, now);
  const streak = currentStreak(stats);
  const idle = k.due === 0 && k.toTriage === 0;

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt variant="title">Учить</Txt>
        <View style={[styles.streak, { backgroundColor: c.primarySoft }]}>
          <Ionicons name="flame" size={16} color={c.warning} />
          <Txt variant="small" style={{ color: c.primary, fontWeight: '800' }}>
            {streak} {streak === 1 ? 'день' : 'дн.'}
          </Txt>
        </View>
      </View>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        Разбирай новые слова и повторяй те, что пора. Приложение помнит, что ты уже знаешь.
      </Txt>

      {idle ? (
        <View style={{ marginTop: Spacing.xxl }}>
          <EmptyState icon="cafe-outline" title="На сегодня всё 🎉" subtitle="Новые слова разобраны, повторять пока нечего. Загляни позже." />
        </View>
      ) : null}

      <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
        {k.due > 0 ? (
          <Animated.View entering={FadeInDown.duration(360)}>
            <BigAction
              icon="flash"
              tint={c.primary}
              bg={c.primarySoft}
              count={k.due}
              title="Повторить"
              subtitle="слов пора повторить"
              onPress={() => router.push('/session')}
            />
          </Animated.View>
        ) : null}
        {k.toTriage > 0 ? (
          <Animated.View entering={FadeInDown.duration(360).delay(80)}>
            <BigAction
              icon="albums"
              tint={c.hear}
              bg={c.hearSoft}
              count={k.toTriage}
              title="Разобрать новые"
              subtitle="новых слов: знаю / учить / позже"
              onPress={() => router.push('/triage')}
            />
          </Animated.View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
        <StatTile value={k.learning} label="Учу" color={c.gradeHard} icon="school" />
        <StatTile value={k.mastered} label="Выучено" color={c.say} icon="checkmark-done" />
      </View>

      {k.buried > 0 ? (
        <Pressable
          onPress={() => router.push('/later')}
          style={({ pressed }) => [styles.laterRow, { backgroundColor: c.surface, borderColor: c.border }, pressed && { opacity: 0.75 }]}>
          <Ionicons name="time-outline" size={22} color={c.snooze} />
          <View style={{ flex: 1 }}>
            <Txt variant="h3">Отложенные</Txt>
            <Txt variant="small" muted>{k.buried} слов на потом</Txt>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
        </Pressable>
      ) : null}

      <Txt variant="small" muted center style={{ marginTop: Spacing.xl }}>
        Всего слов в приложении: {k.totalWords}
      </Txt>
    </Screen>
  );
}

function BigAction({
  icon,
  tint,
  bg,
  count,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  bg: string;
  count: number;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, { backgroundColor: c.surface, borderColor: c.border }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={26} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="h2">{title}</Txt>
        <Txt variant="small" muted style={{ marginTop: 2 }}>{subtitle}</Txt>
      </View>
      <Txt style={{ fontSize: 40, fontWeight: '800', color: tint, letterSpacing: -1 }}>{count}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.md,
  },
});
