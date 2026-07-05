// BS-29 «Смотрю»: листание пула слов. id='all' → перемешанный поток из всех тем.
// Сначала вижу сербское слово. «Показать перевод» (или тап по карточке) = не знаю →
// перевод + слово сразу в личный словарь. «Знаю» / «Пропустить» — не добавляем.
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

import { Button, EmptyState, Mono, ProgressBar, Screen, SpeakButton, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { browseCandidates } from '@/lib/learn';
import { useStore } from '@/lib/store';

const POOL = 20;

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BrowseDeckScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mixed = id === 'all';
  const addToDictionary = useStore((s) => s.addToDictionary);
  const markKnown = useStore((s) => s.markKnown);

  const deck = !mixed && id ? content.getDeck(id) : undefined;
  const title = mixed ? 'Смотрю' : (deck?.titleRu ?? 'Смотрю');

  const build = () => {
    const s = useStore.getState();
    return shuffled(browseCandidates(mixed ? null : id!, s.dictionary, s.progress)).slice(0, POOL).map((w) => w.id);
  };

  const [queue, setQueue] = useState<string[]>(build);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [added, setAdded] = useState(0);

  const card = useMemo(() => (i < queue.length ? content.getCard(queue[i]) : undefined), [queue, i]);

  const next = () => {
    setRevealed(false);
    setI((x) => x + 1);
  };
  const restart = () => {
    setQueue(build());
    setI(0);
    setAdded(0);
    setRevealed(false);
  };

  // «Не знаю» → просто показать перевод (решение «брать/нет» — уже после перевода).
  const onReveal = () => {
    if (!card) return;
    setRevealed(true);
  };
  // На лице: «Знаю» — не добавляем, помечаем известным (больше не покажем).
  const onKnow = () => {
    if (!card) return;
    markKnown(card.id);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    next();
  };
  // После перевода: «В словарь» — беру учить.
  const onAdd = () => {
    if (!card) return;
    addToDictionary(card.id);
    setAdded((x) => x + 1);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    next();
  };

  if (queue.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title }} />
        <EmptyState icon="checkmark-done-circle-outline" title="Всё пересмотрено" subtitle="Слова уже в словаре или отмечены «знаю»." />
        <Button label="Назад" icon="arrow-back" variant="soft" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (i >= queue.length) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Готово' }} />
        <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md }}>
          <Ionicons name="albums" size={64} color={c.primary} />
          <Txt variant="title" center>Пул пройден</Txt>
          <Txt variant="body" muted center>Взято в словарь: {added}</Txt>
          <Button label="Учить сейчас" icon="school" onPress={() => router.replace('/study')} style={{ marginTop: Spacing.lg, alignSelf: 'stretch' }} />
          <Button label="Ещё слова" icon="refresh" variant="soft" onPress={restart} style={{ alignSelf: 'stretch' }} />
          <Button label="В меню" variant="ghost" onPress={() => router.back()} />
        </Animated.View>
      </Screen>
    );
  }

  if (!card) {
    return (
      <Screen>
        <Stack.Screen options={{ title }} />
        <Button label="Дальше" onPress={next} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['bottom']}>
      <Stack.Screen options={{ title }} />
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={i / queue.length} />
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="close" size={18} color={c.textMuted} />
            <Txt variant="small" muted>Выйти</Txt>
          </Pressable>
        </View>
        <Txt variant="small" muted>Осталось: {queue.length - i}</Txt>
      </View>

      <View style={{ flex: 1, padding: Spacing.lg }}>
        <Animated.View key={card.id} entering={SlideInRight.duration(240)} style={{ flex: 1 }}>
          <Pressable
            onPress={revealed ? undefined : onReveal}
            style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <SpeakButton text={card.sr} latin={card.srLatin} />
            </View>
            <View style={styles.center}>
              <Txt center style={styles.sr}>{card.sr}</Txt>
              <View style={[styles.pron, { backgroundColor: c.surfaceAlt }]}>
                <Ionicons name="volume-medium-outline" size={16} color={c.primary} />
                <Mono color={c.text}>{card.pron}</Mono>
              </View>

              {revealed ? (
                <>
                  <Txt center style={styles.ru}>{card.ru}</Txt>
                  {card.exampleSr ? (
                    <View style={[styles.sub, { backgroundColor: c.surfaceAlt }]}>
                      <Txt center style={{ fontStyle: 'italic' }}>{card.exampleSr}</Txt>
                      {card.exampleRu ? <Txt variant="small" muted center style={{ marginTop: 4 }}>{card.exampleRu}</Txt> : null}
                    </View>
                  ) : null}
                  {card.note ? (
                    <View style={[styles.sub, { backgroundColor: c.sosSoft }]}>
                      <Txt variant="small" style={{ color: c.warning, fontWeight: '700' }}>⚠️ Ложный друг</Txt>
                      <Txt variant="small" center style={{ marginTop: 2 }}>{card.note}</Txt>
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>
          </Pressable>
        </Animated.View>
      </View>

      <View style={{ padding: Spacing.lg, paddingTop: 0, gap: Spacing.sm }}>
        {revealed ? (
          // После перевода: беру учить / уже знаю / пропустить.
          <>
            <Pressable onPress={onAdd} style={({ pressed }) => [styles.btn, { backgroundColor: c.say }, pressed && { opacity: 0.85 }]}>
              <Ionicons name="add-circle" size={20} color={c.onPrimary} />
              <Txt variant="body" color={c.onPrimary} style={{ fontWeight: '800' }}>В словарь</Txt>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Pressable onPress={onKnow} style={({ pressed }) => [styles.btn, { backgroundColor: c.saySoft }, pressed && { opacity: 0.82 }]}>
                <Ionicons name="checkmark-circle" size={20} color={c.say} />
                <Txt variant="body" color={c.say} style={{ fontWeight: '800' }}>Знаю</Txt>
              </Pressable>
              <Pressable onPress={next} style={({ pressed }) => [styles.btn, { backgroundColor: c.snoozeSoft }, pressed && { opacity: 0.82 }]}>
                <Ionicons name="play-skip-forward" size={20} color={c.snooze} />
                <Txt variant="body" color={c.snooze} style={{ fontWeight: '800' }}>Пропустить</Txt>
              </Pressable>
            </View>
          </>
        ) : (
          // Лицо: знаю слово или нет.
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Pressable onPress={onKnow} style={({ pressed }) => [styles.btn, { backgroundColor: c.saySoft }, pressed && { opacity: 0.82 }]}>
              <Ionicons name="checkmark-circle" size={20} color={c.say} />
              <Txt variant="body" color={c.say} style={{ fontWeight: '800' }}>Знаю</Txt>
            </Pressable>
            <Pressable onPress={onReveal} style={({ pressed }) => [styles.btn, { backgroundColor: c.primary }, pressed && { opacity: 0.85 }]}>
              <Ionicons name="eye" size={20} color={c.onPrimary} />
              <Txt variant="body" color={c.onPrimary} style={{ fontWeight: '800' }}>Не знаю</Txt>
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 300,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  sr: { fontSize: 40, fontWeight: '800', lineHeight: 46, letterSpacing: -0.5 },
  ru: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  pron: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 8, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  sub: { borderRadius: Radius.md, padding: Spacing.md, alignSelf: 'stretch', alignItems: 'center' },
  addedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: Radius.md },
});
