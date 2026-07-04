import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CardPager } from '@/components/Pager';
import { Button, EmptyState, Screen, SegmentedControl, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { content } from '@/lib/content';

export default function ScenarioScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = content.getScenario(id);
  const [section, setSection] = useState<'hear' | 'say'>('hear');

  if (!scenario) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Ситуация' }} />
        <EmptyState icon="alert-circle-outline" title="Ситуация не найдена" />
      </Screen>
    );
  }

  const cards = section === 'hear' ? scenario.hear : scenario.say;

  return (
    <Screen padded={false} edges={['bottom']}>
      <Stack.Screen options={{ title: scenario.titleRu }} />
      <View style={{ padding: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.md }}>
        <SegmentedControl
          segments={[
            { key: 'hear', label: '👂 Услышишь', color: c.hear },
            { key: 'say', label: '🗣 Ответишь', color: c.say },
          ]}
          value={section}
          onChange={(k) => setSection(k as 'hear' | 'say')}
        />
        <Button
          label="Учить этот сценарий"
          variant="soft"
          icon="flash"
          onPress={() => router.push({ pathname: '/review/[mode]', params: { mode: 'scenario', id: scenario.id } })}
        />
      </View>

      <CardPager key={section} cards={cards} />
    </Screen>
  );
}
