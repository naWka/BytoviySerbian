// BS-28: мини-грамматика — экран-справка с карточками-паттернами.
// Не курс: короткое правило + живые примеры (озвучка BS-25), листаешь как шпаргалку.
import { Stack } from 'expo-router';
import { View } from 'react-native';

import { Screen, SpeakButton, Surface, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { GRAMMAR_NOTE, grammarPatterns } from '@/lib/grammar';

export default function GrammarScreen() {
  const c = useTheme();

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Грамматика' }} />
      <Txt variant="title">Грамматика</Txt>
      <Txt variant="body" muted style={{ marginTop: Spacing.xs }}>
        Коротко и по делу: падежи, времена, вид глагола — паттернами, без учебника.
      </Txt>

      <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
        {grammarPatterns.map((p) => (
          <Surface key={p.id} elevated>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Txt style={{ fontSize: 22 }}>{p.icon}</Txt>
              <Txt variant="h2" style={{ flexShrink: 1 }}>{p.title}</Txt>
            </View>
            <Txt variant="body" style={{ marginTop: Spacing.sm }}>{p.rule}</Txt>

            <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
              {p.examples.map((ex, i) => (
                <View key={i} style={{ backgroundColor: c.surfaceAlt, borderRadius: 12, padding: Spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <Txt style={{ fontStyle: 'italic', flexShrink: 1 }}>{ex.sr}</Txt>
                    <SpeakButton text={ex.sr} size={16} soft={false} />
                  </View>
                  <Txt variant="small" muted style={{ marginTop: 2 }}>{ex.ru}</Txt>
                </View>
              ))}
            </View>

            {p.tip ? (
              <View style={{ backgroundColor: c.primarySoft, borderRadius: 12, padding: Spacing.md, marginTop: Spacing.sm }}>
                <Txt variant="small" style={{ color: c.primary, fontWeight: '700' }}>💡 {p.tip}</Txt>
              </View>
            ) : null}
          </Surface>
        ))}
      </View>

      <Txt variant="small" muted center style={{ marginTop: Spacing.xl }}>
        {GRAMMAR_NOTE}
      </Txt>
    </Screen>
  );
}
