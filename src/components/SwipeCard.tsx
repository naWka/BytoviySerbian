// Свайп-карточка отбора слов (BS-17). Тянется жестом; решение по направлению:
// вправо — «знаю», влево — «учить», вниз — «позже». Кнопки дергают fling() через ref.
import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Card } from '@/lib/types';

import { Mono, Txt } from './ui';

export type Decision = 'know' | 'learn' | 'later';

export interface SwipeCardHandle {
  fling: (d: Decision) => void;
}

const SWIPE_OUT = 550;
const H_THRESH = 110;
const V_THRESH = 130;

function tap() {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export const SwipeCard = forwardRef<SwipeCardHandle, { card: Card; onDecide: (d: Decision) => void }>(
  function SwipeCard({ card, onDecide }, ref) {
    const c = useTheme();
    const { width } = useWindowDimensions();
    const reduced = useReducedMotion();
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);

    // Всегда вызывается на JS-потоке (из onEnd через runOnJS или из кнопки через ref).
    const leave = (d: Decision) => {
      tap();
      const dur = reduced ? 0 : 260;
      if (d === 'know') tx.value = withTiming(width + SWIPE_OUT, { duration: dur });
      else if (d === 'learn') tx.value = withTiming(-width - SWIPE_OUT, { duration: dur });
      else ty.value = withTiming(SWIPE_OUT, { duration: dur });
      setTimeout(() => onDecide(d), Math.max(0, dur - 40));
    };

    useImperativeHandle(ref, () => ({ fling: leave }));

    const pan = Gesture.Pan()
      .onUpdate((e) => {
        tx.value = e.translationX;
        ty.value = Math.max(0, e.translationY);
      })
      .onEnd((e) => {
        if (e.translationX > H_THRESH) runOnJS(leave)('know');
        else if (e.translationX < -H_THRESH) runOnJS(leave)('learn');
        else if (e.translationY > V_THRESH) runOnJS(leave)('later');
        else {
          tx.value = withSpring(0, { damping: 18, stiffness: 220 });
          ty.value = withSpring(0, { damping: 18, stiffness: 220 });
        }
      });

    const cardStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { rotate: `${interpolate(tx.value, [-width, width], [-11, 11], Extrapolation.CLAMP)}deg` },
      ],
    }));

    const stamp = (from: number, to: number, axis: 'x' | 'y') =>
      useAnimatedStyle(() => ({
        opacity: interpolate((axis === 'x' ? tx : ty).value, [from, to], [0, 1], Extrapolation.CLAMP),
      }));

    const knowStamp = stamp(40, 130, 'x');
    const learnStamp = stamp(-40, -130, 'x');
    const laterStamp = stamp(50, 140, 'y');

    return (
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border, shadowColor: '#000' }, cardStyle]}>
          <Animated.View style={[styles.stamp, styles.stampTL, { borderColor: c.say }, knowStamp]}>
            <Txt variant="label" color={c.say} style={styles.stampTxt}>ЗНАЮ</Txt>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.stampTR, { borderColor: c.primary }, learnStamp]}>
            <Txt variant="label" color={c.primary} style={styles.stampTxt}>УЧИТЬ</Txt>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.stampB, { borderColor: c.snooze }, laterStamp]}>
            <Txt variant="label" color={c.snooze} style={styles.stampTxt}>ПОЗЖЕ</Txt>
          </Animated.View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md }}>
            <Txt center style={styles.sr}>{card.sr}</Txt>
            <Txt variant="small" muted center>{card.srLatin}</Txt>
            <View style={[styles.pron, { backgroundColor: c.surfaceAlt }]}>
              <Ionicons name="volume-medium-outline" size={16} color={c.primary} />
              <Mono color={c.text}>{card.pron}</Mono>
            </View>
            <Txt variant="h2" center style={{ marginTop: Spacing.sm }}>{card.ru}</Txt>
            {card.note ? (
              <View style={[styles.note, { backgroundColor: c.sosSoft }]}>
                <Txt variant="small" style={{ color: c.warning, fontWeight: '700' }}>⚠️ Ложный друг</Txt>
                <Txt variant="small" center style={{ marginTop: 2 }}>{card.note}</Txt>
              </View>
            ) : null}
          </View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    overflow: 'hidden',
  },
  sr: { fontSize: 40, fontWeight: '800', lineHeight: 46, letterSpacing: -0.5 },
  pron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  note: { borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  stamp: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  stampTL: { top: Spacing.lg, left: Spacing.lg, transform: [{ rotate: '-14deg' }] },
  stampTR: { top: Spacing.lg, right: Spacing.lg, transform: [{ rotate: '14deg' }] },
  stampB: { bottom: Spacing.lg, alignSelf: 'center', transform: [{ rotate: '-6deg' }] },
  stampTxt: { fontSize: 18, letterSpacing: 1 },
});
