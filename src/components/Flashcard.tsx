// Флэшкарта слова: одно слово на экран. Сербский — крупно, произношение — моноширинным.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { elevation, Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Card } from '@/lib/types';

import { Mono, Pill, SaveButton, Txt } from './ui';

export function Flashcard({
  card,
  revealed = true,
  onPress,
}: {
  card: Card;
  revealed?: boolean;
  onPress?: () => void;
}) {
  const c = useTheme();
  const m = { label: '📇 Слово', color: c.primary, soft: c.primarySoft };

  const body = (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, elevation(c.shadow, 1)]}>
      <View style={[styles.headerRow, { backgroundColor: m.soft }]}>
        <Pill text={m.label} color={m.color} bg={c.surface} />
        <SaveButton cardId={card.id} />
      </View>

      <View style={styles.bodyPad}>
        <Txt color={c.text} style={styles.sr}>{card.sr}</Txt>
        <Txt variant="small" muted style={{ marginTop: 2 }}>
          {card.srLatin}
        </Txt>

        <View style={[styles.pronRow, { backgroundColor: c.surfaceAlt }]}>
          <Ionicons name="volume-medium" size={16} color={m.color} />
          <Mono color={c.text} style={{ flex: 1 }}>
            {card.pron}
          </Mono>
        </View>

        {revealed ? (
          <View style={{ marginTop: Spacing.md, gap: Spacing.md }}>
            <Txt variant="h3" style={{ fontFamily: Font.semibold }}>
              {card.ru}
            </Txt>

            {/* Примеры: у глаголов — весь массив с «когда» (как в словаре, BS-24); у слов — один */}
            {card.examples && card.examples.length > 0 ? (
              card.examples.map((ex, i) => (
                <View key={i} style={[styles.sub, { backgroundColor: c.surfaceAlt }]}>
                  <Txt style={{ fontStyle: 'italic' }}>{ex.sr}</Txt>
                  <Txt variant="small" muted style={{ marginTop: 4 }}>{ex.ru}</Txt>
                  {ex.when ? (
                    <Txt variant="small" color={c.primary} style={{ marginTop: 6 }}>💬 когда: {ex.when}</Txt>
                  ) : null}
                </View>
              ))
            ) : card.exampleSr ? (
              <View style={[styles.sub, { backgroundColor: c.surfaceAlt }]}>
                <Txt style={{ fontStyle: 'italic' }}>{card.exampleSr}</Txt>
                {card.exampleRu ? (
                  <Txt variant="small" muted style={{ marginTop: 4 }}>
                    {card.exampleRu}
                  </Txt>
                ) : null}
              </View>
            ) : null}

            {card.note ? (
              <View style={[styles.note, { backgroundColor: c.sosSoft }]}>
                <Txt variant="label" style={{ color: c.warning }}>
                  ⚠️ Ложный друг
                </Txt>
                <Txt variant="small" style={{ color: c.text, marginTop: 2 }}>
                  {card.note}
                </Txt>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.hint}>
            <Ionicons name="eye-outline" size={18} color={c.textMuted} />
            <Txt variant="small" muted>
              Нажми, чтобы увидеть перевод
            </Txt>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.9 }}>
        {body}
      </Pressable>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  bodyPad: { padding: Spacing.xl, paddingTop: Spacing.lg },
  sr: { fontFamily: Font.black, fontSize: 32, lineHeight: 40, letterSpacing: -0.6 },
  pronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
  },
  sub: {
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  note: {
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
