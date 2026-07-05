// Единое занятие (BS-18): один поток из просроченных + новых слов, перемешанных по темам.
// Три стороны:
//   узнавание (серб→рус) и «на слух» (BS-25) — вспоминаешь сам → «Показать» → оценка;
//   говорение (рус→серб, BS-27) — выбираешь ответ из вариантов, приложение проверяет
//   (BS-26: если у слова есть пример — вопрос идёт фразой с пропуском).
// Новые/забытые проходят короткие учебные шаги; «Не помню» — слово вернётся в конце занятия.
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

import { ChoiceGrid } from '@/components/ChoiceGrid';
import { Confetti } from '@/components/Confetti';
import { FlipWordCard } from '@/components/FlipWordCard';
import { GradeBar } from '@/components/GradeBar';
import { Button, EmptyState, ProgressBar, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { choicesFor, clozeFor } from '@/lib/exercise';
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
  const markKnownFn = useStore((s) => s.markKnown);
  const skipFn = useStore((s) => s.skip);

  const [queue, setQueue] = useState<string[]>(() => {
    const s = useStore.getState();
    return sessionQueue(s.progress, s.suspended, s.skipped, newToday(s.stats), Date.now()).map((w) => w.id);
  });
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null); // BS-27: выбранный вариант на говорении
  const [done, setDone] = useState(0); // слов завершено в этом занятии (не считая повторных заходов)

  const advance = (id: string, requeue: boolean) => {
    if (requeue) setQueue((q) => [...q, id]);
    else setDone((x) => x + 1);
    setRevealed(false);
    setPicked(null);
    setI((x) => x + 1);
  };

  // Узнавание / на слух: оценка после показа ответа.
  const onGrade = (g: Grade) => {
    const id = queue[i];
    gradeFn(id, g);
    const stillLearning = statusOf(useStore.getState().progress[id]) === 'learning';
    advance(id, stillLearning);
  };

  // BS-27: выбор варианта на говорении — сразу проверяем и переворачиваем на ответ.
  const onPick = (opt: string, correct: string) => {
    const id = queue[i];
    gradeFn(id, opt === correct ? 'good' : 'again');
    setPicked(opt);
    setRevealed(true);
  };
  const onNext = () => {
    const id = queue[i];
    const stillLearning = statusOf(useStore.getState().progress[id]) === 'learning';
    advance(id, stillLearning);
  };

  const onSuspend = () => {
    const id = queue[i];
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    suspendFn(id);
    setRevealed(false);
    setPicked(null);
    setI((x) => x + 1);
  };

  // BS-23: «Знаю ✓» на лице карточки — слово известно навсегда, из учёбы уходит.
  const onKnow = () => {
    const id = queue[i];
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    markKnownFn(id);
    setDone((x) => x + 1);
    setRevealed(false);
    setPicked(null);
    setI((x) => x + 1);
  };

  // BS-23: «Пропустить» — слово помечается пропущенным и уходит в хвост занятия.
  const onSkip = () => {
    const id = queue[i];
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    skipFn(id);
    setQueue((q) => [...q, id]); // в самый конец очереди
    setRevealed(false);
    setPicked(null);
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

  const side = sideOf(progress[card.id], card.id);
  const produce = side === 'produce';
  const cloze = produce ? clozeFor(card) : null;
  const options = produce ? choicesFor(card) : null;

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
          <FlipWordCard
            card={card}
            side={side}
            cloze={cloze}
            revealed={revealed}
            hideHint={produce}
            onFlip={produce ? () => {} : () => setRevealed(true)}
          />
        </Animated.View>
      </View>

      <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
        {produce && options ? (
          <View style={{ gap: Spacing.sm }}>
            <ChoiceGrid options={options} correct={card.sr} picked={picked} onPick={(opt) => onPick(opt, card.sr)} />
            {picked === null ? (
              <Pressable onPress={onSkip} hitSlop={6} style={{ alignSelf: 'center', paddingVertical: 6 }}>
                <Txt variant="small" color={c.snooze} style={{ fontWeight: '700' }}>Пропустить</Txt>
              </Pressable>
            ) : (
              <Button label="Дальше" icon="arrow-forward" onPress={onNext} />
            )}
          </View>
        ) : revealed ? (
          <GradeBar prev={progress[card.id]} onGrade={onGrade} />
        ) : (
          <View style={{ gap: Spacing.sm }}>
            <Button label={side === 'listen' ? 'Показать ответ' : 'Показать перевод'} icon="eye" onPress={() => setRevealed(true)} />
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Pressable
                onPress={onKnow}
                style={({ pressed }) => [styles.faceBtn, { backgroundColor: c.saySoft }, pressed && { opacity: 0.82 }]}>
                <Ionicons name="checkmark-circle" size={20} color={c.say} />
                <Txt variant="body" color={c.say} style={{ fontWeight: '800' }}>Знаю</Txt>
              </Pressable>
              <Pressable
                onPress={onSkip}
                style={({ pressed }) => [styles.faceBtn, { backgroundColor: c.snoozeSoft }, pressed && { opacity: 0.82 }]}>
                <Ionicons name="play-skip-forward" size={20} color={c.snooze} />
                <Txt variant="body" color={c.snooze} style={{ fontWeight: '800' }}>Пропустить</Txt>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  faceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
});
