import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Flashcard } from '@/components/Flashcard';
import { GradeBar } from '@/components/GradeBar';
import { Button, EmptyState, ProgressBar, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { buildQueue } from '@/lib/srs';
import { currentStreak, useStore } from '@/lib/store';
import type { Card, CardProgress, Grade } from '@/lib/types';

function poolFor(mode: string, id?: string): Card[] {
  switch (mode) {
    case 'deck':
      return id ? content.cardsOf('deck', id) : [];
    case 'saved':
      return useStore
        .getState()
        .savedIds()
        .map((cid) => content.getCard(cid))
        .filter(Boolean) as Card[];
    default:
      return content.all;
  }
}

// «due»: только просроченные + немного новых. Явная тренировка темы/сохранённого — все карточки, просроченные первыми.
function initialQueue(mode: string, id: string | undefined, progress: Record<string, CardProgress | undefined>): string[] {
  const now = Date.now();
  const pool = poolFor(mode, id);
  if (mode === 'due') return buildQueue(pool, progress, now, 20).map((c) => c.id);

  const due: { id: string; due: number }[] = [];
  const rest: string[] = [];
  for (const c of pool) {
    const p = progress[c.id];
    if (p && p.due <= now) due.push({ id: c.id, due: p.due });
    else rest.push(c.id);
  }
  due.sort((a, b) => a.due - b.due);
  return [...due.map((d) => d.id), ...rest];
}

export default function ReviewScreen() {
  const c = useTheme();
  const { mode = 'due', id } = useLocalSearchParams<{ mode: string; id?: string }>();
  const progress = useStore((s) => s.progress);
  const stats = useStore((s) => s.stats);
  const gradeFn = useStore((s) => s.grade);

  const [queue, setQueue] = useState<string[]>(() => initialQueue(mode, id, useStore.getState().progress));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);

  const onGrade = (g: Grade) => {
    const cardId = queue[i];
    gradeFn(cardId, g);
    setDone((x) => x + 1);
    if (g === 'again') setQueue((q) => [...q, cardId]);
    setRevealed(false);
    setI((x) => x + 1);
  };

  if (queue.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Повторение' }} />
        <EmptyState icon="checkmark-done-circle-outline" title="Нечего повторять" subtitle="Загляни позже — карточки вернутся по расписанию." />
      </Screen>
    );
  }

  // Финальный экран.
  if (i >= queue.length) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Готово' }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md }}>
          <Ionicons name="checkmark-done-circle" size={72} color={c.gradeGood} />
          <Txt variant="title" center>
            Готово!
          </Txt>
          <Txt variant="body" muted center>
            Повторено карточек: {done}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Ionicons name="flame" size={18} color={c.warning} />
            <Txt variant="h3">Серия: {currentStreak(stats)}</Txt>
          </View>
          <Button label="Закончить" icon="checkmark" onPress={() => router.back()} style={{ marginTop: Spacing.lg, alignSelf: 'stretch' }} />
        </View>
      </Screen>
    );
  }

  const card = content.getCard(queue[i]);
  if (!card) {
    // карточка исчезла (контент изменился) — пропустим
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Повторение' }} />
        <Button label="Дальше" onPress={() => setI((x) => x + 1)} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Повторение' }} />
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 6 }}>
        <ProgressBar value={i / queue.length} />
        <Txt variant="small" muted>
          Осталось: {queue.length - i}
        </Txt>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg }}
        showsVerticalScrollIndicator={false}>
        <Flashcard card={card} revealed={revealed} onPress={revealed ? undefined : () => setRevealed(true)} />
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
        {revealed ? (
          <GradeBar prev={progress[card.id]} onGrade={onGrade} />
        ) : (
          <Button label="Показать ответ" icon="eye" onPress={() => setRevealed(true)} />
        )}
      </View>
    </Screen>
  );
}
