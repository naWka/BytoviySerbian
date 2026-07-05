// BS-29: «Мой словарь» — что я взял учить. Уровень владения, озвучка, можно убрать.
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState, LevelBar, Mono, Screen, SpeakButton, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dictionaryCards } from '@/lib/learn';
import { levelOf } from '@/lib/srs';
import { useStore } from '@/lib/store';

export default function DictionaryScreen() {
  const c = useTheme();
  const dictionary = useStore((s) => s.dictionary);
  const progress = useStore((s) => s.progress);
  const remove = useStore((s) => s.removeFromDictionary);

  const cards = dictionaryCards(dictionary);

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Мой словарь' }} />
      <Txt variant="title">Мой словарь</Txt>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        Слова, которые ты взял учить в «Смотрю». Лишнее можно убрать.
      </Txt>

      {cards.length === 0 ? (
        <View style={{ marginTop: Spacing.xxl }}>
          <EmptyState icon="library-outline" title="Словарь пуст" subtitle="Открой «Смотрю» и набери слова тапом по карточке." />
        </View>
      ) : (
        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          {cards.map((card) => {
            const level = levelOf(progress[card.id]);
            return (
              <View key={card.id} style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <Txt variant="h3">{card.sr}</Txt>
                    <SpeakButton text={card.sr} latin={card.srLatin} size={15} soft={false} />
                  </View>
                  <Mono style={{ fontSize: 13, marginTop: 2 }}>{card.pron}</Mono>
                  <Txt variant="small" muted style={{ marginTop: 2 }}>{card.ru}</Txt>
                  <View style={{ marginTop: 6 }}>
                    <LevelBar idx={level.idx} label={level.label} />
                  </View>
                </View>
                <Pressable onPress={() => remove(card.id)} hitSlop={8} style={styles.remove}>
                  <Ionicons name="trash-outline" size={20} color={c.textMuted} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  remove: { padding: 4 },
});
