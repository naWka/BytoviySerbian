// BS-30: упражнение «собери слово из букв». Вопрос — перевод (рус), собираешь серб.
// Тап по букве внизу — добавляет в ответ; тап по букве в ответе — возвращает вниз.
// «Стереть» убирает последнюю (поправить промах до конца сборки). Собрано на всю длину —
// автопроверка. Результат отдаём через onResult (один раз).
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { letterTiles } from '@/lib/exercise';
import type { Card } from '@/lib/types';

import { Button, Mono, SpeakButton, Txt } from './ui';

export function AssembleWord({ card, onResult }: { card: Card; onResult: (correct: boolean) => void }) {
  const c = useTheme();
  const target = card.sr.trim();
  const tiles = useMemo(() => letterTiles(target), [target]);
  const [used, setUsed] = useState<number[]>([]); // индексы плиток в порядке набора
  const [checked, setChecked] = useState<null | boolean>(null);

  const targetLen = Array.from(target).length;

  const check = (next: number[]) => {
    if (next.length !== targetLen) return;
    const answer = next.map((idx) => tiles[idx]).join('');
    const correct = answer === target;
    setChecked(correct);
    if (Platform.OS !== 'web') {
      if (correct) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
    onResult(correct);
  };

  const addTile = (idx: number) => {
    if (checked !== null || used.includes(idx)) return;
    const next = [...used, idx];
    setUsed(next);
    check(next); // последняя буква — автопроверка
  };
  const removeAt = (pos: number) => {
    if (checked !== null) return;
    setUsed(used.filter((_, i) => i !== pos));
  };
  const removeLast = () => {
    if (checked !== null || used.length === 0) return;
    setUsed(used.slice(0, -1));
  };

  const answerBorder = checked === null ? c.border : checked ? c.say : c.sos;
  const answerBg = checked === null ? c.surfaceAlt : checked ? c.saySoft : c.sosSoft;

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Txt variant="small" muted>Собери по-сербски:</Txt>
        <Txt variant="h2" center>{card.ru}</Txt>
      </View>

      {/* Ответ */}
      <View style={[styles.answer, { backgroundColor: answerBg, borderColor: answerBorder }]}>
        {used.length === 0 ? (
          <Txt variant="body" muted>Тапай буквы ниже…</Txt>
        ) : (
          <View style={styles.tilesRow}>
            {used.map((idx, pos) => (
              <Pressable key={`${idx}-${pos}`} onPress={() => removeAt(pos)} style={[styles.tile, { backgroundColor: c.surface, borderColor: answerBorder }]}>
                <Txt style={{ fontFamily: Font.bold, fontSize: 20 }}>{tiles[idx]}</Txt>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Стереть последнюю букву — на случай промаха до того, как собрал слово целиком. */}
      {checked === null && used.length > 0 ? (
        <Button label="Стереть" icon="backspace-outline" variant="soft" onPress={removeLast} />
      ) : null}

      {checked === false ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }}>
          <Ionicons name="close-circle" size={18} color={c.sos} />
          <Txt variant="small" style={{ color: c.sos, fontWeight: '700' }}>Верно: {target}</Txt>
        </View>
      ) : null}

      {/* Транскрипция кириллицей с ударением (как в словаре) — вместо робота-озвучки. */}
      {checked !== null ? (
        <View style={[styles.pron, { backgroundColor: c.surfaceAlt }]}>
          <SpeakButton text={target} latin={card.srLatin} size={16} soft={false} />
          <Mono color={c.text}>{card.pron}</Mono>
        </View>
      ) : null}

      {/* Банк букв */}
      <View style={styles.tilesRow}>
        {tiles.map((ch, idx) => {
          const isUsed = used.includes(idx);
          return (
            <Pressable
              key={idx}
              disabled={isUsed || checked !== null}
              onPress={() => addTile(idx)}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: isUsed ? c.surfaceAlt : c.surface, borderColor: c.border, opacity: isUsed ? 0.35 : 1 },
                pressed && { opacity: 0.7 },
              ]}>
              <Txt style={{ fontFamily: Font.bold, fontSize: 20 }}>{ch}</Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  answer: {
    minHeight: 64,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  pron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  tile: {
    minWidth: 42,
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
