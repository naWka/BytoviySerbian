// BS-29 «Смотрю»: выбор темы, затем листание пула слов (тап = взять в словарь).
import { Stack, router } from 'expo-router';
import { View } from 'react-native';

import { ListRow } from '@/components/lists';
import { EmptyState, Screen, Txt } from '@/components/ui';
import { categoryColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { browseRemaining } from '@/lib/learn';
import { useStore } from '@/lib/store';

export default function BrowseThemesScreen() {
  const c = useTheme();
  const dictionary = useStore((s) => s.dictionary);
  const progress = useStore((s) => s.progress);
  const palette = categoryColors(c);

  const decks = content.decks
    .map((d) => ({ d, left: browseRemaining(d.id, dictionary, progress) }));

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Смотрю' }} />
      <Txt variant="title">Смотрю</Txt>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        Листай слова темы. Тап по слову — беру в свой словарь. Знаю/пропускаю — идём дальше.
      </Txt>

      {decks.every((x) => x.left === 0) ? (
        <View style={{ marginTop: Spacing.xxl }}>
          <EmptyState icon="checkmark-done-circle-outline" title="Всё пересмотрено" subtitle="Слова из всех тем уже в словаре или отмечены «знаю»." />
        </View>
      ) : (
        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          {decks.map(({ d, left }, i) => (
            <ListRow
              key={d.id}
              title={d.titleRu}
              subtitle={left > 0 ? `${left} новых слов` : 'всё пересмотрено'}
              accent={palette[i % palette.length]}
              icon="eye"
              dueBadge={left || undefined}
              onPress={() => router.push({ pathname: '/browse/[id]', params: { id: d.id } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
