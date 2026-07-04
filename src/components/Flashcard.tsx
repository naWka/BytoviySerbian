// Флэшкарта: одна реплика/слово на экран. Сербский — крупно, произношение — моноширинным.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Card, CardKind } from '@/lib/types';

import { Mono, Pill, SaveButton, Txt } from './ui';

function meta(kind: CardKind, c: ReturnType<typeof useTheme>) {
  switch (kind) {
    case 'hear':
      return { label: '👂 Что услышишь', color: c.hear, soft: c.hearSoft };
    case 'say':
      return { label: '🗣 Чем ответить', color: c.say, soft: c.saySoft };
    case 'sos':
      return { label: '🆘 Спасательная фраза', color: c.sos, soft: c.sosSoft };
    default:
      return { label: '📇 Слово', color: c.primary, soft: c.primarySoft };
  }
}

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
  const m = meta(card.kind, c);

  const body = (
    <View
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.headerRow}>
        <Pill text={m.label} color={m.color} bg={m.soft} />
        <SaveButton cardId={card.id} />
      </View>

      <Txt style={styles.sr}>{card.sr}</Txt>
      <Txt variant="small" muted style={{ marginTop: 2 }}>
        {card.srLatin}
      </Txt>

      <View style={[styles.pronRow, { backgroundColor: c.surfaceAlt }]}>
        <Ionicons name="volume-medium-outline" size={16} color={m.color} />
        <Mono color={c.text} style={{ flex: 1 }}>
          {card.pron}
        </Mono>
      </View>

      {revealed ? (
        <View style={{ marginTop: Spacing.md, gap: Spacing.md }}>
          <Txt variant="h3" style={{ fontWeight: '600' }}>
            {card.ru}
          </Txt>

          {card.kind === 'hear' && card.reactSr ? (
            <View style={[styles.sub, { backgroundColor: m.soft }]}>
              <Txt variant="label" color={m.color}>
                ↩︎ Ответь так
              </Txt>
              <Txt style={{ fontSize: 19, fontWeight: '700', marginTop: 4 }}>{card.reactSr}</Txt>
              <Mono color={c.textSecondary} style={{ marginTop: 2 }}>
                {card.reactPron}
              </Mono>
              <Txt variant="small" muted style={{ marginTop: 4 }}>
                {card.reactRu}
              </Txt>
            </View>
          ) : null}

          {card.kind === 'word' && card.exampleSr ? (
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
              <Txt variant="small" style={{ color: c.warning, fontWeight: '700' }}>
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
    padding: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sr: { fontSize: 30, fontWeight: '800', lineHeight: 38, letterSpacing: -0.5 },
  pronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
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
