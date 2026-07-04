// Строка слова в списке темы: компактно, разворачивается по тапу.
// Справа — ★ сохранить и переключатель «знаю ✓» (BS-15).
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { statusOf } from '@/lib/srs';
import { useStore } from '@/lib/store';
import type { Card } from '@/lib/types';

import { Mono, SaveButton, Txt } from './ui';

export function WordRow({ card }: { card: Card }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  const p = useStore((s) => s.progress[card.id]);
  const markKnown = useStore((s) => s.markKnown);
  const unmarkKnown = useStore((s) => s.unmarkKnown);
  const known = statusOf(p) === 'mastered';

  return (
    <Pressable
      onPress={() => setOpen((o) => !o)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.surface, borderColor: c.border },
        pressed && { opacity: 0.8 },
      ]}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Txt variant="h3">{card.sr}</Txt>
          <Mono style={{ fontSize: 13, marginTop: 2 }}>{card.pron}</Mono>
          <Txt variant="small" muted style={{ marginTop: 2 }}>
            {card.ru}
          </Txt>
        </View>
        <View style={{ alignItems: 'flex-end', gap: Spacing.sm }}>
          <SaveButton cardId={card.id} size={22} />
          <Pressable
            onPress={() => (known ? unmarkKnown(card.id) : markKnown(card.id))}
            hitSlop={6}
            style={[styles.know, { backgroundColor: known ? c.saySoft : c.surfaceAlt }]}>
            <Ionicons
              name={known ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={16}
              color={known ? c.say : c.textMuted}
            />
            <Txt variant="small" color={known ? c.say : c.textSecondary} style={{ fontWeight: '700' }}>
              знаю
            </Txt>
          </Pressable>
        </View>
      </View>

      {open ? (
        <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
          <Txt variant="small" muted>
            {card.srLatin}
          </Txt>
          {card.exampleSr ? (
            <View style={[styles.example, { backgroundColor: c.surfaceAlt }]}>
              <Txt style={{ fontStyle: 'italic' }}>{card.exampleSr}</Txt>
              {card.exampleRu ? (
                <Txt variant="small" muted style={{ marginTop: 4 }}>
                  {card.exampleRu}
                </Txt>
              ) : null}
            </View>
          ) : null}
          {card.note ? (
            <View style={[styles.example, { backgroundColor: c.sosSoft }]}>
              <Txt variant="small" style={{ color: c.warning, fontWeight: '700' }}>
                ⚠️ Ложный друг
              </Txt>
              <Txt variant="small" style={{ marginTop: 2 }}>
                {card.note}
              </Txt>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  know: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  example: { borderRadius: Radius.md, padding: Spacing.md },
});
