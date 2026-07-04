import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { WordRow } from '@/components/WordRow';
import { Button, EmptyState, Screen, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { statusOf } from '@/lib/srs';
import { useStore } from '@/lib/store';

export default function DeckScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = content.getDeck(id);
  const progress = useStore((s) => s.progress);
  const [showKnown, setShowKnown] = useState(false);

  if (!deck) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Тема' }} />
        <EmptyState icon="alert-circle-outline" title="Тема не найдена" />
      </Screen>
    );
  }

  const learning = deck.cards.filter((card) => statusOf(progress[card.id]) !== 'mastered');
  const known = deck.cards.filter((card) => statusOf(progress[card.id]) === 'mastered');

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: deck.titleRu }} />

      <Button
        label="Учить эту тему"
        icon="flash"
        onPress={() => router.push({ pathname: '/review/[mode]', params: { mode: 'deck', id: deck.id } })}
      />
      <Txt variant="small" muted style={{ marginTop: Spacing.sm }}>
        Тапни слово, чтобы увидеть пример. «знаю ✓» — убрать из учёбы.
      </Txt>

      <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
        {learning.map((card) => (
          <WordRow key={card.id} card={card} />
        ))}
      </View>

      {learning.length === 0 ? (
        <View style={{ marginTop: Spacing.lg }}>
          <EmptyState icon="checkmark-done-circle-outline" title="Вся тема выучена 🎉" subtitle="Слова ниже, в «Выучено»." />
        </View>
      ) : null}

      {known.length > 0 ? (
        <>
          <Pressable
            onPress={() => setShowKnown((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xl, marginBottom: Spacing.sm }}>
            <Ionicons name={showKnown ? 'chevron-down' : 'chevron-forward'} size={18} color={c.textSecondary} />
            <Txt variant="label" color={c.say}>
              Выучено · {known.length}
            </Txt>
          </Pressable>
          {showKnown ? (
            <View style={{ gap: Spacing.sm }}>
              {known.map((card) => (
                <WordRow key={card.id} card={card} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
