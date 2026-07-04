// Листалка карточек: одна карточка на экран, ◀ ▶ и счётчик «2 / 12».
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Card } from '@/lib/types';

import { Flashcard } from './Flashcard';
import { EmptyState, Txt } from './ui';

export function CardPager({ cards }: { cards: Card[] }) {
  const c = useTheme();
  const [i, setI] = useState(0);

  if (!cards.length) {
    return <EmptyState icon="hourglass-outline" title="Пока пусто" subtitle="Контент ещё готовится." />;
  }
  const idx = Math.min(i, cards.length - 1);

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.md }}
        showsVerticalScrollIndicator={false}>
        <Flashcard card={cards[idx]} />
      </ScrollView>

      <View style={[styles.nav, { borderTopColor: c.border, backgroundColor: c.background }]}>
        <NavBtn icon="chevron-back" disabled={idx === 0} onPress={() => setI(idx - 1)} color={c.text} bg={c.surfaceAlt} />
        <Txt variant="h3" muted>
          {idx + 1} / {cards.length}
        </Txt>
        <NavBtn
          icon="chevron-forward"
          disabled={idx >= cards.length - 1}
          onPress={() => setI(idx + 1)}
          color={c.text}
          bg={c.surfaceAlt}
        />
      </View>
    </View>
  );
}

function NavBtn({
  icon,
  onPress,
  disabled,
  color,
  bg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  bg: string;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.navBtn,
        { backgroundColor: bg, opacity: disabled ? 0.35 : pressed ? 0.7 : 1 },
      ]}>
      <Ionicons name={icon} size={26} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    width: 56,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
