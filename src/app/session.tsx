// Единое занятие (BS-18): один поток из просроченных + новых слов, перемешанных по темам.
// Активное вспоминание: вопрос → «Показать» → ответ → оценка. Две стороны (узнавание/говорение).
// Новые/забытые проходят короткие учебные шаги; «Не помню» — слово вернётся в конце занятия.
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

import { Confetti } from '@/components/Confetti';
import { FlipWordCard } from '@/components/FlipWordCard';
import { GradeBar } from '@/components/GradeBar';
import { Button, EmptyState, ProgressBar, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { sessionQueue } from '@/lib/learn';
import { sideOf, statusOf } from '@/lib/srs';
import { currentStreak, newToday, useStore } from '@/lib/store';
import type { Grade } from '@/lib/types';

export default function SessionScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const stats = useStore((s) => s.stats);
  const gradeFn = useStore((s) => s.grade);
  const suspendFn = useStore((s) => s.suspend);

  const [queue, setQueue] = useState<string[]>(() => {
    const s = useStore.getState();
    return sessionQueue(s.progress, s.suspended, newToday(s.stats), Date.now()).map((w) => w.id);
  });
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0); // слов завершено в этом занятии (не считая повторных заходов)

  const onGrade = (g: Grade) => {
    const id = queue[i];
    gradeFn(id, g);
    // Слово ещё на учебных шагах (в т.ч. «Не помню») → вернуть в конец занятия.
    const stillLearning = statusOf(useStore.getState().progress[id]) === 'learning';
    if (stillLearning) setQueue((q) => [...q, id]);
    else setDone((x) => x + 1);
    setRevealed(false);
    setI((x) => x + 1);
  };

  const onSuspend = () => {
    const id = queue[i];
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    suspendFn(id);
    setRevealed(false);
    setI((x) => x + 1);
  };

  if (queue.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Занятие' }} />
        <EmptyState icon="cafe-outline" title="На сегодня всё 🎉" subtitle="Повторять нечего и новые на сегодня разобраны. Загляни позже." />
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
          <Txt variant="body" muted center>Слов за занятие: {done}</Txt>
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
        <Stack.Screen options={{ title: 'Занятие' }} />
        <Button label="Дальше" onPress={() => setI((x) => x + 1)} />
      </Screen>
    );
  }

  const side = sideOf(progress[card.id]);

  return (
    <Screen padded={false} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Занятие' }} />
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={i / queue.length} />
          </View>
          <Pressable onPress={onSuspend} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="eye-off-outline" size={16} color={c.textMuted} />
            <Txt variant="small" muted>Убрать</Txt>
          </Pressable>
        </View>
        <Txt variant="small" muted>Осталось: {queue.length - i}</Txt>
      </View>

      <View style={{ flex: 1, padding: Spacing.lg }}>
        <Animated.View key={`${card.id}-${side}`} entering={SlideInRight.duration(260)} style={{ flex: 1 }}>
          <FlipWordCard card={card} side={side} revealed={revealed} onFlip={() => setRevealed(true)} />
        </Animated.View>
      </View>

      <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
        {revealed ? (
          <GradeBar prev={progress[card.id]} onGrade={onGrade} />
        ) : (
          <Button label={side === 'produce' ? 'Показать ответ' : 'Показать перевод'} icon="eye" onPress={() => setRevealed(true)} />
        )}
      </View>
    </Screen>
  );
}
