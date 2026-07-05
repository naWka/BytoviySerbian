// BS-30 «Учу»: занятие по личному словарю упражнениями (без ручной самооценки).
// Оценка автоматическая: верно → слово растёт (grade good), ошибся → возвращается (again).
// Типы упражнений по уровню владения:
//   опенер «соедини пары» (быстрый повтор пула, если ≥2 подходящих) →
//   далее по одному: «выбор из 4» (свежие) и «собери из букв» (кто уже покрепче).
// Интервалы нигде не показываем — только уровень (Новое/Закрепляю/Уверенно/Выучено).
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

import { AssembleWord } from '@/components/AssembleWord';
import { ChoiceGrid } from '@/components/ChoiceGrid';
import { Confetti } from '@/components/Confetti';
import { MatchPairs } from '@/components/MatchPairs';
import { Button, EmptyState, LevelBar, Mono, ProgressBar, Screen, SpeakButton, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { canAssemble, choicesFor } from '@/lib/exercise';
import { studyQueue } from '@/lib/learn';
import { levelOf, statusOf } from '@/lib/srs';
import { newToday, useStore } from '@/lib/store';
import { currentStreak } from '@/lib/store';
import type { Card, Grade } from '@/lib/types';

const PAIRS = 4; // размер опенера «соедини пары»

function idHash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function StudyScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const stats = useStore((s) => s.stats);
  const gradeFn = useStore((s) => s.grade);

  // Строим очередь один раз при входе. Первые PAIRS слов уходят в опенер «пары».
  const initial = useMemo(() => {
    const s = useStore.getState();
    const ids = studyQueue(s.dictionary, s.progress, newToday(s.stats), Date.now()).map((w) => w.id);
    const pairIds = ids.length >= PAIRS ? ids.slice(0, PAIRS) : [];
    const rest = ids.slice(pairIds.length);
    return { pairIds, rest };
  }, []);

  const [phase, setPhase] = useState<'pairs' | 'single'>(initial.pairIds.length >= 2 ? 'pairs' : 'single');
  const [queue, setQueue] = useState<string[]>(initial.rest);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null); // выбор в choice
  const [assembleResult, setAssembleResult] = useState<boolean | null>(null); // результат сборки
  const [done, setDone] = useState(0);

  const pairCards = useMemo(
    () => initial.pairIds.map((id) => content.getCard(id)).filter(Boolean) as Card[],
    [initial.pairIds],
  );

  const answered = picked !== null || assembleResult !== null;

  const finalizeGrade = (id: string, g: Grade) => {
    gradeFn(id, g);
    return statusOf(useStore.getState().progress[id]) === 'learning';
  };

  const advance = (id: string, requeue: boolean) => {
    if (requeue) setQueue((q) => [...q, id]);
    else setDone((x) => x + 1);
    setPicked(null);
    setAssembleResult(null);
    setI((x) => x + 1);
  };

  // Безопасный выход: есть куда назад — назад, иначе на хаб (web/refresh без истории).
  const goHome = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/learn');
  };

  // Опенер «пары» завершён — оцениваем каждую карточку и уходим в одиночные упражнения.
  const onPairsDone = (results: { id: string; correct: boolean }[]) => {
    const extra: string[] = [];
    for (const r of results) {
      const requeue = finalizeGrade(r.id, r.correct ? 'good' : 'again');
      if (r.correct && !requeue) setDone((x) => x + 1);
      else extra.push(r.id);
    }
    if (extra.length) setQueue((q) => [...extra, ...q]);
    setPhase('single');
  };

  // Экран пусто.
  if (queue.length === 0 && pairCards.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Учу' }} />
        <EmptyState
          icon="book-outline"
          title="Словарь пуст или всё выучено"
          subtitle="Загляни в «Смотрю» — набери слова, потом возвращайся сюда учить."
        />
        <Button label="Смотрю" icon="eye" onPress={() => router.replace('/browse')} />
        <Button label="Назад" variant="soft" onPress={goHome} style={{ marginTop: Spacing.sm }} />
      </Screen>
    );
  }

  // Опенер «пары».
  if (phase === 'pairs') {
    return (
      <Screen padded={false} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Учу · пары' }} />
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, alignItems: 'flex-end' }}>
          <Pressable onPress={goHome} hitSlop={8} style={styles.exit}>
            <Ionicons name="close" size={18} color={c.textMuted} />
            <Txt variant="small" muted>Выйти</Txt>
          </Pressable>
        </View>
        <View style={{ padding: Spacing.lg, flex: 1, justifyContent: 'center' }}>
          <MatchPairs cards={pairCards} onDone={onPairsDone} />
        </View>
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
          <Button label="Закончить" icon="checkmark" onPress={goHome} style={{ marginTop: Spacing.lg, alignSelf: 'stretch' }} />
        </Animated.View>
      </Screen>
    );
  }

  const card = content.getCard(queue[i]);
  if (!card) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Учу' }} />
        <Button label="Дальше" onPress={() => setI((x) => x + 1)} />
      </Screen>
    );
  }

  const level = levelOf(progress[card.id]);
  // Тип упражнения: собери из букв, если слово подходит и (уже не совсем новое ИЛИ по хешу — для разнообразия).
  const useAssemble = canAssemble(card.sr) && (level.idx >= 1 || idHash(card.id) % 2 === 0);

  const onChoice = (opt: string) => {
    finalizeGrade(card.id, opt === card.sr ? 'good' : 'again'); // requeue пересчитаем при «Дальше»
    setPicked(opt);
  };
  const onAssemble = (correct: boolean) => {
    finalizeGrade(card.id, correct ? 'good' : 'again'); // сборка тоже двигает слово
    setAssembleResult(correct);
  };

  const onNext = () => {
    const requeue = statusOf(useStore.getState().progress[card.id]) === 'learning';
    advance(card.id, requeue);
  };

  return (
    <Screen padded={false} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Учу' }} />
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={i / queue.length} />
          </View>
          <Pressable onPress={goHome} hitSlop={8} style={styles.exit}>
            <Ionicons name="close" size={18} color={c.textMuted} />
            <Txt variant="small" muted>Выйти</Txt>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt variant="small" muted>Осталось: {queue.length - i}</Txt>
          <LevelBar idx={level.idx} label={level.label} />
        </View>
      </View>

      <View style={{ flex: 1, padding: Spacing.lg, justifyContent: 'center' }}>
        <Animated.View key={`${card.id}-${useAssemble ? 'a' : 'c'}`} entering={SlideInRight.duration(240)}>
          {useAssemble ? (
            <AssembleWord card={card} onResult={onAssemble} />
          ) : (
            <View style={{ gap: Spacing.lg }}>
              <View style={{ alignItems: 'center', gap: Spacing.sm }}>
                <Txt variant="small" muted>Как будет по-сербски:</Txt>
                <Txt variant="title" center>{card.ru}</Txt>
                {answered ? (
                  <View style={[styles.pron, { backgroundColor: c.surfaceAlt }]}>
                    <SpeakButton text={card.sr} latin={card.srLatin} size={16} soft={false} />
                    <Mono color={c.text}>{card.pron}</Mono>
                  </View>
                ) : null}
              </View>
              <ChoiceGrid options={choicesFor(card)} correct={card.sr} picked={picked} onPick={onChoice} />
            </View>
          )}

          {answered && card.exampleSr ? (
            <View style={[styles.sub, { backgroundColor: c.surfaceAlt }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'center' }}>
                <Txt center style={{ fontStyle: 'italic', flexShrink: 1 }}>{card.exampleSr}</Txt>
                <SpeakButton text={card.exampleSr} size={16} soft={false} />
              </View>
              {card.exampleRu ? <Txt variant="small" muted center style={{ marginTop: 4 }}>{card.exampleRu}</Txt> : null}
            </View>
          ) : null}
        </Animated.View>
      </View>

      <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
        {answered ? <Button label="Дальше" icon="arrow-forward" onPress={onNext} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pron: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  sub: { borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.lg, alignItems: 'center' },
  exit: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
