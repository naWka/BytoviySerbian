import { router } from 'expo-router';
import { View } from 'react-native';

import { ListRow } from '@/components/lists';
import { EmptyState, Screen, Txt } from '@/components/ui';
import { categoryColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { summarize } from '@/lib/srs';
import { useStore } from '@/lib/store';

export default function VocabScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const now = Date.now();

  return (
    <Screen scroll>
      <Txt variant="title">Слова</Txt>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        Учи по темам: числа, еда, документы, здоровье и другое.
      </Txt>

      {/* BS-28: вход в мини-грамматику */}
      <View style={{ marginTop: Spacing.lg }}>
        <ListRow
          title="Грамматика"
          subtitle="Падежи, времена, вид — паттернами"
          accent={c.hear}
          icon="school"
          onPress={() => router.push('/grammar')}
        />
      </View>

      {content.decks.length === 0 ? (
        <View style={{ marginTop: Spacing.xxl }}>
          <EmptyState icon="hourglass-outline" title="Колоды готовятся" subtitle="Скоро здесь появятся слова." />
        </View>
      ) : (
        <>
          <Txt variant="label" muted style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>
            {content.totals.decks} тем
          </Txt>
          <View style={{ gap: Spacing.sm }}>
            {content.decks.map((d, i) => {
              const sum = summarize(d.cards, progress, now);
              const learned = (sum.review + sum.mastered) / Math.max(1, sum.total);
              const palette = categoryColors(c);
              return (
                <ListRow
                  key={d.id}
                  title={d.titleRu}
                  subtitle={`${d.cards.length} слов`}
                  accent={palette[i % palette.length]}
                  icon="book"
                  progress={learned}
                  dueBadge={sum.due}
                  onPress={() => router.push({ pathname: '/deck/[id]', params: { id: d.id } })}
                />
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
