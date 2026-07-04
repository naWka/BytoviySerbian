// Убранные из учёбы слова (BS-18): список, каждое можно вернуть в учёбу.
import { Stack } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';

import { Button, EmptyState, Mono, Screen, Surface, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { suspendedWords } from '@/lib/learn';
import { useStore } from '@/lib/store';

export default function SuspendedScreen() {
  const suspended = useStore((s) => s.suspended);
  const unsuspend = useStore((s) => s.unsuspend);
  const cards = suspendedWords(suspended);

  if (cards.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Убранные' }} />
        <View style={{ flex: 1 }}>
          <EmptyState icon="eye-off-outline" title="Убранных нет" subtitle="На карточке в занятии кнопка «Убрать» кладёт слово сюда." />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Убранные' }} />
      <Txt variant="title">Убранные</Txt>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        {cards.length} {cards.length === 1 ? 'слово' : 'слов'} вне учёбы. Верни любое обратно в занятия.
      </Txt>

      <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
        {cards.map((card) => (
          <Animated.View key={card.id} layout={LinearTransition} exiting={FadeOut.duration(200)}>
            <Surface>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Txt variant="h3">{card.sr}</Txt>
                  <Mono style={{ fontSize: 13, marginTop: 2 }}>{card.pron}</Mono>
                  <Txt variant="small" muted style={{ marginTop: 2 }}>{card.ru}</Txt>
                </View>
              </View>
              <View style={{ marginTop: Spacing.md }}>
                <Button label="Вернуть в учёбу" icon="arrow-undo" onPress={() => unsuspend(card.id)} />
              </View>
            </Surface>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}
