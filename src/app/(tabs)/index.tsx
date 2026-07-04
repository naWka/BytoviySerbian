import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { ListRow } from '@/components/lists';
import { Screen, Surface, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';
import { summarize } from '@/lib/srs';
import { useStore } from '@/lib/store';

export default function ScenariosScreen() {
  const c = useTheme();
  const progress = useStore((s) => s.progress);
  const now = Date.now();

  return (
    <Screen scroll>
      <Txt variant="title">Ситуации</Txt>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        Подготовься к разговору: что услышишь и чем ответить.
      </Txt>

      <Surface
        accent={c.sos}
        onPress={() => router.push('/sos')}
        style={{ marginTop: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <Ionicons name="alert-circle" size={26} color={c.sos} />
        <View style={{ flex: 1 }}>
          <Txt variant="h3">🆘 SOS-фразы</Txt>
          <Txt variant="small" muted>
            Замедлить, переспросить, попросить написать
          </Txt>
        </View>
        <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
      </Surface>

      <Txt variant="label" muted style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>
        {content.totals.scenarios} ситуаций
      </Txt>

      <View style={{ gap: Spacing.sm }}>
        {content.scenarios.map((s) => {
          const cards = [...s.hear, ...s.say];
          const sum = summarize(cards, progress, now);
          const learned = (sum.review + sum.mastered) / Math.max(1, sum.total);
          return (
            <ListRow
              key={s.id}
              title={s.titleRu}
              subtitle={`${s.hear.length} услышать · ${s.say.length} ответить`}
              accent={c.hear}
              progress={learned}
              dueBadge={sum.due}
              onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: s.id } })}
            />
          );
        })}
      </View>
    </Screen>
  );
}
