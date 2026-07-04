// Учебная SRS-сессия слов (BS-17): переворот-карточка + оценки. Только слова, которым пора.
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

import { Confetti } from '@/components/Confetti';
import { FlipWordCard } from '@/components/FlipWordCard';
import { GradeBar } from '@/components/GradeBar';
import { Button, EmptyState, ProgressBar, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { dueWordQueue } from '@/lib/learn';
import { currentStreak, useStore } from '@/lib/store';
import type { Grade } from '@/lib/types';

export default function SessionScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const stats = useStore((s) => s.stats);
  const gradeFn = useStore((s) => s.grade);

  const [queue, setQueue] = useState<string[]>(() => dueWordQueue(useStore.getState().progress, Date.now()).map((w) => w.id));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);

  const onGrade = (g: Grade) => {
    const id = queue[i];
    gradeFn(id, g);
    setDone((x) => x + 1);
    if (g === 'again') setQueue((q) => [...q, id]);
    setRevealed(false);
    setI((x) => x + 1);
  };

  if (queue.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Повторение' }} />
        <EmptyState icon="cafe-outline" title="Пока нечего повторять" subtitle="Разбери новые слова или загляни позже — они вернутся по расписанию." />
        <Button label="Назад" icon="arrow-back" variant="soft" onPress={() => router.back()} />
      </Screen>
    );
  }

  // Финиш.
  if (i >= queue.length) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Готово' }} />
        <Confetti />
        <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md }}>
          <Ionicons name="trophy" size={72} color={c.star} />
          <Txt variant="title" center>Отлично!</Txt>
          <Txt variant="body" muted center>Повторено слов: {done}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Ionicons name="flame" size={18} color={c.warning} />
            <Txt variant="h3">Серия: {currentStreak(stats)}</Txt>
          </View>
          <Button label="Закончить" icon="checkmark" onPress={() => router.back()} style={{ marginTop: Spacing.lg, alignSelf: 'stretch' }} />
        </Animated.View>
      </Screen>
    );
  }

  const card = content.getCard(queue[i]);
  if (!card) {
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
        <Txt variant="small" muted>Осталось: {queue.length - i}</Txt>
      </View>

      <View style={{ flex: 1, padding: Spacing.lg }}>
        <Animated.View key={card.id} entering={SlideInRight.duration(260)} style={{ flex: 1 }}>
          <FlipWordCard card={card} revealed={revealed} onFlip={() => setRevealed(true)} />
        </Animated.View>
      </View>

      <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
        {revealed ? (
          <GradeBar prev={progress[card.id]} onGrade={onGrade} />
        ) : (
          <Button label="Показать перевод" icon="eye" onPress={() => setRevealed(true)} />
        )}
      </View>
    </Screen>
  );
}
