// Вкладка «Учить» = хаб двух режимов (BS-29/BS-30):
//   «Смотрю» — листаю слова и набираю личный словарь;
//   «Учу» — заучиваю набранное упражнениями (автооценка, уровни).
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StatTile } from '@/components/lists';
import { Screen, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { studyCounts } from '@/lib/learn';
import { currentStreak, newToday, useStore } from '@/lib/store';

export default function LearnScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const dictionary = useStore((s) => s.dictionary);
  const stats = useStore((s) => s.stats);
  const now = Date.now();

  const k = studyCounts(dictionary, progress, newToday(stats, now), now);
  const streak = currentStreak(stats);

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
        Сначала «Смотрю» — набираешь слова в свой словарь. Потом «Учу» — заучиваешь упражнениями.
      </Txt>

      {/* Смотрю */}
      <Animated.View entering={FadeInDown.duration(320)} style={{ marginTop: Spacing.lg }}>
        <Pressable
          onPress={() => router.push('/browse')}
          style={({ pressed }) => [styles.action, { backgroundColor: c.surface, borderColor: c.border }, pressed && { transform: [{ scale: 0.98 }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: c.hearSoft }]}>
            <Ionicons name="eye" size={26} color={c.hear} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="h2">Смотрю</Txt>
            <Txt variant="small" muted style={{ marginTop: 2 }}>листаю слова, беру в словарь</Txt>
          </View>
          <Ionicons name="chevron-forward" size={22} color={c.textMuted} />
        </Pressable>
      </Animated.View>

      {/* Учу */}
      <Animated.View entering={FadeInDown.duration(360)} style={{ marginTop: Spacing.md }}>
        <Pressable
          onPress={() => router.push('/study')}
          disabled={k.sessionSize === 0}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: c.surface, borderColor: c.border },
            k.sessionSize === 0 && { opacity: 0.6 },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}>
          <View style={[styles.iconWrap, { backgroundColor: c.primarySoft }]}>
            <Ionicons name="school" size={26} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="h2">Учу</Txt>
            <Txt variant="small" muted style={{ marginTop: 2 }}>
              {k.inDict === 0
                ? 'сначала набери слова в «Смотрю»'
                : k.sessionSize === 0
                  ? 'на сегодня всё разобрано'
                  : `повторить ${k.due} · новых ${k.newAvailable}`}
            </Txt>
          </View>
          {k.sessionSize > 0 ? (
            <Txt style={{ fontSize: 40, fontWeight: '800', color: c.primary, letterSpacing: -1 }}>{k.sessionSize}</Txt>
          ) : (
            <Ionicons name="chevron-forward" size={22} color={c.textMuted} />
          )}
        </Pressable>
      </Animated.View>

      <View style={[styles.newInfo, { backgroundColor: c.surfaceAlt }]}>
        <Ionicons name="add-circle-outline" size={18} color={c.textSecondary} />
        <Txt variant="small" muted>Новых сегодня: {k.newDoneToday} из {k.newLimit}</Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
        <StatTile value={k.learning} label="Учу" color={c.gradeHard} icon="school" />
        <StatTile value={k.mastered} label="Выучено" color={c.say} icon="checkmark-done" />
      </View>

      {/* Мой словарь */}
      <Pressable
        onPress={() => router.push('/dictionary')}
        style={({ pressed }) => [styles.laterRow, { backgroundColor: c.surface, borderColor: c.border }, pressed && { opacity: 0.75 }]}>
        <Ionicons name="library-outline" size={22} color={c.primary} />
        <View style={{ flex: 1 }}>
          <Txt variant="h3">Мой словарь</Txt>
          <Txt variant="small" muted>{k.inDict} слов</Txt>
        </View>
        <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
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
