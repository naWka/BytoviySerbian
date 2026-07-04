// Праздничное конфетти на финише сессии (BS-17). Однократный «взрыв» вверх и вниз.
// Уважает reduced motion: при включённом — ничего не рисуем.
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

const COUNT = 28;

// Детерминированный псевдослучай (без Math.random в рендере — стабильные ключи).
function rand(seed: number): number {
  const x = Math.sin(seed * 99.13) * 43758.5453;
  return x - Math.floor(x);
}

function Piece({ index, palette, width }: { index: number; palette: string[]; width: number }) {
  const p = useSharedValue(0);
  const startX = rand(index) * width;
  const drift = (rand(index + 7) - 0.5) * 160;
  const fall = 380 + rand(index + 3) * 320;
  const rot = (rand(index + 5) - 0.5) * 900;
  const delay = rand(index + 11) * 220;
  const size = 8 + rand(index + 13) * 8;
  const color = palette[index % palette.length];

  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }));
  }, [p, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value * p.value,
    transform: [
      { translateY: -60 + p.value * fall },
      { translateX: p.value * drift },
      { rotate: `${p.value * rot}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: 0, left: startX, width: size, height: size * 1.4, borderRadius: 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function Confetti() {
  const c = useTheme();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  if (reduced) return null;

  const palette = [c.primary, c.say, c.star, c.hear, c.gradeEasy];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: COUNT }, (_, i) => (
        <Piece key={i} index={i} palette={palette} width={width} />
      ))}
    </View>
  );
}
