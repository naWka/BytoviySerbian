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

import { Mono, SaveButton, SpeakButton, Txt } from './ui';

// Подписи форм спряжения (BS-16). Порядок совпадает с массивами present/past в JSON.
const PRESENT_LABELS = ['ја', 'ти', 'он/она', 'ми', 'ви', 'они'];
const PAST_LABELS = ['он', 'она', 'они (м)', 'они (ж)'];

// Мини-таблица спряжения: слева подпись (лицо/род), справа форма «кириллица · latin».
function ConjTable({
  title,
  labels,
  forms,
  bg,
  labelColor,
}: {
  title: string;
  labels: string[];
  forms: string[];
  bg: string;
  labelColor: string;
}) {
  return (
    <View style={[styles.table, { backgroundColor: bg }]}>
      <Txt variant="small" muted style={{ marginBottom: Spacing.sm }}>
        {title}
      </Txt>
      {forms.map((form, i) => (
        <View key={i} style={styles.trow}>
          <Txt variant="small" style={{ width: 68, color: labelColor }}>
            {labels[i]}
          </Txt>
          <Txt style={{ flex: 1, fontWeight: '600' }}>{form}</Txt>
        </View>
      ))}
    </View>
  );
}

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Txt variant="h3">{card.sr}</Txt>
            <SpeakButton text={card.sr} latin={card.srLatin} size={16} soft={false} />
          </View>
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

          {card.present && card.present.length > 0 ? (
            <ConjTable
              title="Настоящее время"
              labels={PRESENT_LABELS}
              forms={card.present}
              bg={c.surfaceAlt}
              labelColor={c.textMuted}
            />
          ) : null}

          {card.past && card.past.length > 0 ? (
            <ConjTable
              title="Прошедшее время (я делал / я делала)"
              labels={PAST_LABELS}
              forms={card.past}
              bg={c.surfaceAlt}
              labelColor={c.textMuted}
            />
          ) : null}

          {/* Примеры глагола с «когда так говорят» (BS-16) */}
          {card.examples && card.examples.length > 0
            ? card.examples.map((ex, i) => (
                <View key={i} style={[styles.example, { backgroundColor: c.surfaceAlt }]}>
                  <Txt style={{ fontStyle: 'italic' }}>{ex.sr}</Txt>
                  <Txt variant="small" muted style={{ marginTop: 4 }}>
                    {ex.ru}
                  </Txt>
                  {ex.when ? (
                    <Txt variant="small" color={c.primary} style={{ marginTop: 6 }}>
                      💬 когда: {ex.when}
                    </Txt>
                  ) : null}
                </View>
              ))
            : card.exampleSr ? (
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
  table: { borderRadius: Radius.md, padding: Spacing.md },
  trow: { flexDirection: 'row', alignItems: 'baseline', paddingVertical: 3 },
});
