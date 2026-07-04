// Карточка занятия с 3D-переворотом (BS-17/BS-18): лицо — вопрос, оборот — ответ.
// Две стороны (BS-18):
//   recognize (узнавание): вопрос = серб. слово → ответ = перевод;
//   produce   (говорение):  вопрос = русский → ответ = серб. слово + произношение.
// Управляется извне через `revealed`; тап по лицу — просьба показать ответ (onFlip).
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
import type { Card, CardSide } from '@/lib/types';

import { Mono, SaveButton, Txt } from './ui';

export function FlipWordCard({
  card,
  revealed,
  onFlip,
  side = 'recognize',
}: {
  card: Card;
  revealed: boolean;
  onFlip: () => void;
  side?: CardSide;
}) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const flip = useSharedValue(revealed ? 1 : 0);
  const produce = side === 'produce';

  useEffect(() => {
    flip.value = withTiming(revealed ? 1 : 0, { duration: reduced ? 0 : 360 });
  }, [revealed, reduced, flip]);

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

  return (
    <View style={styles.wrap}>
      {/* Лицо: вопрос */}
      <Animated.View style={[face, front]} pointerEvents={revealed ? 'none' : 'auto'}>
        <Pressable onPress={onFlip} style={styles.press}>
          <View style={styles.header}>
            {produce ? (
              <View style={[styles.tag, { backgroundColor: c.primarySoft }]}>
                <Ionicons name="mic-outline" size={13} color={c.primary} />
                <Txt variant="small" style={{ color: c.primary, fontWeight: '700' }}>Скажи по-сербски</Txt>
              </View>
            ) : (
              <View />
            )}
            <SaveButton cardId={card.id} />
          </View>
          <View style={styles.center}>
            {produce ? (
              <Txt center style={styles.ru}>{card.ru}</Txt>
            ) : (
              <>
                <Txt center style={styles.sr}>{card.sr}</Txt>
                <PronChip />
              </>
            )}
          </View>
          <View style={styles.hint}>
            <Ionicons name="sync-outline" size={16} color={c.textMuted} />
            <Txt variant="small" muted>{produce ? 'Тапни — покажу ответ' : 'Тапни — покажу перевод'}</Txt>
          </View>
        </Pressable>
      </Animated.View>

      {/* Оборот: ответ */}
      <Animated.View style={[face, styles.absolute, back]} pointerEvents={revealed ? 'auto' : 'none'}>
        <View style={styles.header}>
          <View />
          <SaveButton cardId={card.id} />
        </View>
        <View style={styles.center}>
          {produce ? (
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
          {card.exampleSr ? (
            <View style={[styles.sub, { backgroundColor: c.surfaceAlt }]}>
              <Txt center style={{ fontStyle: 'italic' }}>{card.exampleSr}</Txt>
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
