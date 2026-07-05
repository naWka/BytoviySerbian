// BS-29 «Смотрю»: листание пула слов темы.
// Сначала вижу сербское слово. Тап по карточке = «не знаю» → показать перевод
// И сразу добавить слово в личный словарь (одним касанием). «Знаю» / «Пропустить» — не добавляем.
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
import { browsePool } from '@/lib/learn';
import { speak } from '@/lib/speech';
import { useStore } from '@/lib/store';

export default function BrowseDeckScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addToDictionary = useStore((s) => s.addToDictionary);
  const markKnown = useStore((s) => s.markKnown);

  const deck = id ? content.getDeck(id) : undefined;
  const [queue] = useState<string[]>(() => {
    const s = useStore.getState();
    return browsePool(id!, s.dictionary, s.progress).map((w) => w.id);
  });
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [added, setAdded] = useState(0);

  const card = useMemo(() => (i < queue.length ? content.getCard(queue[i]) : undefined), [queue, i]);

  const next = () => {
    setRevealed(false);
    setI((x) => x + 1);
  };

  // Тап по слову = не знаю → перевод + в словарь.
  const onReveal = () => {
    if (!card) return;
    addToDictionary(card.id);
    setAdded((x) => x + 1);
    speak(card.sr, { latin: card.srLatin });
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRevealed(true);
  };
  const onKnow = () => {
    if (!card) return;
    markKnown(card.id);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    next();
  };
  const onSkip = () => next();

  if (queue.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: deck?.titleRu ?? 'Смотрю' }} />
        <EmptyState icon="checkmark-done-circle-outline" title="Тема пересмотрена" subtitle="Все слова этой темы уже в словаре или отмечены «знаю»." />
        <Button label="К темам" icon="arrow-back" variant="soft" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (i >= queue.length) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Готово' }} />
        <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md }}>
          <Ionicons name="albums" size={64} color={c.primary} />
          <Txt variant="title" center>Тема пройдена</Txt>
          <Txt variant="body" muted center>Взято в словарь: {added}</Txt>
          <Button
            label="Учить сейчас"
            icon="school"
            onPress={() => router.replace('/study')}
            style={{ marginTop: Spacing.lg, alignSelf: 'stretch' }}
          />
          <Button label="Ещё тема" icon="albums-outline" variant="soft" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
        </Animated.View>
      </Screen>
    );
  }

  if (!card) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Смотрю' }} />
        <Button label="Дальше" onPress={next} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['bottom']}>
      <Stack.Screen options={{ title: deck?.titleRu ?? 'Смотрю' }} />
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 6 }}>
        <ProgressBar value={i / queue.length} />
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
                  <View style={[styles.addedTag, { backgroundColor: c.saySoft }]}>
                    <Ionicons name="add-circle" size={16} color={c.say} />
                    <Txt variant="small" color={c.say} style={{ fontWeight: '800' }}>В словаре</Txt>
                  </View>
                </>
              ) : (
                <View style={styles.hint}>
                  <Ionicons name="hand-left-outline" size={16} color={c.textMuted} />
                  <Txt variant="small" muted>Тапни — перевод + в словарь</Txt>
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </View>

      <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
        {revealed ? (
          <Button label="Дальше" icon="arrow-forward" onPress={next} />
        ) : (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Pressable onPress={onKnow} style={({ pressed }) => [styles.btn, { backgroundColor: c.saySoft }, pressed && { opacity: 0.82 }]}>
              <Ionicons name="checkmark-circle" size={20} color={c.say} />
              <Txt variant="body" color={c.say} style={{ fontWeight: '800' }}>Знаю</Txt>
            </Pressable>
            <Pressable onPress={onSkip} style={({ pressed }) => [styles.btn, { backgroundColor: c.snoozeSoft }, pressed && { opacity: 0.82 }]}>
              <Ionicons name="play-skip-forward" size={20} color={c.snooze} />
              <Txt variant="body" color={c.snooze} style={{ fontWeight: '800' }}>Пропустить</Txt>
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
    minHeight: 340,
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
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: Radius.md },
});
