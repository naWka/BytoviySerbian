// Отложенные слова («позже», BS-17): вернуть в разбор или сразу взять в учёбу.
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';

import { Button, EmptyState, Mono, Screen, Surface, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buriedWords } from '@/lib/learn';
import { useStore } from '@/lib/store';

export default function LaterScreen() {
  const c = useTheme();
  const buried = useStore((s) => s.buried);
  const unbury = useStore((s) => s.unbury);
  const startLearning = useStore((s) => s.startLearning);
  const cards = buriedWords(buried);

  if (cards.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Отложенные' }} />
        <View style={{ flex: 1 }}>
          <EmptyState icon="time-outline" title="Отложенных нет" subtitle="При разборе свайп вниз («Позже») кладёт слово сюда." />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Отложенные' }} />
      <Txt variant="title">Отложенные</Txt>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        {cards.length} {cards.length === 1 ? 'слово' : 'слов'} на потом. Верни в разбор или сразу возьми в учёбу.
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
              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
                <Button label="В разбор" icon="arrow-undo" variant="soft" onPress={() => unbury(card.id)} style={{ flex: 1 }} />
                <Button label="Учить" icon="school" onPress={() => startLearning(card.id)} style={{ flex: 1 }} />
              </View>
            </Surface>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}
