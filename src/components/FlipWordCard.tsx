// Карточка сессии с 3D-переворотом (BS-17): лицо — сербское слово, оборот — перевод.
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
import type { Card } from '@/lib/types';

import { Mono, SaveButton, Txt } from './ui';

export function FlipWordCard({ card, revealed, onFlip }: { card: Card; revealed: boolean; onFlip: () => void }) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const flip = useSharedValue(revealed ? 1 : 0);

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

  return (
    <View style={styles.wrap}>
      <Animated.View style={[face, front]} pointerEvents={revealed ? 'none' : 'auto'}>
        <Pressable onPress={onFlip} style={styles.press}>
          <View style={styles.header}>
            <SaveButton cardId={card.id} />
          </View>
          <View style={styles.center}>
            <Txt center style={styles.sr}>{card.sr}</Txt>
            <View style={[styles.pron, { backgroundColor: c.surfaceAlt }]}>
              <Ionicons name="volume-medium-outline" size={16} color={c.primary} />
              <Mono color={c.text}>{card.pron}</Mono>
            </View>
          </View>
          <View style={styles.hint}>
            <Ionicons name="sync-outline" size={16} color={c.textMuted} />
            <Txt variant="small" muted>Тапни — покажу перевод</Txt>
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View style={[face, styles.absolute, back]} pointerEvents={revealed ? 'auto' : 'none'}>
        <View style={styles.header}>
          <SaveButton cardId={card.id} />
        </View>
        <View style={styles.center}>
          <Txt variant="small" muted center>{card.sr}</Txt>
          <Txt center style={styles.ru}>{card.ru}</Txt>
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
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  press: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  sr: { fontSize: 42, fontWeight: '800', lineHeight: 48, letterSpacing: -0.5 },
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
