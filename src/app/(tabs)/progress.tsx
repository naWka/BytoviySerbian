import { Alert, View } from 'react-native';

import { StatTile } from '@/components/lists';
import { Button, ProgressBar, Screen, Surface, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { summarize } from '@/lib/srs';
import { currentStreak, useStore } from '@/lib/store';

const DAY = 24 * 60 * 60 * 1000;

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}
const WEEKDAY = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export default function ProgressScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const stats = useStore((s) => s.stats);
  const reset = useStore((s) => s.resetProgress);
  const now = Date.now();

  const sum = summarize(content.all, progress, now);
  const streak = currentStreak(stats);
  const mastPct = (sum.review + sum.mastered) / Math.max(1, sum.total);

  const days = Array.from({ length: 7 }, (_, i) => {
    const ts = now - (6 - i) * DAY;
    return { key: dayKey(ts), label: WEEKDAY[new Date(ts).getDay()], count: 0 };
  });
  for (const d of days) d.count = stats.reviewsByDay[d.key] ?? 0;
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  const confirmReset = () =>
    Alert.alert('Сбросить прогресс?', 'Все повторения и статистика будут удалены. Сохранённые карточки останутся.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Сбросить', style: 'destructive', onPress: reset },
    ]);

  return (
    <Screen scroll>
      <Txt variant="title">Прогресс</Txt>

      <Surface style={{ marginTop: Spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Txt variant="h3">Выучено</Txt>
          <Txt variant="h3" color={c.gradeGood}>
            {Math.round(mastPct * 100)}%
          </Txt>
        </View>
        <View style={{ marginTop: Spacing.sm }}>
          <ProgressBar value={mastPct} color={c.gradeGood} height={10} />
        </View>
        <Txt variant="small" muted style={{ marginTop: Spacing.sm }}>
          {sum.review + sum.mastered} из {sum.total} карточек в работе
        </Txt>
      </Surface>

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
        <StatTile value={`${streak}`} label="Серия дней" color={c.warning} icon="flame" />
        <StatTile value={stats.totalReviews} label="Всего повторов" color={c.primary} icon="repeat" />
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
        <StatTile value={sum.mastered} label="Выучено" color={c.gradeGood} icon="checkmark-done" />
        <StatTile value={sum.new} label="Новые" color={c.textSecondary} icon="add-circle" />
      </View>

      <Txt variant="label" muted style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>
        Активность за неделю
      </Txt>
      <Surface>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 }}>
          {days.map((d) => (
            <View key={d.key} style={{ alignItems: 'center', flex: 1, gap: 6 }}>
              <View
                style={{
                  width: 18,
                  height: Math.max(4, (d.count / maxCount) * 76),
                  borderRadius: 6,
                  backgroundColor: d.count > 0 ? c.primary : c.surfaceAlt,
                }}
              />
              <Txt variant="small" muted>
                {d.label}
              </Txt>
            </View>
          ))}
        </View>
      </Surface>

      <Button label="Сбросить прогресс" variant="ghost" color={c.sos} onPress={confirmReset} style={{ marginTop: Spacing.xl }} />
    </Screen>
  );
}
