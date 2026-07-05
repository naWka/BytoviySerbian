// BS-30: упражнение «соединить пары» — быстрый повтор пула.
// Две колонки: сербский слева, перевод справа (перемешаны). Тапаешь по одному
// из каждой — если пара, подсвечиваем зелёным. Ошибся — красная вспышка,
// слово помечается «отвечено с ошибкой» (для автооценки).
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { speak } from '@/lib/speech';
import type { Card } from '@/lib/types';

import { Txt } from './ui';

type Item = { cardId: string; kind: 'sr' | 'ru'; text: string };

function seedSort(items: Item[], salt: string): Item[] {
  const h = (s: string) => {
    let x = 2166136261;
    for (let i = 0; i < s.length; i++) {
      x ^= s.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return x >>> 0;
  };
  return [...items].sort((a, b) => h(a.cardId + a.kind + salt) - h(b.cardId + b.kind + salt));
}

export function MatchPairs({ cards, onDone }: { cards: Card[]; onDone: (results: { id: string; correct: boolean }[]) => void }) {
  const c = useTheme();
  const left = useMemo(() => seedSort(cards.map((x) => ({ cardId: x.id, kind: 'sr' as const, text: x.sr })), 'L'), [cards]);
  const right = useMemo(() => seedSort(cards.map((x) => ({ cardId: x.id, kind: 'ru' as const, text: x.ru })), 'R'), [cards]);

  const [sel, setSel] = useState<Item | null>(null);
  const [matched, setMatched] = useState<Record<string, true>>({});
  const [wrongPair, setWrongPair] = useState<string[]>([]); // ключи двух ошибочно выбранных
  const [erred, setErred] = useState<Record<string, true>>({}); // cardId, где была ошибка

  const key = (it: Item) => `${it.cardId}:${it.kind}`;

  const finish = (m: Record<string, true>) => {
    const results = cards.map((x) => ({ id: x.id, correct: !erred[x.id] }));
    // matched содержит все — небольшая задержка для показа зелёного не делаем (без таймеров).
    void m;
    onDone(results);
  };

  const tap = (it: Item) => {
    if (matched[it.cardId]) return;
    if (it.kind === 'sr') speak(it.text);
    if (!sel) {
      setSel(it);
      return;
    }
    if (sel.kind === it.kind) {
      setSel(it); // повторный выбор той же колонки — переставить
      return;
    }
    // пара из разных колонок
    if (sel.cardId === it.cardId) {
      const nextMatched = { ...matched, [it.cardId]: true as const };
      setMatched(nextMatched);
      setSel(null);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (Object.keys(nextMatched).length === cards.length) finish(nextMatched);
    } else {
      setErred((e) => ({ ...e, [sel.cardId]: true, [it.cardId]: true }));
      setWrongPair([key(sel), key(it)]);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setSel(null);
      // сбросить красноту при следующем тапе (без таймеров — просто перерисуем)
    }
  };

  const cell = (it: Item) => {
    const k = key(it);
    const isMatched = !!matched[it.cardId];
    const isSel = sel && key(sel) === k;
    const isWrong = wrongPair.includes(k);
    let bg: string = c.surface;
    let border: string = c.border;
    let fg: string = c.text;
    if (isMatched) {
      bg = c.saySoft;
      border = c.say;
      fg = c.say;
    } else if (isWrong) {
      bg = c.sosSoft;
      border = c.sos;
      fg = c.sos;
    } else if (isSel) {
      bg = c.primarySoft;
      border = c.primary;
      fg = c.primary;
    }
    return (
      <Pressable
        key={k}
        disabled={isMatched}
        onPress={() => {
          if (wrongPair.length) setWrongPair([]);
          tap(it);
        }}
        style={({ pressed }) => [
          styles.cell,
          { backgroundColor: bg, borderColor: border },
          pressed && !isMatched && { opacity: 0.8 },
        ]}>
        <Txt center style={{ fontFamily: Font.bold, fontSize: 16, color: fg }} numberOfLines={2}>
          {it.text}
        </Txt>
        {isMatched ? <Ionicons name="checkmark" size={16} color={c.say} style={{ marginTop: 2 }} /> : null}
      </Pressable>
    );
  };

  return (
    <View>
      <Txt variant="small" muted center style={{ marginBottom: Spacing.sm }}>
        Соедини сербское слово и перевод
      </Txt>
      <View style={styles.cols}>
        <View style={styles.col}>{left.map(cell)}</View>
        <View style={styles.col}>{right.map(cell)}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cols: { flexDirection: 'row', gap: Spacing.sm },
  col: { flex: 1, gap: Spacing.sm },
  cell: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
