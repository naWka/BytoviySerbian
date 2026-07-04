import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StatTile } from '@/components/lists';
import { EmptyState, Screen, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { learnCounts } from '@/lib/learn';
import { currentStreak, newToday, useStore } from '@/lib/store';

export default function LearnScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const suspended = useStore((s) => s.suspended);
  const stats = useStore((s) => s.stats);
  const now = Date.now();

  const k = learnCounts(progress, suspended, newToday(stats, now), now);
  const streak = currentStreak(stats);
  const idle = k.sessionSize === 0;

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
        Одно занятие: новые слова и повторение вперемешку. Сначала вспоминаешь сам — потом проверяешь.
      </Txt>

      {idle ? (
        <View style={{ marginTop: Spacing.xxl }}>
          <EmptyState icon="cafe-outline" title="На сегодня всё 🎉" subtitle="Повторять нечего, новые на сегодня разобраны. Загляни позже." />
        </View>
      ) : (
        <Animated.View entering={FadeInDown.duration(360)} style={{ marginTop: Spacing.lg }}>
          <Pressable
            onPress={() => router.push('/session')}
            style={({ pressed }) => [styles.action, { backgroundColor: c.surface, borderColor: c.border }, pressed && { transform: [{ scale: 0.98 }] }]}>
            <View style={[styles.iconWrap, { backgroundColor: c.primarySoft }]}>
              <Ionicons name="flash" size={26} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="h2">Учить сейчас</Txt>
              <Txt variant="small" muted style={{ marginTop: 2 }}>
                повторить {k.due} · новых {k.newAvailable}
              </Txt>
            </View>
            <Txt style={{ fontSize: 40, fontWeight: '800', color: c.primary, letterSpacing: -1 }}>{k.sessionSize}</Txt>
          </Pressable>
        </Animated.View>
      )}

      <View style={[styles.newInfo, { backgroundColor: c.surfaceAlt }]}>
        <Ionicons name="add-circle-outline" size={18} color={c.textSecondary} />
        <Txt variant="small" muted>
          Новых сегодня: {k.newDoneToday} из {k.newLimit}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
        <StatTile value={k.learning} label="Учу" color={c.gradeHard} icon="school" />
        <StatTile value={k.mastered} label="Выучено" color={c.say} icon="checkmark-done" />
      </View>

      {k.suspended > 0 ? (
        <Pressable
          onPress={() => router.push('/suspended')}
          style={({ pressed }) => [styles.laterRow, { backgroundColor: c.surface, borderColor: c.border }, pressed && { opacity: 0.75 }]}>
          <Ionicons name="eye-off-outline" size={22} color={c.snooze} />
          <View style={{ flex: 1 }}>
            <Txt variant="h3">Убранные</Txt>
            <Txt variant="small" muted>{k.suspended} слов вне учёбы</Txt>
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
  newInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
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
