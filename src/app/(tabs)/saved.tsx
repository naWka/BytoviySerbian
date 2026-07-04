import { router } from 'expo-router';
import { View } from 'react-native';

import { Flashcard } from '@/components/Flashcard';
import { Button, EmptyState, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { content } from '@/lib/content';
import { useStore } from '@/lib/store';
import type { Card } from '@/lib/types';

export default function SavedScreen() {
  const saved = useStore((s) => s.saved);
  const ids = Object.keys(saved);
  const cards = ids.map((id) => content.getCard(id)).filter(Boolean) as Card[];

  if (cards.length === 0) {
    return (
      <Screen>
        <Txt variant="title">Сохранённое</Txt>
        <View style={{ flex: 1 }}>
          <EmptyState
            icon="star-outline"
            title="Пока ничего не сохранено"
            subtitle="Нажми ★ на любой карточке — она появится здесь."
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Txt variant="title">Сохранённое</Txt>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        {cards.length} {cards.length === 1 ? 'карточка' : 'карточек'}
      </Txt>

      <Button
        label="Повторить сохранённое"
        icon="play"
        onPress={() => router.push({ pathname: '/review/[mode]', params: { mode: 'saved' } })}
        style={{ marginTop: Spacing.lg }}
      />

      <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
        {cards.map((card) => (
          <Flashcard key={card.id} card={card} />
        ))}
      </View>
    </Screen>
  );
}
