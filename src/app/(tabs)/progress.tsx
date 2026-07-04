import { Alert, View } from 'react-native';

import { StatTile } from '@/components/lists';
import { Button, Ring, Screen, Surface, Txt } from '@/components/ui';
import { Font, Radius, Spacing } from '@/constants/theme';
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

      <Surface elevated style={{ marginTop: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.xl }}>
        <Ring value={mastPct} size={104} stroke={11} color={c.gradeGood}>
          <Txt style={{ fontFamily: Font.black, fontSize: 26, color: c.gradeGood, letterSpacing: -0.5 }}>
            {Math.round(mastPct * 100)}%
          </Txt>
        </Ring>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt variant="h2">Выучено</Txt>
          <Txt variant="small" muted>
            {sum.review + sum.mastered} из {sum.total} карточек в работе
          </Txt>
        </View>
      </Surface>

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
        <StatTile value={`${streak}`} label="Серия дней" color={c.warning} icon="flame" />
        <StatTile value={stats.totalReviews} label="Всего повторов" color={c.primary} icon="repeat" />
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
        <StatTile value={sum.mastered} label="Выучено" color={c.gradeGood} icon="checkmark-done" />
        <StatTile value={sum.new} label="Новые" color={c.hear} icon="add-circle" />
      </View>

      <Txt variant="label" muted style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>
        Активность за неделю
      </Txt>
      <Surface elevated>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 116 }}>
          {days.map((d) => {
            const active = d.count > 0;
            return (
              <View key={d.key} style={{ alignItems: 'center', flex: 1, gap: 6 }}>
                {active ? (
                  <Txt style={{ fontFamily: Font.extrabold, fontSize: 12, color: c.primary }}>{d.count}</Txt>
                ) : null}
                <View
                  style={{
                    width: 20,
                    height: Math.max(6, (d.count / maxCount) * 80),
                    borderRadius: Radius.sm,
                    backgroundColor: active ? c.primary : c.surfaceAlt,
                  }}
                />
                <Txt variant="small" muted>
                  {d.label}
                </Txt>
              </View>
            );
          })}
        </View>
      </Surface>

      <Button label="Сбросить прогресс" variant="ghost" color={c.sos} onPress={confirmReset} style={{ marginTop: Spacing.xl }} />
    </Screen>
  );
}
