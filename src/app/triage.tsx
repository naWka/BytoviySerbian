// Разбор новых слов (BS-17): свайпы «знаю / учить / позже», пачками по 10.
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Confetti } from '@/components/Confetti';
import { SwipeCard, type Decision, type SwipeCardHandle } from '@/components/SwipeCard';
import { Button, Mono, ProgressBar, Screen, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dueWordQueue, newWordQueue } from '@/lib/learn';
import { useStore } from '@/lib/store';
import type { Card } from '@/lib/types';

const emptyResult = { know: 0, learn: 0, later: 0 };

function freshBatch(): Card[] {
  const s = useStore.getState();
  return newWordQueue(s.progress, s.buried, 10);
}

export default function TriageScreen() {
  const c = useTheme();
  const markKnown = useStore((s) => s.markKnown);
  const startLearning = useStore((s) => s.startLearning);
  const bury = useStore((s) => s.bury);

  const [queue, setQueue] = useState<Card[]>(freshBatch);
  const [i, setI] = useState(0);
  const [result, setResult] = useState({ ...emptyResult });
  const cardRef = useRef<SwipeCardHandle>(null);

  const onDecide = (d: Decision) => {
    const card = queue[i];
    if (!card) return;
    if (d === 'know') markKnown(card.id);
    else if (d === 'learn') startLearning(card.id);
    else bury(card.id);
    setResult((r) => ({ ...r, [d]: r[d] + 1 }));
    setI((x) => x + 1);
  };

  // Пусто с самого начала.
  if (queue.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Разбор слов' }} />
        <View style={styles.done}>
          <Ionicons name="sparkles-outline" size={56} color={c.primary} />
          <Txt variant="title" center>Новые слова кончились</Txt>
          <Txt variant="body" muted center>Ты разобрал все слова. Повторяй выученное или загляни в «Отложенные».</Txt>
          <Button label="Готово" icon="checkmark" onPress={() => router.back()} style={{ alignSelf: 'stretch', marginTop: Spacing.md }} />
        </View>
      </Screen>
    );
  }

  // Итог пачки.
  if (i >= queue.length) {
    const total = result.know + result.learn + result.later;
    const canLearn = dueWordQueue(useStore.getState().progress, Date.now()).length > 0;
    const moreNew = freshBatch().length > 0;
    return (
      <Screen scroll>
        <Stack.Screen options={{ title: 'Готово' }} />
        <Confetti />
        <Animated.View entering={FadeIn.duration(400)} style={styles.done}>
          <Ionicons name="checkmark-done-circle" size={64} color={c.say} />
          <Txt variant="title" center>Пачка разобрана</Txt>
          <Txt variant="body" muted center>Слов за раз: {total}</Txt>

          <View style={{ alignSelf: 'stretch', gap: Spacing.sm, marginTop: Spacing.md }}>
            <ResultRow icon="checkmark-circle" color={c.say} label="Уже знаю" value={result.know} />
            <ResultRow icon="school" color={c.primary} label="Буду учить" value={result.learn} />
            <ResultRow icon="time" color={c.snooze} label="Отложил" value={result.later} />
          </View>

          <View style={{ alignSelf: 'stretch', gap: Spacing.sm, marginTop: Spacing.lg }}>
            {canLearn ? (
              <Button label="Учить сейчас" icon="flash" onPress={() => router.replace('/session')} />
            ) : null}
            {moreNew ? (
              <Button
                label="Разобрать ещё"
                icon="albums"
                variant="soft"
                onPress={() => {
                  setQueue(freshBatch());
                  setI(0);
                  setResult({ ...emptyResult });
                }}
              />
            ) : null}
            <Button label="Готово" icon="checkmark" variant="ghost" onPress={() => router.back()} />
          </View>
        </Animated.View>
      </Screen>
    );
  }

  const card = queue[i];
  const next = queue[i + 1];

  return (
    <Screen padded={false} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Разбор слов' }} />
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 6 }}>
        <ProgressBar value={i / queue.length} />
        <Txt variant="small" muted>{i + 1} / {queue.length} · перемешаны темы</Txt>
      </View>

      <View style={styles.stage}>
        {next ? (
          <View style={[styles.peek, { backgroundColor: c.surface, borderColor: c.border }]} pointerEvents="none">
            <Txt center style={styles.peekSr} numberOfLines={1}>{next.sr}</Txt>
            <Mono color={c.textMuted} style={{ marginTop: 6 }}>{next.pron}</Mono>
          </View>
        ) : null}
        <View style={StyleSheet.absoluteFill}>
          <SwipeCard key={card.id} ref={cardRef} card={card} onDecide={onDecide} />
        </View>
      </View>

      <View style={styles.controls}>
        <ActionBtn icon="arrow-back" tint={c.primary} bg={c.primarySoft} label="Учить" onPress={() => cardRef.current?.fling('learn')} />
        <ActionBtn icon="arrow-down" tint={c.snooze} bg={c.snoozeSoft} label="Позже" onPress={() => cardRef.current?.fling('later')} />
        <ActionBtn icon="checkmark" tint={c.say} bg={c.saySoft} label="Знаю" onPress={() => cardRef.current?.fling('know')} />
      </View>
    </Screen>
  );
}

function ResultRow({ icon, color, label, value }: { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; value: number }) {
  const c = useTheme();
  return (
    <View style={[styles.resRow, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Txt variant="h3" style={{ flex: 1 }}>{label}</Txt>
      <Txt variant="h3" color={color}>{value}</Txt>
    </View>
  );
}

function ActionBtn({ icon, tint, bg, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; tint: string; bg: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', gap: 6 }} hitSlop={8}>
      {({ pressed }) => (
        <>
          <View style={[styles.circle, { backgroundColor: bg, borderColor: tint }, pressed && { transform: [{ scale: 0.92 }] }]}>
            <Ionicons name={icon} size={26} color={tint} />
          </View>
          <Txt variant="small" style={{ color: tint, fontWeight: '700' }}>{label}</Txt>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, margin: Spacing.lg, position: 'relative' },
  peek: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 0.93 }, { translateY: 18 }],
    opacity: 0.55,
    padding: Spacing.xl,
  },
  peekSr: { fontSize: 34, fontWeight: '800' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  circle: {
    width: 62,
    height: 62,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  resRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
