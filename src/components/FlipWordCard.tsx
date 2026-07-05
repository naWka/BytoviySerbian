// Карточка занятия с 3D-переворотом (BS-17/BS-18): лицо — вопрос, оборот — ответ.
// Три стороны:
//   recognize (узнавание): вопрос = серб. слово → ответ = перевод;
//   produce   (говорение):  вопрос = русский (или фраза с пропуском, BS-26) → ответ = серб.;
//   listen    (аудирование, BS-25): вопрос = звук (текст скрыт) → ответ = серб. + перевод.
// Управляется извне через `revealed`; тап по лицу — просьба показать ответ (onFlip).
// BS-25: на обороте есть кнопка «слушать», и ответ проговаривается автоматически при показе.
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Cloze } from '@/lib/exercise';
import { speak } from '@/lib/speech';
import type { Card, CardSide } from '@/lib/types';

import { Mono, SaveButton, SpeakButton, Txt } from './ui';

export function FlipWordCard({
  card,
  revealed,
  onFlip,
  side = 'recognize',
  cloze,
  hideHint,
}: {
  card: Card;
  revealed: boolean;
  onFlip: () => void;
  side?: CardSide;
  cloze?: Cloze | null;
  hideHint?: boolean; // BS-27: на говорении с выбором вариантов тап по карточке не переворачивает
}) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const flip = useSharedValue(revealed ? 1 : 0);
  const produce = side === 'produce';
  const listen = side === 'listen';

  useEffect(() => {
    flip.value = withTiming(revealed ? 1 : 0, { duration: reduced ? 0 : 360 });
  }, [revealed, reduced, flip]);

  // BS-25: озвучиваем сербское слово, когда показан ответ (на любой стороне он содержит серб.).
  useEffect(() => {
    if (revealed) speak(card.sr, { latin: card.srLatin });
  }, [revealed, card.sr, card.srLatin]);

  // BS-25: на стороне «на слух» проигрываем слово сразу при появлении карточки.
  useEffect(() => {
    if (listen && !revealed) speak(card.sr, { latin: card.srLatin });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  const front = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
    opacity: flip.value < 0.5 ? 1 : 0,
  }));
  const back = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
    opacity: flip.value < 0.5 ? 0 : 1,
  }));

  const face: any = [styles.face, { backgroundColor: c.surface, borderColor: c.border, shadowColor: '#000' }];

  const PronChip = () => (
    <View style={[styles.pron, { backgroundColor: c.surfaceAlt }]}>
      <Ionicons name="volume-medium-outline" size={16} color={c.primary} />
      <Mono color={c.text}>{card.pron}</Mono>
    </View>
  );

  const Tag = ({ icon, label, color, bg }: { icon: any; label: string; color: string; bg: string }) => (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={13} color={color} />
      <Txt variant="small" style={{ color, fontWeight: '700' }}>{label}</Txt>
    </View>
  );

  return (
    <View style={styles.wrap}>
      {/* Лицо: вопрос */}
      <Animated.View style={[face, front]} pointerEvents={revealed ? 'none' : 'auto'}>
        <Pressable onPress={onFlip} style={styles.press}>
          <View style={styles.header}>
            {produce ? (
              <Tag icon="mic-outline" label={cloze ? 'Вставь слово' : 'Скажи по-сербски'} color={c.primary} bg={c.primarySoft} />
            ) : listen ? (
              <Tag icon="ear-outline" label="На слух" color={c.hear} bg={c.hearSoft} />
            ) : (
              <View />
            )}
            <SaveButton cardId={card.id} />
          </View>
          <View style={styles.center}>
            {listen ? (
              <>
                <Pressable
                  onPress={() => speak(card.sr, { latin: card.srLatin })}
                  hitSlop={12}
                  style={[styles.bigSpeaker, { backgroundColor: c.hearSoft }]}>
                  <Ionicons name="volume-high" size={44} color={c.hear} />
                </Pressable>
                <Txt variant="small" muted center>Тапни по значку — повторить</Txt>
              </>
            ) : produce ? (
              cloze ? (
                <Txt center style={styles.clozeSentence}>
                  {cloze.before}
                  <Txt style={[styles.clozeSentence, { color: c.primary }]}>_____</Txt>
                  {cloze.after}
                </Txt>
              ) : (
                <Txt center style={styles.ru}>{card.ru}</Txt>
              )
            ) : (
              <>
                <Txt center style={styles.sr}>{card.sr}</Txt>
                <PronChip />
              </>
            )}
            {produce && cloze ? (
              <Txt variant="small" muted center style={{ marginTop: Spacing.sm }}>{cloze.ru}</Txt>
            ) : null}
          </View>
          {hideHint ? (
            <View style={styles.hint} />
          ) : (
            <View style={styles.hint}>
              <Ionicons name="sync-outline" size={16} color={c.textMuted} />
              <Txt variant="small" muted>{produce || listen ? 'Тапни — покажу ответ' : 'Тапни — покажу перевод'}</Txt>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Оборот: ответ */}
      <Animated.View style={[face, styles.absolute, back]} pointerEvents={revealed ? 'auto' : 'none'}>
        <View style={styles.header}>
          <SpeakButton text={card.sr} latin={card.srLatin} />
          <SaveButton cardId={card.id} />
        </View>
        <View style={styles.center}>
          {produce || listen ? (
            <>
              <Txt variant="small" muted center>{card.ru}</Txt>
              <Txt center style={styles.sr}>{card.sr}</Txt>
              <PronChip />
            </>
          ) : (
            <>
              <Txt variant="small" muted center>{card.sr}</Txt>
              <Txt center style={styles.ru}>{card.ru}</Txt>
            </>
          )}
          {/* Примеры: у глаголов — весь массив с «когда» (как в словаре, BS-24); у слов — один */}
          {card.examples && card.examples.length > 0 ? (
            card.examples.map((ex, i) => (
              <View key={i} style={[styles.sub, { backgroundColor: c.surfaceAlt }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <Txt center style={{ fontStyle: 'italic', flexShrink: 1 }}>{ex.sr}</Txt>
                  <SpeakButton text={ex.sr} size={16} soft={false} />
                </View>
                <Txt variant="small" muted center style={{ marginTop: 4 }}>{ex.ru}</Txt>
                {ex.when ? (
                  <Txt variant="small" center color={c.primary} style={{ marginTop: 6 }}>💬 когда: {ex.when}</Txt>
                ) : null}
              </View>
            ))
          ) : card.exampleSr ? (
            <View style={[styles.sub, { backgroundColor: c.surfaceAlt }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Txt center style={{ fontStyle: 'italic', flexShrink: 1 }}>{card.exampleSr}</Txt>
                <SpeakButton text={card.exampleSr} size={16} soft={false} />
              </View>
              {card.exampleRu ? <Txt variant="small" muted center style={{ marginTop: 4 }}>{card.exampleRu}</Txt> : null}
            </View>
          ) : null}
          {card.note ? (
            <View style={[styles.sub, { backgroundColor: c.sosSoft }]}>
              <Txt variant="small" style={{ color: c.warning, fontWeight: '700' }}>⚠️ Ложный друг</Txt>
              <Txt variant="small" center style={{ marginTop: 2 }}>{card.note}</Txt>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 340 },
  face: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    backfaceVisibility: 'hidden',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  absolute: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  press: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  sr: { fontSize: 40, fontWeight: '800', lineHeight: 46, letterSpacing: -0.5 },
  ru: { fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  clozeSentence: { fontSize: 24, fontWeight: '800', lineHeight: 34, letterSpacing: -0.3 },
  bigSpeaker: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  sub: { borderRadius: Radius.md, padding: Spacing.md, alignSelf: 'stretch', alignItems: 'center' },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});
